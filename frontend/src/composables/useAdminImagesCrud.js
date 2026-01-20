import { computed, reactive, ref } from "vue"
import axios from "axios"

export function useAdminImagesCrud() {
  const images = ref([])
  const produits = ref([])

  const loading = ref(false)
  const error = ref("")

  const search = ref("")
  const sortKey = ref("id")
  const sortDir = ref("asc")

  const mode = ref("create") // create | edit
  const form = reactive({
    id: null,
    iri: null,
    url: "",
    alt: "",
    produitIri: "",
  })

  function resetForm() {
    mode.value = "create"
    form.id = null
    form.iri = null
    form.url = ""
    form.alt = ""
    form.produitIri = ""
  }

  function setError(e) {
    error.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  async function loadProduits() {
    const res = await axios.get("/api/produits")
    produits.value = res.data?.["hydra:member"] ?? res.data ?? []
  }

  async function loadImages() {
    const res = await axios.get("/api/images")
    images.value = res.data?.["hydra:member"] ?? res.data ?? []
  }

  async function init() {
    loading.value = true
    error.value = ""
    try {
      await Promise.all([loadProduits(), loadImages()])
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  function editImage(img) {
    mode.value = "edit"
    form.id = img.id ?? null
    form.iri = img["@id"] ?? null

    form.url = img.url ?? ""
    form.alt = img.alt ?? ""

    if (typeof img.produit === "string") form.produitIri = img.produit
    else form.produitIri = img.produit?.["@id"] ?? ""
  }

  async function removeImage(img) {
    if (!confirm("Supprimer cette image ?")) return
    loading.value = true
    error.value = ""
    try {
      const url = img["@id"] || `/api/images/${img.id}`
      await axios.delete(url)
      await loadImages()
      if (mode.value === "edit" && (form.id === img.id || form.iri === img["@id"])) resetForm()
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  function validate() {
    const u = String(form.url).trim()
    if (!u) return "L'URL est obligatoire."
    if (!/^https?:\/\//i.test(u) && !u.startsWith("/")) {
      return "L'URL doit commencer par http(s):// ou /"
    }
    if (!form.produitIri) return "Le produit est obligatoire."
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
        url: String(form.url).trim(),
        alt: String(form.alt).trim() || null,
        produit: form.produitIri,
      }

      if (mode.value === "create") {
        await axios.post("/api/images", payload)
      } else {
        const url = form.iri || `/api/images/${form.id}`
        await axios.put(url, payload) // PUT (comme tes autres entités)
      }

      resetForm()
      await loadImages()
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

  const filteredSortedImages = computed(() => {
    const q = search.value.trim().toLowerCase()
    let arr = images.value

    if (q) {
      arr = arr.filter((i) => {
        const url = String(i.url ?? "").toLowerCase()
        const alt = String(i.alt ?? "").toLowerCase()
        return url.includes(q) || alt.includes(q)
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

  function produitLabel(img) {
    const val = img?.produit
    const iri = typeof val === "string" ? val : val?.["@id"]
    const p = produits.value.find((x) => x["@id"] === iri)
    return p?.nom ?? "—"
  }

  return {
    produits,
    images,
    loading,
    error,
    search,
    sortKey,
    sortDir,
    mode,
    form,
    filteredSortedImages,
    init,
    resetForm,
    editImage,
    removeImage,
    submitForm,
    toggleSort,
    produitLabel,
  }
}
