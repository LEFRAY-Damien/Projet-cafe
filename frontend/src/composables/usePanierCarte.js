import { computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePanierStore } from "@/stores/panier";

export function usePanierCarte() {
  const auth = useAuthStore();
  const panier = usePanierStore();

  const items = computed(() => panier.items ?? []);

  function formatPrice(value) {
    const n = Number(value ?? 0);
    return n.toFixed(2).replace(".", ",");
  }

  function lineTotal(i) {
    return Number(i.price ?? 0) * Number(i.qty ?? 0);
  }

  function inc(i) {
    const next = Number(i.qty ?? 1) + 1;
    panier.setQty(i.productIri, next);
  }

  function dec(i) {
    const next = Math.max(1, Number(i.qty ?? 1) - 1);
    panier.setQty(i.productIri, next);
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

  onMounted(async () => {
    // pour être cohérent avec tes autres pages : auth.init() au montage
    // (si déjà initialisé, ça ne casse rien)
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
  };
}
