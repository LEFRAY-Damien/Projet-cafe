import { defineStore } from "pinia"
import api from "../api/axios"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    email: null, // optionnel
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
  },

  actions: {
    async login(email, password) {
      const res = await api.post("/api/login_check", { email, password })
      this.token = res.data.token
      this.email = email
      localStorage.setItem("token", this.token)
    },

    logout() {
      this.token = null
      this.email = null
      localStorage.removeItem("token")
    },
  },
})
