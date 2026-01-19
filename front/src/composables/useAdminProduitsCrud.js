import { computed, reactive, ref } from "vue"
import axios from "axios"

export function useAdminProduitsCrud() {
  const produits = ref([])
  const categories = ref([])

  const loading = ref(false)
  const error = ref("")

  const search = ref("")
  const sortKey = ref("id")
  const sortDir = ref("asc")

  const mode = ref("create") // create | edit
  const form = reactive({
    id: null,
    iri: null,

    nom: "",
    description: "",
    prix: "",
    disponible: true,

    // API Platform attend souvent une IRI pour une relation ManyToOne
    categorieIri: "",
  })

  function resetForm() {
    mode.value = "create"
    form.id = null
    form.iri = null
    form.nom = ""
    form.description = ""
    form.prix = ""
    form.disponible = true
    form.categorieIri = ""
  }

  function setError(e) {
    // API Platform peut renvoyer des payloads variés, on sécurise
    error.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  async function loadCategories() {
    try {
      const res = await axios.get("/api/categories")
      categories.value = res.data?.["hydra:member"] ?? res.data ?? []
    } catch (e) {
      // on ne bloque pas la page si la liste catégories échoue,
      // mais on affiche quand même une erreur exploitable
      setError(e)
    }
  }

  async function loadProduits() {
    loading.value = true
    error.value = ""
    try {
      const res = await axios.get("/api/produits")
      produits.value = res.data?.["hydra:member"] ?? res.data ?? []
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  async function init() {
    loading.value = true
    error.value = ""
    try {
      // on charge d'abord les catégories pour le select
      await Promise.all([loadCategories(), loadProduits()])
    } finally {
      loading.value = false
    }
  }

  function editProduit(p) {
    mode.value = "edit"
    form.id = p.id ?? null
    form.iri = p["@id"] ?? null

    form.nom = p.nom ?? ""
    form.description = p.description ?? ""
    form.prix = p.prix ?? ""
    form.disponible = typeof p.disponible === "boolean" ? p.disponible : true

    // categorie: API Platform renvoie souvent l'IRI (string) ou un objet
    if (typeof p.categorie === "string") form.categorieIri = p.categorie
    else form.categorieIri = p.categorie?.["@id"] ?? ""
  }

  async function removeProduit(p) {
    if (!confirm("Supprimer ce produit ?")) return
    loading.value = true
    error.value = ""
    try {
      const url = p["@id"] || `/api/produits/${p.id}`
      await axios.delete(url)
      await loadProduits()
      if (mode.value === "edit" && (form.id === p.id || form.iri === p["@id"])) resetForm()
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  function validate() {
    if (!String(form.nom).trim()) return "Le nom est obligatoire."
    if (!String(form.description).trim()) return "La description est obligatoire."
    const prixNumber = Number(form.prix)
    if (Number.isNaN(prixNumber) || prixNumber < 0) return "Le prix doit être un nombre >= 0."
    if (!form.categorieIri) return "La catégorie est obligatoire."
    return ""
  }

  function payloadFromForm() {
    return {
      nom: String(form.nom).trim(),
      description: String(form.description).trim(),
      prix: Number(form.prix),
      disponible: !!form.disponible,
      categorie: form.categorieIri, // relation ManyToOne => IRI
    }
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
      const payload = payloadFromForm()

      if (mode.value === "create") {
        await axios.post("/api/produits", payload)
      } else {
        // Tu as Put (pas Patch) dans ApiResource, donc on fait PUT
        const url = form.iri || `/api/produits/${form.id}`
        await axios.put(url, payload)
      }

      resetForm()
      await loadProduits()
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

  const filteredSortedProduits = computed(() => {
    const q = search.value.trim().toLowerCase()
    let arr = produits.value

    if (q) {
      arr = arr.filter((p) => {
        const nom = String(p.nom ?? "").toLowerCase()
        const desc = String(p.description ?? "").toLowerCase()
        return nom.includes(q) || desc.includes(q)
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

  function categorieLabel(p) {
    // si API renvoie un objet catégorie
    if (p?.categorie?.nom) return p.categorie.nom
    // sinon IRI => on tente de retrouver dans categories
    if (typeof p?.categorie === "string") {
      const c = categories.value.find((x) => x["@id"] === p.categorie)
      return c?.nom ?? "—"
    }
    return "—"
  }

  return {
    produits,
    categories,

    loading,
    error,

    search,
    sortKey,
    sortDir,

    mode,
    form,

    filteredSortedProduits,

    init,
    resetForm,
    editProduit,
    removeProduit,
    submitForm,
    toggleSort,
    categorieLabel,
  }
}
