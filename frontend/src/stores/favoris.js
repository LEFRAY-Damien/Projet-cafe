import { defineStore } from "pinia"
import api from "../api/axios"
import { useAuthStore } from "@/stores/auth"

export const useFavorisStore = defineStore("favoris", {
  state: () => ({
    ids: new Set(),
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

        const raw =
          data?.["hydra:member"] ??
          data?.member ??
          data?.items ??
          data ??
          []

        const favoris = Array.isArray(raw)
          ? raw.map((f) => (typeof f === "string" ? f : f?.["@id"])).filter(Boolean)
          : []

        this.ids = new Set(favoris)
        this.loaded = true
      } catch (e) {
        console.error("Erreur chargement favoris :", e)
        this.ids = new Set()
        this.loaded = false
      } finally {
        this.loading = false
      }
    },

    async add(productIri, productId) {
      try {
        await api.post(`/api/me/favoris/${productId}`, {})
        this.ids = new Set([...this.ids, productIri])
      } catch (e) {
        console.error("Erreur ajout favori :", e)
      }
    },

    async remove(productIri, productId) {
      try {
        await api.delete(`/api/me/favoris/${productId}`)
        const next = new Set(this.ids)
        next.delete(productIri)
        this.ids = next
      } catch (e) {
        console.error("Erreur suppression favori :", e)
      }
    },

    async toggle(productIri, productId) {
      const auth = useAuthStore()

      if (!auth.isLoggedIn) return
      if (!productId) return

      if (this.ids.has(productIri)) {
        await this.remove(productIri, productId)
      } else {
        await this.add(productIri, productId)
      }
    },

    reset() {
      this.ids = new Set()
      this.loaded = false
      this.loading = false
    },
  },
})