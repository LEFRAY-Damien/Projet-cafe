<script setup>
import { useProduitsCarte } from "@/composables/useProduitsCarte";

const {
  produitsStore,
  auth,
  favorisStore,
  panier,
  produits,
  productIri,
  firstImageUrl,
  formatPrice,
  toggleFav,
  addToPanier,
} = useProduitsCarte();
</script>

<template>
  <div class="home-bg d-flex align-items-center justify-content-center text-white">
    <div class="home-overlay"></div>

    <div class="d-flex align-items-center justify-content-between mb-3 home-content">
      <div>
        <h1 class="h3 mb-1">La carte</h1>
        <div>Produits disponibles au retrait</div>
      </div>

      <div class="text-end">
        <div class="small">Panier</div>
        <div class="fw-semibold">
          {{ panier.count }} item(s) • {{ formatPrice(panier.total) }} €
        </div>
      </div>
    </div>

    <div v-if="produitsStore.loading" class="alert alert-info">Chargement…</div>
    <div v-else-if="produitsStore.error" class="alert alert-danger">
      {{ produitsStore.error }}
    </div>

    <div v-else class="row g-2">
      <div
        v-for="p in produits"
        :key="productIri(p)"
        class="col-6 col-md-4 col-lg-3"
      >
        <div class="card h-100 shadow-sm">
          <div class="ratio ratio-4x3 bg-light">
            <img
              v-if="firstImageUrl(p)"
              :src="firstImageUrl(p)"
              class="card-img-top object-fit-cover"
              :alt="p.nom"
            />
            <div v-else class="d-flex align-items-center justify-content-center text-muted">
              Pas d’image
            </div>
          </div>

          <div class="card-body d-flex flex-column p-2">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <h2 class="h6 mb-1">{{ p.nom }}</h2>
                <div class="fw-semibold">{{ formatPrice(p.prix) }} €</div>
              </div>

              <button
                v-if="auth.isLoggedIn"
                class="btn btn-sm"
                :class="favorisStore.isFav(productIri(p)) ? 'btn-danger' : 'btn-outline-danger'"
                type="button"
                title="Favori"
                @click="toggleFav(p)"
              >
                <span v-if="favorisStore.isFav(productIri(p))">❤️</span>
                <span v-else>🤍</span>
              </button>
            </div>

            <div class="mt-2">
              <span class="badge" :class="p.disponible ? 'text-bg-success' : 'text-bg-secondary'">
                {{ p.disponible ? "Disponible" : "Indisponible" }}
              </span>
            </div>

            <div class="mt-auto pt-2 d-flex gap-2">
              <button
                class="btn btn-primary w-100"
                type="button"
                :disabled="!p.disponible"
                @click="addToPanier(p)"
              >
                Ajouter au panier
              </button>
            </div>

            <div v-if="!auth.isLoggedIn" class="small text-muted mt-2">
              Connecte-toi pour utiliser les favoris ❤️
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
