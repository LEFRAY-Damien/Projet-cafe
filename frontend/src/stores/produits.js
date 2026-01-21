import { defineStore } from "pinia";
import api from "../api/axios";

export const useProduitsStore = defineStore("produits", {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchProduits() {
      this.loading = true;
      this.error = null;

      try {
        const res = await api.get("/api/produits", {
          headers: { Accept: "application/ld+json" },
        });

        const data = res.data;

        // supporte Hydra ET JSON-LD avec "member"
        this.items = Array.isArray(data)
          ? data
          : (data["hydra:member"] ?? data.member ?? []);
      } catch (e) {
        this.error =
          e?.response?.data?.["hydra:description"] ||
          e?.response?.data?.detail ||
          e?.message ||
          "Erreur lors du chargement des produits";
      } finally {
        this.loading = false;
      }
    },
  },
});
