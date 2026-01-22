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
    email: null, // plus nécessaire avec /api/me (tu pourras supprimer)
    user: null,

    loadingUser: false,
    userLoaded: false,
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

      // optionnel : tu peux garder, mais non requis
      const decoded = decodeJWT(this.token)
      this.email = decoded?.username ?? email

      // ✅ charge le profil via /api/me
      await this.fetchMe(true)
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
        const res = await api.get("/api/me")
        this.user = res.data
        this.userLoaded = true
      } catch (e) {
        const status = e?.response?.status
        if (status === 401) {
          this.token = null
          this.email = null
          this.user = null
          this.userLoaded = false
          localStorage.removeItem("token")
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
