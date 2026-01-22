import { computed, onMounted, ref } from "vue";
import { useProduitsStore } from "@/stores/produits";
import { useAuthStore } from "@/stores/auth";
import { useFavorisStore } from "@/stores/favoris";
import { usePanierStore } from "@/stores/panier";
import api from "@/api/axios";

export function useProduitsCarte() {
  const produitsStore = useProduitsStore();
  const auth = useAuthStore();
  const favorisStore = useFavorisStore();
  const panier = usePanierStore();

  const produits = computed(() => produitsStore.items ?? []);

  const imageUrlCache = ref({}); // { "/api/images/1": "http://..." }

  async function resolveImageIri(iri) {
    if (imageUrlCache.value[iri]) return imageUrlCache.value[iri];

    const { data } = await api.get(iri); // ex: /api/images/1

    // adapte selon ton API (on teste plusieurs noms possibles)
    const url =
      data.url ??
      data.contentUrl ??
      (data.path ? `${api.defaults.baseURL}${data.path}` : null);

    imageUrlCache.value[iri] = url;
    return url;
  }


  function productIri(p) {
    return p["@id"] || `/api/produits/${p.id}`;
  }

  function firstImageUrl(p) {
    const img = p.images?.[0];
    if (!img) return null;

    // Si l’API renvoie une IRI (string), on déclenche la résolution
    if (typeof img === "string") {
      resolveImageIri(img); // lance la requête en arrière-plan
      return imageUrlCache.value[img] ?? null; // renvoie l'url quand dispo
    }

    // Si c’est déjà un objet
    if (img.url) return img.url;
    if (img.contentUrl) return img.contentUrl;
    if (img.path) return `${api.defaults.baseURL}${img.path}`;

    return null;
  }


  function formatPrice(value) {
    const n = Number(value ?? 0);
    return n.toFixed(2).replace(".", ",");
  }

  async function toggleFav(p) {
    await favorisStore.toggle(productIri(p));
  }

  function addToPanier(p) {
    panier.add({
      productIri: productIri(p),
      name: p.nom,
      price: Number(p.prix),
    });
  }

  async function init() {
    await auth.init();
    await produitsStore.fetchProduits();
  }

  onMounted(() => {
    init();
  });

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

    // actions
    toggleFav,
    addToPanier,
    init,
  };
}
