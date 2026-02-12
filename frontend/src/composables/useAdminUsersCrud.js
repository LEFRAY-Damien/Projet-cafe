import { computed, reactive, ref } from "vue"
import api from "@/api/axios"

export function useAdminUsersCrud() {
  const users = ref([])

  const loading = ref(false)
  const error = ref("")

  // ✅ suppression admin
  const deleting = ref(false)
  const deletingId = ref(null)
  const deleteError = ref("")

  const search = ref("")
  const sortKey = ref("id")
  const sortDir = ref("asc")

  const mode = ref("edit")
  const form = reactive({
    id: null,
    iri: null,

    email: "",
    nom: "",
    prenom: "",
    whatsapp: "",
    isActive: true,

    rolesText: "ROLE_USER",
  })

  function resetForm() {
    mode.value = "edit"
    form.id = null
    form.iri = null
    form.email = ""
    form.nom = ""
    form.prenom = ""
    form.whatsapp = ""
    form.isActive = true
    form.rolesText = "ROLE_USER"
  }

  function setError(e) {
    error.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  function setDeleteError(e) {
    deleteError.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur lors de la suppression"
  }

  async function loadUsers() {
    loading.value = true
    error.value = ""
    deleteError.value = ""
    try {
      const res = await api.get("/api/users")
      const data = res.data

      users.value = Array.isArray(data)
        ? data
        : (data?.member ?? data?.["hydra:member"] ?? [])

      // ✅ Normalisation : certaines API renvoient "active" au lieu de "isActive"
      users.value = users.value.map((u) => ({
        ...u,
        isActive:
          typeof u.isActive === "boolean"
            ? u.isActive
            : (typeof u.active === "boolean" ? u.active : true),
      }))
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }


  function editUser(u) {
    // ✅ si déjà supprimé, on ne permet pas l’édition
    if (u?.isActive === false) return

    mode.value = "edit"
    form.id = u.id ?? null
    form.iri = u["@id"] ?? null

    form.email = u.email ?? ""
    form.nom = u.nom ?? ""
    form.prenom = u.prenom ?? ""
    form.whatsapp = u.whatsapp ?? ""
    form.isActive = typeof u.isActive === "boolean" ? u.isActive : true

    const roles = Array.isArray(u.roles) ? u.roles : []
    const normalized = roles.length ? roles : ["ROLE_USER"]
    form.rolesText = normalized.join(",")
  }

  function parseRoles(text) {
    const roles = String(text || "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
    if (!roles.includes("ROLE_USER")) roles.push("ROLE_USER")
    return [...new Set(roles)]
  }

  function validate() {
    if (!String(form.email).trim()) return "Email obligatoire."
    if (!String(form.nom).trim()) return "Nom obligatoire."
    if (!String(form.prenom).trim()) return "Prénom obligatoire."
    return ""
  }

  async function submitForm() {
    // ✅ si déjà supprimé, on bloque
    if (form.isActive === false) {
      alert("Ce compte est supprimé (désactivé). Modification impossible.")
      return
    }

    const msg = validate()
    if (msg) {
      alert(msg)
      return
    }

    loading.value = true
    error.value = ""
    try {
      const payload = {
        email: String(form.email).trim(),
        nom: String(form.nom).trim(),
        prenom: String(form.prenom).trim(),
        whatsapp: form.whatsapp ? String(form.whatsapp).trim() : null,
        active: !!form.isActive,
        isActive: !!form.isActive,

        roles: parseRoles(form.rolesText),
      }

      const url = form.iri || `/api/users/${form.id}`
      await api.put(url, payload)

      resetForm()
      await loadUsers()
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(u) {
    loading.value = true
    error.value = ""

    const url = u["@id"] || `/api/users/${u.id}`

    // ✅ on prend "active" si présent, sinon "isActive"
    const current =
      typeof u.active === "boolean"
        ? u.active
        : (typeof u.isActive === "boolean" ? u.isActive : true)

    const next = !current

    try {
      await api.patch(
        url,
        { active: next, isActive: next }, // on envoie les deux, l'API prendra celui qu'elle connaît
        { headers: { "Content-Type": "application/merge-patch+json" } }
      )

      // ✅ mise à jour immédiate de la liste (sinon 2e clic bug)
      const idx = users.value.findIndex((x) => x.id === u.id)
      if (idx !== -1) {
        users.value[idx] = { ...users.value[idx], active: next, isActive: next }
      }

      // ✅ si le user est actuellement dans le formulaire d'édition, on met à jour la checkbox aussi
      if (form.id === u.id) {
        form.isActive = next
      }
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }




  // ✅ DELETE admin : soft delete via API Platform
  async function softDeleteUser(u) {
    deleteError.value = ""

    if (!u?.id) {
      deleteError.value = "User id manquant."
      return
    }

    if (u.isActive === false) return

    const ok = confirm(
      `⚠️ Supprimer (désactiver) ce compte ?\n\nEmail: ${u.email}\n\n` +
      "- Compte désactivé\n" +
      "- Données anonymisées\n" +
      "- Email libéré\n" +
      "- Favoris supprimés\n" +
      "- Commandes en_attente / prete annulées\n\n" +
      "Continuer ?"
    )
    if (!ok) return

    deleting.value = true
    deletingId.value = u.id

    try {
      await api.delete(`/api/users/${u.id}`)
      // refresh
      await loadUsers()
      // si on éditait ce user, on reset
      if (form.id === u.id) resetForm()
    } catch (e) {
      setDeleteError(e)
    } finally {
      deleting.value = false
      deletingId.value = null
    }
  }

  function toggleSort(key) {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === "asc" ? "desc" : "asc"
    } else {
      sortKey.value = key
      sortDir.value = "asc"
    }
  }

  const filteredSortedUsers = computed(() => {
    const q = search.value.trim().toLowerCase()
    let arr = Array.isArray(users.value) ? users.value : []

    if (q) {
      arr = arr.filter((u) => {
        const hay = [
          String(u.id ?? ""),
          String(u.email ?? ""),
          String(u.nom ?? ""),
          String(u.prenom ?? ""),
          String(u.whatsapp ?? ""),
          Array.isArray(u.roles) ? u.roles.join(" ") : "",
          String(u.isActive ?? ""),
        ]
          .join(" ")
          .toLowerCase()
        return hay.includes(q)
      })
    }

    const dir = sortDir.value === "asc" ? 1 : -1
    return [...arr].sort((a, b) => {
      const va = a[sortKey.value]
      const vb = b[sortKey.value]
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
  })

  function rolesLabel(u) {
    const roles = Array.isArray(u.roles) ? u.roles : []
    return roles.length ? roles.join(", ") : "—"
  }

  return {
    users,
    loading,
    error,

    // ✅ delete
    deleting,
    deletingId,
    deleteError,
    softDeleteUser,

    search,
    sortKey,
    sortDir,
    mode,
    form,

    filteredSortedUsers,
    rolesLabel,

    resetForm,
    loadUsers,
    editUser,
    submitForm,
    toggleActive,
    toggleSort,
  }
}
