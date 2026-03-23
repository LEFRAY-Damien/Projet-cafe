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
    return p?.["@id"] || (p?.id ? `/api/produits/${p.id}` : null)
  }

  const categories = ref([])
  const selectedCategorieIri = ref("")

  async function fetchCategories() {
    try {
      const { data } = await api.get("/api/categories")
      categories.value =
        data?.["hydra:member"] ??
        data?.member ??
        data?.items ??
        []
    } catch (e) {
      console.warn("Erreur chargement categories", e)
      categories.value = []
    }
  }

  function categorieIriOfProduit(p) {
    const c = p.categorie
    if (!c) return null
    if (typeof c === "string") return c
    return c["@id"] ?? (c.id ? `/api/categories/${c.id}` : null)
  }

  function categorieLabel(p) {
    const c = p.categorie
    if (!c) return "—"

    if (typeof c === "object") {
      return c.nom ?? "—"
    }

    const found = categories.value.find((x) => x["@id"] === c)
    return found?.nom ?? "—"
  }

  const produits = computed(() => {
    const list = produitsStore.items ?? []

    const filtered = selectedCategorieIri.value
      ? list.filter((p) => categorieIriOfProduit(p) === selectedCategorieIri.value)
      : list

    return [...filtered].sort((a, b) => {
      const af = favorisStore.isFav(productIri(a)) ? 1 : 0
      const bf = favorisStore.isFav(productIri(b)) ? 1 : 0

      if (af !== bf) return bf - af

      return String(a.nom ?? "").localeCompare(String(b.nom ?? ""), "fr", {
        sensitivity: "base",
      })
    })
  })

  const imageUrlCache = ref({})

  function absolutizeUrl(u) {
    if (!u) return null
    if (typeof u === "string" && u.startsWith("/")) {
      return `${api.defaults.baseURL}${u}`
    }
    return u
  }

  async function resolveImageIri(iri) {
    if (imageUrlCache.value[iri]) return imageUrlCache.value[iri]

    const { data } = await api.get(iri)

    const url =
      data.url ??
      data.contentUrl ??
      data.path ??
      null

    const absolute = absolutizeUrl(url)
    imageUrlCache.value[iri] = absolute
    return absolute
  }

  function firstImageUrl(p) {
    const img = p.images?.[0]
    if (!img) return null

    if (typeof img === "string") {
      resolveImageIri(img)
      return imageUrlCache.value[img] ?? null
    }

    if (img.url) return absolutizeUrl(img.url)
    if (img.contentUrl) return absolutizeUrl(img.contentUrl)
    if (img.path) return absolutizeUrl(img.path)

    return null
  }

  function formatPrice(value) {
    const n = Number(value ?? 0)
    return n.toFixed(2).replace(".", ",")
  }

  async function toggleFav(p) {
    const iri = productIri(p)

    if (!iri) {
      console.error("IRI produit introuvable", p)
      return
    }

    const productId =
      p?.id ??
      iri.split("/").pop()

    if (!productId) {
      console.error("Impossible de déterminer l'id du produit", p)
      return
    }

    await favorisStore.toggle(iri, productId)
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
    produitsStore,
    auth,
    favorisStore,
    panier,
    produits,
    categories,
    selectedCategorieIri,
    productIri,
    firstImageUrl,
    formatPrice,
    categorieLabel,
    toggleFav,
    addToPanier,
    init,
  }
}