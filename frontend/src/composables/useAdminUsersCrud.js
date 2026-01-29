import { computed, reactive, ref } from "vue"
import api from "@/api/axios"

export function useAdminUsersCrud() {
  const users = ref([])

  const loading = ref(false)
  const error = ref("")

  const search = ref("")
  const sortKey = ref("id")
  const sortDir = ref("asc")

  const mode = ref("edit") // on fait surtout "edit" (pas de création pour l’instant)
  const form = reactive({
    id: null,
    iri: null,

    email: "",
    nom: "",
    prenom: "",
    whatsapp: "",
    isActive: true,

    // UI: string "ROLE_USER,ROLE_ADMIN" => array API
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

  async function loadUsers() {
    loading.value = true
    error.value = ""
    try {
      const res = await api.get("/api/users")
      const data = res.data

      users.value = Array.isArray(data)
        ? data
        : (data?.member ?? data?.["hydra:member"] ?? [])

      console.log("DEBUG users.value =", users.value)
      console.log("DEBUG first user =", users.value?.[0])
      console.log("DEBUG keys =", Object.keys(users.value?.[0] || {}))
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }


  function editUser(u) {
    mode.value = "edit"
    form.id = u.id ?? null
    form.iri = u["@id"] ?? null

    form.email = u.email ?? ""
    form.nom = u.nom ?? ""
    form.prenom = u.prenom ?? ""
    form.whatsapp = u.whatsapp ?? ""
    form.isActive = typeof u.isActive === "boolean" ? u.isActive : true

    const roles = Array.isArray(u.roles) ? u.roles : []
    // ton getRoles ajoute ROLE_USER automatiquement côté PHP, mais l’API peut renvoyer roles sans ROLE_USER.
    // on normalise juste pour l’UI.
    const normalized = roles.length ? roles : ["ROLE_USER"]
    form.rolesText = normalized.join(",")
  }

  function parseRoles(text) {
    const roles = String(text || "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
    // on s’assure que ROLE_USER existe
    if (!roles.includes("ROLE_USER")) roles.push("ROLE_USER")
    // unique
    return [...new Set(roles)]
  }

  function validate() {
    if (!String(form.email).trim()) return "Email obligatoire."
    if (!String(form.nom).trim()) return "Nom obligatoire."
    if (!String(form.prenom).trim()) return "Prénom obligatoire."
    return ""
  }

  async function submitForm() {
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
        isActive: !!form.isActive,
        roles: parseRoles(form.rolesText),
      }

      const url = form.iri || `/api/users/${form.id}`
      // PUT: remplace les champs (sans password)
      await api.put(url, payload)


      resetForm()
      await loadUsers()
    } catch (e) {
      console.error("SUBMIT ERROR:", e?.response?.status, e?.response?.data || e)
      setError(e)
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(u) {
    loading.value = true
    error.value = ""

    const url = u["@id"] || `/api/users/${u.id}`
    console.log("TOGGLE URL:", url, "current:", u.isActive, "next:", !u.isActive)

    try {
      // 1) tentative PATCH merge-patch
      try {
        await api.patch(
          url,
          { isActive: !u.isActive },
          { headers: { "Content-Type": "application/merge-patch+json" } }
        )
      } catch (e) {
        console.warn("PATCH failed:", e?.response?.status, e?.response?.data || e)

        // fallback PUT
        const payload = {
          email: u.email ?? "",
          nom: u.nom ?? "",
          prenom: u.prenom ?? "",
          whatsapp: u.whatsapp ?? null,
          isActive: !u.isActive,
          roles: Array.isArray(u.roles) ? u.roles : ["ROLE_USER"],
        }

        await api.put(url, payload)
      }

      await loadUsers()
    } catch (e) {
      console.error("TOGGLE ERROR:", e?.response?.status, e?.response?.data || e)
      setError(e)
    } finally {
      loading.value = false
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
