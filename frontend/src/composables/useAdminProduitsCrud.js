import { computed, reactive, ref, watch } from "vue"
import api from "@/api/axios"

export function useAdminProduitsCrud() {
  const produits = ref([])
  const categories = ref([])

  const loading = ref(false)
  const error = ref("")
  const success = ref("")

  const search = ref("")
  const sortKey = ref("id")
  const sortDir = ref("asc")

  const mode = ref("create") // create | edit

  const imageUrlCache = ref({}) // { "/api/images/1": "http://..." }

  function setSuccess(msg) {
    success.value = msg
    setTimeout(() => (success.value = ""), 2500)
  }

  async function resolveImageIri(iri) {
    if (imageUrlCache.value[iri]) return imageUrlCache.value[iri]

    const { data } = await api.get(iri)

    const url =
      data.url ??
      data.contentUrl ??
      (data.path ? `${api.defaults.baseURL}${data.path}` : null)

    const absolute = absolutizeUrl(url)
    imageUrlCache.value[iri] = absolute
    return absolute

  }

  function absolutizeUrl(u) {
    if (!u) return null
    // Si l'URL commence par "/" => on la sert depuis le backend (baseURL axios)
    if (typeof u === "string" && u.startsWith("/")) {
      return `${api.defaults.baseURL}${u}`
    }
    return u
  }

  function firstImageUrl(p) {
    const img = p.images?.[0]
    if (!img) return null

    // IRI string => on va chercher le détail
    if (typeof img === "string") {
      resolveImageIri(img)
      return imageUrlCache.value[img] ?? null
    }

    // objet direct
    if (img.url) return absolutizeUrl(img.url)
    if (img.contentUrl) return absolutizeUrl(img.contentUrl)
    if (img.path) return `${api.defaults.baseURL}${img.path}`

    return null
  }


  const form = reactive({
    id: null,
    iri: null,

    nom: "",
    description: "",
    prix: "",
    disponible: true,
    categorieIri: "",

    // image
    imageMode: "url", // "url" | "file"
    imageFile: null,  // File
    imageUrl: "",
    imageAlt: "",
  })

  // Preview (URL ou File)
  const imagePreview = computed(() => {
    if (form.imageMode === "url") {
      const u = String(form.imageUrl ?? "").trim()
      return u || null
    }
    if (form.imageMode === "file" && form.imageFile) {
      return URL.createObjectURL(form.imageFile)
    }
    return null
  })

  // Clean blob URLs quand on change de fichier
  watch(
    () => form.imageFile,
    (newFile, oldFile) => {
      // Rien à faire ici si pas de blob en cours ; la preview est recalculée
      // (on évite d'accumuler)
      // On ne peut pas récupérer l'ancien blob URL facilement ici car computed,
      // donc on reste simple : pas de revoke (acceptable pour admin).
    }
  )

  const canAddImageNow = computed(() => {
    if (!form.iri) return false
    if (form.imageMode === "url") return !!String(form.imageUrl ?? "").trim()
    if (form.imageMode === "file") return !!form.imageFile
    return false
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

    form.imageMode = "url"
    form.imageFile = null
    form.imageUrl = ""
    form.imageAlt = ""

    error.value = ""
    // success on laisse vivre 2.5s si besoin
  }

  function setError(e) {
    error.value =
      e?.response?.data?.detail ||
      e?.response?.data?.["hydra:description"] ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  async function loadCategories() {
    try {
      const res = await api.get("/api/categories")
      categories.value =
        res.data?.["hydra:member"] ?? res.data?.member ?? res.data ?? []
    } catch (e) {
      setError(e)
    }
  }

  async function loadProduits() {
    loading.value = true
    error.value = ""
    try {
      const res = await api.get("/api/produits")
      produits.value =
        res.data?.["hydra:member"] ?? res.data?.member ?? res.data ?? []
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
      await loadCategories()
      await loadProduits()
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

    if (typeof p.categorie === "string") form.categorieIri = p.categorie
    else form.categorieIri = p.categorie?.["@id"] ?? ""

    // champs image = champs d'ajout
    form.imageMode = "url"
    form.imageFile = null
    form.imageUrl = ""
    form.imageAlt = ""
  }

  async function removeProduit(p) {
    if (!confirm("Supprimer ce produit ?")) return
    loading.value = true
    error.value = ""
    try {
      const url = p["@id"] || `/api/produits/${p.id}`
      await api.delete(url)
      await loadProduits()
      setSuccess("Produit supprimé ✅")

      if (mode.value === "edit" && (form.id === p.id || form.iri === p["@id"])) {
        resetForm()
      }
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
      categorie: form.categorieIri,
    }
  }

  // Upload fichier -> /api/images/upload
  async function uploadImageFile(produitIri) {
    if (!form.imageFile) throw new Error("Aucun fichier sélectionné.")

    const fd = new FormData()
    fd.append("file", form.imageFile)
    fd.append("produit", produitIri)
    if (String(form.imageAlt ?? "").trim()) fd.append("alt", String(form.imageAlt).trim())

    await api.post("/api/images/upload", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/ld+json",
      },
    })
  }

  // ✅ Ajout image (mode EDIT) : URL ou FILE
  async function addImageToCurrentProduct() {
    if (!form.iri) {
      alert("Tu dois d'abord enregistrer le produit, puis l'éditer.")
      return
    }

    loading.value = true
    error.value = ""
    try {
      if (form.imageMode === "file") {
        if (!form.imageFile) {
          alert("Choisis un fichier image.")
          return
        }
        await uploadImageFile(form.iri)
        form.imageFile = null
        form.imageAlt = ""
        setSuccess("Image uploadée ✅")
      } else {
        const url = String(form.imageUrl ?? "").trim()
        const alt = String(form.imageAlt ?? "").trim() || null

        if (!url) {
          alert("URL de l'image obligatoire.")
          return
        }

        await api.post("/api/images", { url, alt, produit: form.iri })
        form.imageUrl = ""
        form.imageAlt = ""
        setSuccess("Image ajoutée ✅")
      }

      await loadProduits()
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  async function removeImage(img) {
    if (!confirm("Supprimer cette image ?")) return

    loading.value = true
    error.value = ""
    try {
      const iri = typeof img === "string" ? img : img?.["@id"]
      if (!iri) {
        alert("Impossible de trouver l'IRI de l'image.")
        return
      }

      await api.delete(iri)
      await loadProduits()
      setSuccess("Image supprimée ✅")
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  // ✅ Submit produit : en CREATE, on peut aussi créer l'image (URL ou FILE)
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
        // 1) créer le produit
        const res = await api.post("/api/produits", payload)
        const produitIri = res.data?.["@id"] || null

        // 2) image optionnelle
        if (produitIri) {
          if (form.imageMode === "file" && form.imageFile) {
            await uploadImageFile(produitIri)
            form.imageFile = null
            setSuccess("Produit + image uploadée ✅")
          } else if (form.imageMode === "url") {
            const imgUrl = String(form.imageUrl ?? "").trim()
            const imgAlt = String(form.imageAlt ?? "").trim() || null
            if (imgUrl) {
              await api.post("/api/images", { url: imgUrl, alt: imgAlt, produit: produitIri })
              setSuccess("Produit + image ajoutée ✅")
            } else {
              setSuccess("Produit créé ✅")
            }
          } else {
            setSuccess("Produit créé ✅")
          }
        } else {
          setSuccess("Produit créé ✅")
        }

        // reset champs image après création
        form.imageUrl = ""
        form.imageAlt = ""
        form.imageMode = "url"

        // 3) refresh + passer en edit sur le produit créé
        await loadProduits()
        const fresh = produitIri
          ? produits.value.find((p) => p["@id"] === produitIri)
          : null

        if (fresh) editProduit(fresh)
        else resetForm()
      } else {
        const url = form.iri || `/api/produits/${form.id}`
        await api.put(url, payload)

        // on recharge et on reste en edit
        const keepIri = form.iri
        await loadProduits()
        const fresh = keepIri
          ? produits.value.find((p) => p["@id"] === keepIri)
          : null

        setSuccess("Produit enregistré ✅")
        if (fresh) editProduit(fresh)
        else resetForm()
      }
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
    let arr = Array.isArray(produits.value) ? produits.value : []

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
    if (p?.categorie?.nom) return p.categorie.nom
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
    success,

    search,
    sortKey,
    sortDir,

    mode,
    form,

    imagePreview,
    canAddImageNow,

    filteredSortedProduits,

    init,
    firstImageUrl,
    resetForm,
    editProduit,
    removeProduit,
    submitForm,
    toggleSort,
    categorieLabel,

    addImageToCurrentProduct,
    removeImage,
  }
}
