<script setup>
import { usePanierCarte } from "@/composables/usePanierCarte";

const {
  auth,
  panier,
  items,
  formatPrice,
  lineTotal,
  inc,
  dec,
  setQty,
  removeItem,
  clearPanier,
  checkout,
  loading,
  error,
  success,
  dateRetrait, // ✅ AJOUT
  minDate,     // ✅ AJOUT
  maxDate,     // ✅ AJOUT
} = usePanierCarte();

</script>

<template>
  <div class="home-bg d-flex align-items-center justify-content-center text-white">
    <div class="home-overlay"></div>

    <div class="home-content container py-4">
      <!-- HEADER -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="h3 mb-1">Mon panier</h1>
          <div>Vérifie tes articles avant de commander</div>
        </div>

        <div class="text-end">
          <div class="small">Total</div>
          <div class="fw-semibold">
            {{ panier.count }} item(s) • {{ formatPrice(panier.total) }} €
          </div>

          <RouterLink to="/produits" class="btn btn-sm btn-outline-light mt-2">
            Continuer mes achats
          </RouterLink>
        </div>
      </div>

      <!-- PAS CONNECTÉ -->
      <div v-if="!auth.isLoggedIn" class="alert alert-warning">
        Tu dois être connecté pour accéder à ton panier.
        <RouterLink to="/login" class="alert-link ms-1">Se connecter</RouterLink>
      </div>

      <!-- CONNECTÉ -->
      <template v-else>
        <!-- PANIER VIDE -->
        <div v-if="items.length === 0" class="alert alert-info">
          Ton panier est vide.
          <RouterLink to="/produits" class="alert-link ms-1">Voir les produits</RouterLink>
        </div>




        <!-- PANIER REMPLI -->
        <div v-else class="card shadow-sm text-dark">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table mb-0 align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Produit</th>
                    <th class="text-end">Prix</th>
                    <th class="text-center" style="width: 230px;">Quantité</th>
                    <th class="text-end">Sous-total</th>
                    <th style="width: 70px;"></th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="i in items" :key="i.productIri">
                    <td class="fw-semibold">{{ i.name }}</td>

                    <td class="text-end">{{ formatPrice(i.price) }} €</td>

                    <td>
                      <div class="d-flex justify-content-center align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary" type="button" @click="dec(i)">
                          -
                        </button>

                        <input class="form-control form-control-sm text-center" style="width: 80px;" type="number"
                          min="1" :value="i.qty" @change="setQty(i, $event.target.value)" />

                        <button class="btn btn-sm btn-outline-secondary" type="button" @click="inc(i)">
                          +
                        </button>
                      </div>
                    </td>

                    <td class="text-end fw-semibold">
                      {{ formatPrice(lineTotal(i)) }} €
                    </td>

                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" type="button" @click="removeItem(i)">
                        ✕
                      </button>
                    </td>
                  </tr>
                </tbody>

                <tfoot class="table-light">
                  <tr>
                    <td colspan="3" class="text-end fw-semibold">Total</td>
                    <td class="text-end fw-semibold">{{ formatPrice(panier.total) }} €</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div class="card-footer d-flex justify-content-between align-items-end gap-3 flex-wrap">
            <button class="btn btn-outline-danger" type="button" @click="clearPanier" :disabled="loading">
              Vider le panier
            </button>

            <!-- ✅ Date de retrait -->
            <div style="min-width: 220px;">
              <label class="form-label mb-1">Date de retrait</label>
              <input type="date" class="form-control form-control-sm" v-model="dateRetrait" :min="minDate"
                :max="maxDate" :disabled="loading" />
              <div class="form-text">
                Entre {{ minDate }} et {{ maxDate }}.
              </div>
            </div>

            <button class="btn btn-primary" type="button" @click="checkout" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Valider la commande
            </button>
          </div>


          <div v-if="error" class="alert alert-danger mt-3">
            {{ error }}
          </div>

          <div v-if="success" class="alert alert-success mt-3">
            ✅ Commande envoyée au serveur !
          </div>

        </div>
      </template>
    </div>
  </div>
</template>
