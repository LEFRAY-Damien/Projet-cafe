import { computed, ref } from "vue"
import api from "@/api/axios"
import { useAuthStore } from "@/stores/auth"

export function useMesCommandes() {
  const auth = useAuthStore()

  const commandes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const selected = ref(null)
  const detailsLoading = ref(false)
  const detailsError = ref(null)

  const isLoggedIn = computed(() => auth.isLoggedIn)

  function authHeaders() {
    // ✅ fonctionne même si tu n'as pas d'interceptor axios
    return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
  }

  function setError(targetRef, e) {
    targetRef.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  async function loadMesCommandes() {
    if (!auth.token) return
    loading.value = true
    error.value = null

    try {
      const res = await api.get("/api/me/commandes", { headers: authHeaders() })

      // Hydra / API Platform
      commandes.value =
        res.data?.["hydra:member"] ??
        res.data?.member ??
        (Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      setError(error, e)
    } finally {
      loading.value = false
    }
  }

  async function openDetails(cmd) {
    if (!auth.token) {
      detailsError.value = "Vous devez être connecté."
      return
    }

    detailsLoading.value = true
    detailsError.value = null
    selected.value = null

    try {
      // ✅ on préfère une URL stable
      const id = cmd?.id
      const iri = cmd?.["@id"]
      const url = id ? `/api/commandes/${id}` : iri

      if (!url) throw new Error("Commande invalide (id/@id manquant)")

      const res = await api.get(url, { headers: authHeaders() })
      selected.value = res.data

      // ✅ OPTIONNEL : si l'API renvoie des IRIs dans lignes, on garde selected tel quel.
      // (On pourra ensuite enrichir si tu veux afficher le produit/quantité proprement)
    } catch (e) {
      setError(detailsError, e)
    } finally {
      detailsLoading.value = false
    }
  }

  function closeDetails() {
    selected.value = null
    detailsError.value = null
  }

  function formatDateTime(raw) {
    if (!raw) return "—"
    const d = new Date(raw)
    return isNaN(d.getTime()) ? String(raw) : d.toLocaleString()
  }

  function formatDateOnly(raw) {
    if (!raw) return "—"
    const d = new Date(raw)
    return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString()
  }

  return {
    isLoggedIn,
    commandes,
    loading,
    error,
    loadMesCommandes,

    selected,
    detailsLoading,
    detailsError,
    openDetails,
    closeDetails,

    formatDateTime,
    formatDateOnly,
  }
}
