import { useAuthStore } from "@/stores/auth";
import { usePanierStore } from "@/stores/panier";
import { computed, onMounted, ref } from "vue";
import api from "@/api/axios";

export function usePanierCarte() {
  const auth = useAuthStore();
  const panier = usePanierStore();

  const items = computed(() => panier.items ?? []);

  const loading = ref(false);
  const error = ref(null);
  const success = ref(false);

  function formatPrice(value) {
    const n = Number(value ?? 0);
    return n.toFixed(2).replace(".", ",");
  }

  function lineTotal(i) {
    return Number(i.price ?? 0) * Number(i.qty ?? 0);
  }

  function inc(i) {
    panier.setQty(i.productIri, Number(i.qty ?? 1) + 1);
  }

  function dec(i) {
    panier.setQty(i.productIri, Math.max(1, Number(i.qty ?? 1) - 1));
  }

  function setQty(i, raw) {
    const n = Math.floor(Number(raw));
    if (!Number.isFinite(n) || n < 1) return;
    panier.setQty(i.productIri, n);
  }

  function removeItem(i) {
    panier.remove(i.productIri);
  }

  function clearPanier() {
    panier.clear();
  }

  // ✅ LE bouton utile : envoie au backend
  async function checkout() {
    error.value = null;
    success.value = false;

    if (items.value.length === 0) {
      error.value = "Panier vide.";
      return;
    }

    loading.value = true;
    try {
      const payload = {
        lignes: items.value.map((i) => ({
          produit: i.productIri,
          quantite: i.qty,
          prixUnitaire: i.price,
        })),
      };

      // ✅ GARDE-FOU : évite d’envoyer un produit invalide
      for (const i of items.value) {
        if (!i.productIri || !i.productIri.startsWith("/api/produits/")) {
          error.value = "Produit invalide dans le panier (vide le panier et réessaie).";
          loading.value = false;
          return;
        }
      }

      const res = await api.post("/api/commandes", payload);

      const iri = res.data?.["@id"] || null;
      if (iri && panier.markSent) panier.markSent(iri);

      success.value = true;
      panier.clear();
    } catch (e) {
      console.error("CHECKOUT ERROR", e);

      // Si le serveur a répondu (400/401/500...), axios met ça dans e.response
      if (e.response) {
        console.error("STATUS", e.response.status);
        console.error("DATA", e.response.data);
        error.value = `Erreur API ${e.response.status}: ` + (typeof e.response.data === "string"
          ? e.response.data
          : JSON.stringify(e.response.data));
      } else {
        // Si pas de réponse (réseau/CORS), on garde un message simple
        error.value = "Erreur réseau (pas de réponse du serveur).";
      }
    }
    finally {
      loading.value = false;
    }
  }


  onMounted(async () => {
    await auth.init();
  });

  return {
    auth,
    panier,
    items,
    formatPrice,
    lineTotal,
    inc,
    dec,
    setQty,
    removeItem,
    clearPanier,
    checkout,
    loading,
    error,
    success,
  };
}
