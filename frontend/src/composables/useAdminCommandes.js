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
      "Erreur inconnue"
  }

  function getTokenOrThrow() {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Token manquant (non connecté ?)")
    return token
  }

  async function loadCommandes() {
    loading.value = true
    error.value = ""

    try {
      const token = getTokenOrThrow()

      const res = await api.get("/api/admin/commandes", {
        headers: { Authorization: `Bearer ${token}` },
      })

      commandes.value = res.data?.["hydra:member"] ?? res.data?.member ?? res.data ?? []
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
      const token = getTokenOrThrow()

      // cmd["@id"] = "/api/admin/commandes/5"
      const iri = cmd?.["@id"] ?? (cmd?.id ? `/api/admin/commandes/${cmd.id}` : null)
      if (!iri) throw new Error("Commande invalide (pas d'@id / id)")

      const res = await api.get(iri, {
        headers: { Authorization: `Bearer ${token}` },
      })

      selected.value = res.data
    } catch (e) {
      setDetailsError(e)
    } finally {
      detailsLoading.value = false
    }
  }

  // ✅ SUPPRESSION ADMIN
  async function removeCommande(cmd) {
    error.value = ""
    detailsError.value = ""

    try {
      const token = getTokenOrThrow()

      const iri = cmd?.["@id"] ?? (cmd?.id ? `/api/admin/commandes/${cmd.id}` : null)
      if (!iri) throw new Error("Commande invalide (pas d'@id / id)")

      // supprime côté API
      await api.delete(iri, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // MAJ liste locale
      const id = cmd?.id ?? selected.value?.id
      if (id != null) {
        commandes.value = commandes.value.filter((c) => c.id !== id)
      }

      // fermer le détail si c'est la commande affichée
      if (selected.value && (selected.value.id === id)) {
        selected.value = null
      }
    } catch (e) {
      setError(e)
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
    removeCommande, // ✅ EXPORT

    filteredCommandes,
    formatDateTime,
    formatDateOnly,
  }
}
