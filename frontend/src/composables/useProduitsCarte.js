import { computed, onMounted, ref } from "vue"
import { useProduitsStore } from "@/stores/produits"
import { useAuthStore } from "@/stores/auth"
import { useFavorisStore } from "@/stores/favoris"
import { usePanierStore } from "@/stores/panier"
import api from "@/api/axios"

export function useProduitsCarte() {
  const produitsStore = useProduitsStore()
  const auth = useAuthStore()
  const favorisStore = useFavorisStore()
  const panier = usePanierStore()

  function productIri(p) {
    return p["@id"] || `/api/produits/${p.id}`
  }

  // ✅ Catégories (comme ton admin)
  const categories = ref([])

  async function fetchCategories() {
    try {
      const { data } = await api.get("/api/categories")
      categories.value = data?.member ?? data?.items ?? []
    } catch (e) {
      console.warn("Erreur chargement categories", e)
      categories.value = []
    }
  }

  function categorieLabel(p) {
    const c = p.categorie
    if (!c) return "—"

    // si l'API renvoie déjà l'objet
    if (typeof c === "object") return c.nom ?? "—"

    // si c'est une IRI
    const found = categories.value.find((x) => x["@id"] === c)
    return found?.nom ?? "—"
  }

  // ✅ Produits triés : favoris d'abord
  const produits = computed(() => {
    const list = produitsStore.items ?? []

    return [...list].sort((a, b) => {
      const af = favorisStore.isFav(productIri(a)) ? 1 : 0
      const bf = favorisStore.isFav(productIri(b)) ? 1 : 0
      if (af !== bf) return bf - af

      return String(a.nom ?? "").localeCompare(String(b.nom ?? ""), "fr", {
        sensitivity: "base",
      })
    })
  })

  // ✅ Images
  const imageUrlCache = ref({}) // { "/api/images/1": "http://..." }

  async function resolveImageIri(iri) {
    if (imageUrlCache.value[iri]) return imageUrlCache.value[iri]

    const { data } = await api.get(iri)
    const url =
      data.url ??
      data.contentUrl ??
      (data.path ? `${api.defaults.baseURL}${data.path}` : null)

    imageUrlCache.value[iri] = url
    return url
  }

  function firstImageUrl(p) {
    const img = p.images?.[0]
    if (!img) return null

    if (typeof img === "string") {
      resolveImageIri(img)
      return imageUrlCache.value[img] ?? null
    }

    if (img.url) return img.url
    if (img.contentUrl) return img.contentUrl
    if (img.path) return `${api.defaults.baseURL}${img.path}`

    return null
  }

  function formatPrice(value) {
    const n = Number(value ?? 0)
    return n.toFixed(2).replace(".", ",")
  }

  async function toggleFav(p) {
    await favorisStore.toggle(productIri(p), p.id)
  }

  function addToPanier(p) {
    panier.add({
      productIri: productIri(p),
      name: p.nom,
      price: Number(p.prix),
    })
  }

  async function init() {
    await auth.init()

    await Promise.all([
      produitsStore.fetchProduits(),
      fetchCategories(),
      auth.isLoggedIn ? favorisStore.load() : Promise.resolve(),
    ])
  }

  onMounted(() => {
    init()
  })

  return {
    // stores / state
    produitsStore,
    auth,
    favorisStore,
    panier,
    produits,

    // helpers
    productIri,
    firstImageUrl,
    formatPrice,
    categorieLabel, // ✅ IMPORTANT

    // actions
    toggleFav,
    addToPanier,
    init,
  }
}
