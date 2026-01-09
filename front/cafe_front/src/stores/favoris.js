import { defineStore } from "pinia";
import api from "../api/axios";
import { useAuthStore } from "@/stores/auth";

export const useFavorisStore = defineStore("favoris", {
  actions: {
    isFav(productIri) {
      const auth = useAuthStore();
      return auth.favoris.includes(productIri);
    },

    async toggle(productIri) {
      const auth = useAuthStore();
      if (!auth.isLogged || !auth.userId) return;

      const current = auth.favoris.slice();
      const next = current.includes(productIri)
        ? current.filter((x) => x !== productIri)
        : [...current, productIri];

      // PATCH user
      await api.patch(
        `/api/users/${auth.userId}`,
        { favoris: next },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );

      // MAJ locale
      auth.user = { ...auth.user, favoris: next };
    },
  },
});
