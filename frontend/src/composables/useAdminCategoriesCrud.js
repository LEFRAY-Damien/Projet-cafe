import { computed, reactive, ref } from "vue"
import api from "@/api/axios"

export function useAdminCategoriesCrud() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref("")

  const search = ref("")
  const sortKey = ref("id")
  const sortDir = ref("asc")

  const mode = ref("create")
  const form = reactive({
    id: null,
    iri: null,
    nom: "",
  })

  function resetForm() {
    mode.value = "create"
    form.id = null
    form.iri = null
    form.nom = ""
  }

  function setError(e) {
    error.value =
      e?.response?.data?.["hydra:description"] ||
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  async function loadCategories() {
    loading.value = true
    error.value = ""
    try {
      const res = await api.get("/api/categories")
      const data = res.data
      categories.value = Array.isArray(data) ? data : (data?.member ?? data?.["hydra:member"] ?? [])


    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  function editCategorie(c) {
    mode.value = "edit"
    form.id = c.id ?? null
    form.iri = c["@id"] ?? null
    form.nom = c.nom ?? ""
  }

  async function removeCategorie(c) {
    if (!confirm("Supprimer cette catégorie ?")) return
    loading.value = true
    error.value = ""
    try {
      const url = c["@id"] || `/api/categories/${c.id}`
      await api.delete(url)
      await loadCategories()
      if (mode.value === "edit" && (form.id === c.id || form.iri === c["@id"])) resetForm()
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  function validate() {
    if (!String(form.nom).trim()) return "Le nom est obligatoire."
    return ""
  }

  async function submitForm() {
    const msg = validate()
    if (msg) return alert(msg)

    loading.value = true
    error.value = ""
    try {
      const payload = { nom: String(form.nom).trim() }

      if (mode.value === "create") {
        await api.post("/api/categories", payload)
      } else {
        const url = form.iri || `/api/categories/${form.id}`
        await api.put(url, payload)
      }

      resetForm()
      await loadCategories()
    } catch (e) {
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

  const filteredSortedCategories = computed(() => {
    const q = search.value.trim().toLowerCase()
    let arr = Array.isArray(categories.value) ? categories.value : []


    if (q) {
      arr = arr.filter((c) => String(c.nom ?? "").toLowerCase().includes(q))
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

  return {
    categories,
    loading,
    error,
    search,
    sortKey,
    sortDir,
    mode,
    form,
    filteredSortedCategories,
    resetForm,
    loadCategories,
    editCategorie,
    removeCategorie,
    submitForm,
    toggleSort,
  }
}
