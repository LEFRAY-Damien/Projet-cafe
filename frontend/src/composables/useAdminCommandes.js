import { computed, ref } from "vue"
import api from "@/api/axios"

export function useAdminCommandes() {
  const commandes = ref([])
  const loading = ref(false)
  const error = ref("")

  const search = ref("")
  const selected = ref(null)
  const detailsLoading = ref(false)
  const detailsError = ref("")

  function setError(e) {
    error.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  function setDetailsError(e) {
    detailsError.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  async function loadCommandes() {
    loading.value = true
    error.value = ""
    try {
      const res = await api.get("/admin/commandes")
      commandes.value = res.data?.["hydra:member"] ?? res.data ?? []
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  async function openDetails(cmd) {
    detailsLoading.value = true
    detailsError.value = ""
    selected.value = null
    try {
      const url = cmd?.["@id"] || (cmd?.id ? `/api/commandes/${cmd.id}` : null)
      if (!url) throw new Error("Commande invalide (pas d'@id / id).")
      const res = await api.get(url)
      selected.value = res.data
    } catch (e) {
      setDetailsError(e)
    } finally {
      detailsLoading.value = false
    }
  }

  function closeDetails() {
    selected.value = null
    detailsError.value = ""
  }

  function formatDateTime(raw) {
    if (!raw) return "—"
    try {
      const d = new Date(raw)
      return isNaN(d.getTime()) ? String(raw) : d.toLocaleString()
    } catch {
      return String(raw)
    }
  }

  function formatDateOnly(raw) {
    if (!raw) return "—"
    try {
      const d = new Date(raw)
      return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString()
    } catch {
      return String(raw)
    }
  }

  const filteredCommandes = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return commandes.value

    return commandes.value.filter((c) => {
      const hay = [
        String(c?.id ?? ""),
        String(c?.statut ?? ""),
        String(c?.dateCommande ?? ""),
        String(c?.dateRetrait ?? ""),
      ]
        .join(" ")
        .toLowerCase()

      return hay.includes(q)
    })
  })

  return {
    commandes,
    loading,
    error,
    search,

    selected,
    detailsLoading,
    detailsError,

    loadCommandes,
    openDetails,
    closeDetails,

    filteredCommandes,
    formatDateTime,
    formatDateOnly,
  }
}
