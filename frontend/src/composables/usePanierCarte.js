import { useAuthStore } from "@/stores/auth"
import { usePanierStore } from "@/stores/panier"
import { computed, onMounted, ref } from "vue"
import api from "@/api/axios"

export function usePanierCarte() {
  const auth = useAuthStore()
  const panier = usePanierStore()

  const items = computed(() => panier.items ?? [])

  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)

  // ✅ Date retrait (YYYY-MM-DD)
  const dateRetrait = ref("")

  function toYMD(d) {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  const minDate = computed(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1) // demain
    return toYMD(d)
  })

  const maxDate = computed(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7) // +7 jours
    return toYMD(d)
  })

  function formatPrice(value) {
    const n = Number(value ?? 0)
    return n.toFixed(2).replace(".", ",")
  }

  function lineTotal(i) {
    return Number(i.price ?? 0) * Number(i.qty ?? 0)
  }

  function inc(i) {
    panier.setQty(i.productIri, Number(i.qty ?? 1) + 1)
  }

  function dec(i) {
    panier.setQty(i.productIri, Math.max(1, Number(i.qty ?? 1) - 1))
  }

  function setQty(i, raw) {
    const n = Math.floor(Number(raw))
    if (!Number.isFinite(n) || n < 1) return
    panier.setQty(i.productIri, n)
  }

  function removeItem(i) {
    panier.remove(i.productIri)
  }

  function clearPanier() {
    panier.clear()
  }

  // ✅ LE bouton utile : envoie au backend
  async function checkout() {
    error.value = null
    success.value = false

    if (items.value.length === 0) {
      error.value = "Panier vide."
      return
    }

    // ✅ validation date retrait (obligatoire + min/max)
    if (!dateRetrait.value) {
      error.value = "Choisis une date de retrait (au minimum demain)."
      return
    }
    if (dateRetrait.value < minDate.value || dateRetrait.value > maxDate.value) {
      error.value = `Date invalide : choisis entre ${minDate.value} et ${maxDate.value}.`
      return
    }

    loading.value = true
    try {
      // ✅ GARDE-FOU : évite d’envoyer un produit invalide
      for (const i of items.value) {
        if (!i.productIri || !i.productIri.startsWith("/api/produits/")) {
          error.value = "Produit invalide dans le panier (vide le panier et réessaie)."
          loading.value = false
          return
        }
      }

      const payload = {
        dateRetrait: dateRetrait.value, // ✅ "YYYY-MM-DD"
        lignes: items.value.map((i) => ({
          produit: i.productIri,
          quantite: i.qty,
          prixUnitaire: i.price,
        })),
      }

      const res = await api.post("/api/commandes", payload)

      const iri = res.data?.["@id"] || null
      if (iri && panier.markSent) panier.markSent(iri)

      success.value = true
      panier.clear()

      // optionnel : reset date
      dateRetrait.value = ""
    } catch (e) {
      console.error("CHECKOUT ERROR", e)

      if (e.response) {
        console.error("STATUS", e.response.status)
        console.error("DATA", e.response.data)
        error.value =
          `Erreur API ${e.response.status}: ` +
          (typeof e.response.data === "string"
            ? e.response.data
            : JSON.stringify(e.response.data))
      } else {
        error.value = "Erreur réseau (pas de réponse du serveur)."
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await auth.init()

    // ✅ pré-remplir la date avec "demain"
    if (!dateRetrait.value) dateRetrait.value = minDate.value
  })

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

    // ✅ expose date + min/max pour la vue
    dateRetrait,
    minDate,
    maxDate,
  }
}
