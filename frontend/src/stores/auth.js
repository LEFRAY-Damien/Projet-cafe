import { defineStore } from "pinia"
import api from "../api/axios"

// (Optionnel) tu pourras supprimer decodeJWT + email plus tard
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
    user: null,

    loadingUser: false,
    userLoaded: false,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    userId: (s) => s.user?.id ?? null,
    favoris: (s) => s.user?.favoris ?? [],

    isAdmin: (s) => {
      // 1) si user chargé, on utilise ses rôles
      if (s.user?.roles?.includes("ROLE_ADMIN")) return true

      // 2) sinon fallback sur le token (souvent contient roles)
      if (!s.token) return false
      try {
        const payload = JSON.parse(atob(s.token.split(".")[1]))
        const roles = Array.isArray(payload?.roles) ? payload.roles : []
        return roles.includes("ROLE_ADMIN")
      } catch {
        return false
      }
    },
  },

  actions: {
    async login(email, password) {
      try {
        const res = await api.post("/api/login_check", { email, password })
        this.token = res.data.token
        localStorage.setItem("token", this.token)

        const decoded = decodeJWT(this.token)
        this.email = decoded?.username ?? email

        await this.fetchMe(true)
      } catch (e) {
        // ✅ safe : si login échoue, on s'assure d'être "clean"
        this.token = null
        this.email = null
        this.user = null
        this.loadingUser = false
        this.userLoaded = false
        localStorage.removeItem("token")
        throw e
      }
    },

    async fetchMe(force = false) {
      if (!this.token) {
        this.user = null
        this.userLoaded = false
        return
      }

      if (!force && (this.loadingUser || this.userLoaded)) return

      this.loadingUser = true

      try {
        // 🔐 sécurité : récupérer l’email depuis le token si absent (refresh page)
        if (!this.email && this.token) {
          const decoded = decodeJWT(this.token)
          this.email = decoded?.username ?? null
        }

        const res = await api.get("/api/me")
        this.user = res.data
        this.userLoaded = true
      } catch (e) {
        const status = e?.response?.status

        // ⚠️ on NE SUPPRIME PAS le token ici (comme tu voulais)
        if (status === 401 || status === 403) {
          console.warn("fetchMe() non autorisé : profil non récupérable via /api/me.")
          this.user = null
          this.userLoaded = false
          return
        }

        console.warn("fetchMe() a échoué :", e)
        this.user = null
        this.userLoaded = false
      } finally {
        this.loadingUser = false
      }
    },

    async init() {
      if (!this.token) return
      if (this.userLoaded || this.loadingUser) return

      try {
        await this.fetchMe()
      } catch (e) {
        console.warn("auth.init() a échoué :", e)
      }
    },

    // ✅ déjà parfait : safe + reset complet
    logout() {
      this.token = null
      this.email = null
      this.user = null
      this.loadingUser = false
      this.userLoaded = false
      localStorage.removeItem("token")
    },
  },
})
