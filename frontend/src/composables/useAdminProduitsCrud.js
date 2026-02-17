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

  function setError(e) {
    error.value =
      e?.response?.data?.detail ||
      e?.response?.data?.["hydra:description"] ||
      e?.response?.data?.message ||
      e?.message ||
      "Erreur inconnue"
  }

  // ✅ Cache-buster (force reload navigateur)
  function withBust(u) {
    if (!u) return null
    const sep = u.includes("?") ? "&" : "?"
    return `${u}${sep}v=${Date.now()}`
  }

  function absolutizeUrl(u) {
    if (!u) return null
    if (typeof u !== "string") return u

    const s = u.trim()
    if (!s) return null

    // Déjà absolue
    if (/^https?:\/\//i.test(s)) return s

    // Base backend (sans slash final)
    const base = String(api.defaults.baseURL || "").replace(/\/+$/, "")

    // "/uploads/..." -> "http://localhost:8000/uploads/..."
    if (s.startsWith("/")) return `${base}${s}`

    // "uploads/..." ou "media/..." -> "http://localhost:8000/uploads/..."
    return `${base}/${s.replace(/^\/+/, "")}`
  }

  async function resolveImageIri(iri) {
    if (imageUrlCache.value[iri]) return imageUrlCache.value[iri]

    const { data } = await api.get(iri)

    const raw =
      data.publicUrl ??
      data.url ??
      data.contentUrl ??
      data.path ??
      data.filePath ??
      data.file ??
      null

    const absolute = absolutizeUrl(raw)
    imageUrlCache.value[iri] = absolute
    return absolute
  }

  function firstImageUrl(p) {
    const img = p.images?.[0]
    if (!img) return null

    if (typeof img === "string") {
      // IRI => resolve async, retourne cache si dispo
      resolveImageIri(img)
      const u = imageUrlCache.value[img] ?? null
      return withBust(u)
    }

    if (img.url) return withBust(absolutizeUrl(img.url))
    if (img.contentUrl) return withBust(absolutizeUrl(img.contentUrl))
    if (img.path) return withBust(absolutizeUrl(img.path))

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
    imageFile: null, // File
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

  watch(
    () => form.imageFile,
    () => {
      // pas de revoke ici (ok pour admin)
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
  }

  async function loadCategories() {
    try {
      const res = await api.get("/api/categories")
      categories.value = res.data?.["hydra:member"] ?? res.data?.member ?? res.data ?? []
    } catch (e) {
      setError(e)
    }
  }

  async function loadProduits() {
    loading.value = true
    error.value = ""
    try {
      const res = await api.get("/api/produits")
      produits.value = res.data?.["hydra:member"] ?? res.data?.member ?? res.data ?? []

      // ✅ reset cache après refresh (évite ancienne URL)
      imageUrlCache.value = {}
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

  function getTokenOrNull() {
    return localStorage.getItem("token") || null
  }

  async function uploadImageFile(produitIri) {
    if (!form.imageFile) throw new Error("Aucun fichier sélectionné.")

    const fd = new FormData()
    fd.append("file", form.imageFile)
    fd.append("produit", produitIri)
    if (String(form.imageAlt ?? "").trim()) fd.append("alt", String(form.imageAlt).trim())

    const token = getTokenOrNull()

    await api.post("/api/images/upload", fd, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "multipart/form-data",
        Accept: "application/ld+json",
      },
    })
  }

  async function createImageUrl(produitIri, url, alt) {
    const token = getTokenOrNull()
    await api.post(
      "/api/images",
      { url, alt, produit: produitIri },
      { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
    )
  }

  // ✅ RELOAD + rester sur le même produit (important)
  async function refreshAndKeepEditing() {
    const keepIri = form.iri
    imageUrlCache.value = {}
    await loadProduits()
    const fresh = keepIri ? produits.value.find((p) => p["@id"] === keepIri) : null
    if (fresh) editProduit(fresh)
  }

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
        form.imageUrl = ""
        setSuccess("Image uploadée ✅")
      } else {
        const url = String(form.imageUrl ?? "").trim()
        const alt = String(form.imageAlt ?? "").trim() || null

        if (!url) {
          alert("URL de l'image obligatoire.")
          return
        }

        await createImageUrl(form.iri, url, alt)
        form.imageUrl = ""
        form.imageAlt = ""
        form.imageFile = null
        setSuccess("Image ajoutée ✅")
      }

      await refreshAndKeepEditing()
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

      const token = getTokenOrNull()

      await api.delete(iri, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })

      setSuccess("Image supprimée ✅")
      await refreshAndKeepEditing()
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
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
        const res = await api.post("/api/produits", payload)
        const produitIri = res.data?.["@id"] || null

        if (produitIri) {
          if (form.imageMode === "file" && form.imageFile) {
            await uploadImageFile(produitIri)
            form.imageFile = null
            setSuccess("Produit + image uploadée ✅")
          } else if (form.imageMode === "url") {
            const imgUrl = String(form.imageUrl ?? "").trim()
            const imgAlt = String(form.imageAlt ?? "").trim() || null
            if (imgUrl) {
              await createImageUrl(produitIri, imgUrl, imgAlt)
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

        form.imageUrl = ""
        form.imageAlt = ""
        form.imageMode = "url"

        imageUrlCache.value = {}
        await loadProduits()

        const fresh = produitIri ? produits.value.find((p) => p["@id"] === produitIri) : null
        if (fresh) editProduit(fresh)
        else resetForm()
      } else {
        const url = form.iri || `/api/produits/${form.id}`

        // ✅ PATCH (ton Produit n'autorise pas PUT? tu utilises PATCH: ok)
        await api.patch(url, payload, {
          headers: { "Content-Type": "application/merge-patch+json" },
        })

        setSuccess("Produit enregistré ✅")
        await refreshAndKeepEditing()
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
