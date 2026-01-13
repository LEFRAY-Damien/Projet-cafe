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

      const res = await api.get(`/api/users?email=${this.email}`)
      const users = res.data["hydra:member"]

      if (users.length > 0) {
        this.user = users[0]
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
