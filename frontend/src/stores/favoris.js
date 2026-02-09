import { defineStore } from "pinia"
import api from "../api/axios"
import { useAuthStore } from "@/stores/auth"

export const useFavorisStore = defineStore("favoris", {
  state: () => ({
    ids: new Set(), // Set d'IRI produits: "/api/produits/12"
    loaded: false,
    loading: false,
  }),

  actions: {
    isFav(productIri) {
      return this.ids.has(productIri)
    },

    async load(force = false) {
      const auth = useAuthStore()

      if (!auth.isLoggedIn) {
        this.reset()
        return
      }

      if (!force && (this.loaded || this.loading)) return

      this.loading = true
      try {
        const { data } = await api.get("/api/me/favoris")
        this.ids = new Set(data.items || [])
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async add(productIri, productId) {
      await api.post(`/api/me/favoris/${productId}`)
      this.ids.add(productIri)
    },

    async remove(productIri, productId) {
      await api.delete(`/api/me/favoris/${productId}`)
      this.ids.delete(productIri)
    },

    async toggle(productIri, productId) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) return

      if (this.ids.has(productIri)) return this.remove(productIri, productId)
      return this.add(productIri, productId)
    },

    reset() {
      this.ids = new Set()
      this.loaded = false
      this.loading = false
    },
  },
})
