import { defineStore } from "pinia"
import api from "../api/axios"

// Décode le payload JWT (Base64)
function decodeJWT(token) {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    email: null,
    user: null,   // objet API Platform
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    userId: (s) => s.user?.id ?? null,
    favoris: (s) => s.user?.favoris ?? [],
    isAdmin: (s) => s.user?.roles?.includes("ROLE_ADMIN") ?? false,
  },

  actions: {
    async login(email, password) {
      const res = await api.post("/api/login_check", { email, password })
      this.token = res.data.token
      localStorage.setItem("token", this.token)

      // 1️⃣ On lit l'email depuis le JWT
      const decoded = decodeJWT(this.token)
      this.email = decoded?.username ?? email

      // 2️⃣ On charge le user API
      await this.loadUser()
    },

    async loadUser() {
      if (!this.email) return

      try {
        const res = await api.get(`/api/users?email=${encodeURIComponent(this.email)}`)

        // API Platform peut renvoyer "hydra:member" ou "member"
        const users = res.data["hydra:member"] ?? res.data["member"] ?? []

        if (users.length === 0) {
          this.user = null
          return
        }

        const u = users[0]

        // Si l'API renvoie une représentation minimale (juste @id),
        // on charge le détail de l'utilisateur avec un 2e GET
        if (u?.["@id"]) {
          const detail = await api.get(u["@id"])
          this.user = detail.data
        } else {
          this.user = u
        }
      } catch (e) {
        // ✅ IMPORTANT : ne jamais casser l'app si le user n'est pas accessible
        const status = e?.response?.status

        if (status === 401) {
          // Token invalide/expiré ou endpoint protégé : on nettoie et on continue "déconnecté"
          this.token = null
          this.email = null
          this.user = null
          localStorage.removeItem("token")
          return
        }

        // Autres erreurs : on n'empêche pas l'app de tourner
        console.warn("loadUser() a échoué :", e)
        this.user = null
      }
    },

    async init() {
      if (!this.token) return

      const decoded = decodeJWT(this.token)
      this.email = decoded?.username ?? null

      if (!this.email) return

      // ✅ On évite toute erreur non gérée au démarrage
      try {
        await this.loadUser()
      } catch (e) {
        console.warn("auth.init() a échoué :", e)
      }
    },

    logout() {
      this.token = null
      this.email = null
      this.user = null
      localStorage.removeItem("token")
    },
  },
})
