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
        const { data } = await api.get("/api/produits");

        // API Platform peut renvoyer "hydra:member" OU "member"
        this.items = data["hydra:member"] ?? data["member"] ?? [];
      } catch (e) {
        this.items = [];
        this.error =
          e?.response?.data?.detail ||
          e?.message ||
          "Erreur chargement produits";
      } finally {
        this.loading = false;
      }
    }

  },
});
