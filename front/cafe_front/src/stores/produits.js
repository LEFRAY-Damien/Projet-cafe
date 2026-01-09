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
        // API Platform: data["hydra:member"] si Hydra activé
        this.items = data["hydra:member"] ?? data;
      } catch (e) {
        this.error = e?.message ?? "Erreur chargement produits";
      } finally {
        this.loading = false;
      }
    },
  },
});
