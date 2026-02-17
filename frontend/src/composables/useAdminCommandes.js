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

  // ✅ NEW: toggle "à faire seulement"
  const showOnlyTodo = ref(true)

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

  // ✅ helpers user (affichage + recherche)
  function userLabel(u) {
    if (!u) return "—"
    const full = `${u?.prenom ?? ""} ${u?.nom ?? ""}`.trim()
    if (full) return full
    return u?.email ?? "—"
  }

  function userEmail(u) {
    return u?.email ?? "—"
  }

  function userIsDeleted(u) {
    // après soft delete: isActive=false, email devient deleted+...
    return u?.isActive === false
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

  async function updateStatut(cmd, newStatut) {
    error.value = ""

    try {
      const token = getTokenOrThrow()

      const id = cmd?.id
      const iri = cmd?.["@id"] ?? (id ? `/api/admin/commandes/${id}` : null)
      if (!iri) throw new Error("Commande invalide (pas d'@id / id)")

      const res = await api.patch(
        iri,
        { statut: newStatut },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/merge-patch+json",
          },
        }
      )

      // ✅ 1) MAJ immédiate côté UI (même si API renvoie 204)
      // MAJ selected (si le détail est ouvert)
      if (selected.value?.id === id) {
        selected.value = { ...selected.value, statut: newStatut }
      }

      // MAJ liste locale
      const idx = commandes.value.findIndex((c) => c.id === id)
      if (idx !== -1) commandes.value[idx] = { ...commandes.value[idx], statut: newStatut }

      // ✅ 2) Si l'API renvoie un JSON complet (200), on remplace proprement
      // (sinon on garde la MAJ locale)
      if (res?.data && typeof res.data === "object" && Object.keys(res.data).length > 0) {
        if (selected.value?.id === id) selected.value = res.data
        if (idx !== -1) commandes.value[idx] = { ...commandes.value[idx], ...res.data }
      }
      await loadCommandes()
    } catch (e) {
      setError(e)
    }
  }


  async function removeCommande(cmd) {
    error.value = ""
    detailsError.value = ""

    try {
      const token = getTokenOrThrow()

      const iri = cmd?.["@id"] ?? (cmd?.id ? `/api/admin/commandes/${cmd.id}` : null)
      if (!iri) throw new Error("Commande invalide (pas d'@id / id)")

      await api.delete(iri, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const id = cmd?.id ?? selected.value?.id
      if (id != null) {
        commandes.value = commandes.value.filter((c) => c.id !== id)
      }

      if (selected.value && selected.value.id === id) {
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
      const u = c?.user

      const hay = [
        String(c?.id ?? ""),
        String(c?.statut ?? ""),
        String(c?.dateCommande ?? ""),
        String(c?.dateRetrait ?? ""),

        // recherche client
        String(u?.prenom ?? ""),
        String(u?.nom ?? ""),
        String(u?.email ?? ""),
        String(u?.isActive ?? ""),
      ]
        .join(" ")
        .toLowerCase()

      return hay.includes(q)
    })
  })

  // ✅ NEW: visible selon toggle
  const visibleCommandes = computed(() => {
    const base = filteredCommandes.value
    if (!showOnlyTodo.value) return base
    return base.filter((c) => ["en_attente", "prete"].includes(c?.statut))
  })

  // ✅ NEW: compteur "à faire"
  const todoCount = computed(() => {
    return commandes.value.filter((c) => ["en_attente", "prete"].includes(c?.statut)).length
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
    removeCommande,
    updateStatut,

    // ✅ NEW
    showOnlyTodo,
    visibleCommandes,
    todoCount,

    // keep
    filteredCommandes,
    formatDateTime,
    formatDateOnly,

    // helpers user
    userLabel,
    userEmail,
    userIsDeleted,
  }
}
