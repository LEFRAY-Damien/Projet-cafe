<script setup>
import { onMounted } from "vue"
import { useCompte } from "@/composables/useCompte"
import { useMesCommandes } from "@/composables/useMesCommandes"

const { isLoggedIn, prenom, nom, email, whatsapp, roles } = useCompte()

const {
  commandes,
  loading: cmdLoading,
  error: cmdError,
  loadMesCommandes,

  openDetails,
  closeDetails,
  selected,
  detailsLoading,
  detailsError,

  formatDateTime,
  formatDateOnly,
} = useMesCommandes()

onMounted(() => {
  if (isLoggedIn.value) loadMesCommandes()
})
</script>

<template>
  <div class="home-bg d-flex align-items-center justify-content-center text-white">
    <div class="home-overlay"></div>

    <div class="home-content container py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <h1 class="h3 mb-4 text-center">Mon compte</h1>

          <div v-if="!isLoggedIn" class="alert alert-warning text-dark">
            Vous devez être connecté pour accéder à cette page.
          </div>

          <div v-else class="card text-dark">
            <div class="card-body">
              <h2 class="h5 card-title mb-3">Informations personnelles</h2>

              <ul class="list-group list-group-flush mb-3">
                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Prénom</span>
                  <span>{{ prenom }}</span>
                </li>

                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Nom</span>
                  <span>{{ nom }}</span>
                </li>

                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Email</span>
                  <span>{{ email }}</span>
                </li>

                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">WhatsApp</span>
                  <span>{{ whatsapp }}</span>
                </li>

                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Rôles</span>
                  <span class="text-muted">
                    {{ roles.length ? roles.join(", ") : "—" }}
                  </span>
                </li>
              </ul>

              <button class="btn btn-outline-danger w-100" disabled>
                Se désinscrire (à venir)
              </button>

              <hr class="my-4" />

              <!-- ✅ UN SEUL COLLAPSE "MES COMMANDES" -->
              <div class="d-grid">
                <button
                  class="btn btn-outline-primary"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseMesCommandes"
                  aria-expanded="false"
                  aria-controls="collapseMesCommandes"
                >
                  Mes commandes ({{ commandes.length }})
                </button>
              </div>

              <div class="collapse mt-3" id="collapseMesCommandes">
                <div class="card border-0">
                  <div class="card-body p-0">

                    <div v-if="cmdError" class="alert alert-danger py-2">{{ cmdError }}</div>
                    <div v-if="cmdLoading" class="text-muted">Chargement de vos commandes...</div>

                    <div v-if="!cmdLoading && commandes.length === 0" class="text-muted">
                      Vous n'avez pas encore de commande.
                    </div>

                    <div v-if="!cmdLoading && commandes.length" class="table-responsive">
                      <table class="table align-middle">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Date commande</th>
                            <th>Date retrait</th>
                            <th>Statut</th>
                            <th class="text-end">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr v-for="c in commandes" :key="c['@id'] || c.id">
                            <td class="fw-semibold">{{ c.id }}</td>
                            <td>{{ formatDateTime(c.dateCommande) }}</td>
                            <td>{{ formatDateOnly(c.dateRetrait) }}</td>
                            <td>{{ c.statut || "—" }}</td>
                            <td class="text-end">
                              <button class="btn btn-sm btn-outline-primary" @click="openDetails(c)">
                                Détail
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <button
                      class="btn btn-outline-secondary w-100 mt-2"
                      @click="loadMesCommandes"
                      :disabled="cmdLoading"
                    >
                      Rafraîchir mes commandes
                    </button>

                    <!-- ✅ DÉTAIL COMMANDE (comme admin) À L'INTÉRIEUR DU COLLAPSE -->
                    <div v-if="detailsLoading || detailsError || selected" class="mt-3">
                      <div class="card shadow-sm">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <h3 class="h6 mb-0">Détail commande</h3>
                            <button class="btn btn-sm btn-outline-secondary" @click="closeDetails">
                              Fermer
                            </button>
                          </div>

                          <div v-if="detailsError" class="alert alert-danger py-2">{{ detailsError }}</div>
                          <div v-if="detailsLoading" class="text-muted">Chargement du détail...</div>

                          <div v-if="selected && !detailsLoading" class="row g-3">
                            <div class="col-12 col-md-6">
                              <div class="border rounded p-3">
                                <div class="text-muted small">Numéro</div>
                                <div class="fw-semibold">{{ selected.id }}</div>
                              </div>
                            </div>

                            <div class="col-12 col-md-6">
                              <div class="border rounded p-3">
                                <div class="text-muted small">Statut</div>
                                <div class="fw-semibold">{{ selected.statut || "—" }}</div>
                              </div>
                            </div>

                            <div class="col-12 col-md-6">
                              <div class="border rounded p-3">
                                <div class="text-muted small">Date commande</div>
                                <div class="fw-semibold">{{ formatDateTime(selected.dateCommande) }}</div>
                              </div>
                            </div>

                            <div class="col-12 col-md-6">
                              <div class="border rounded p-3">
                                <div class="text-muted small">Date retrait</div>
                                <div class="fw-semibold">{{ formatDateOnly(selected.dateRetrait) }}</div>
                              </div>
                            </div>
                          </div>

                          <!-- Lignes -->
                          <div v-if="selected && !detailsLoading" class="mt-3">
                            <h4 class="h6">Articles</h4>

                            <div v-if="!selected.lignes || selected.lignes.length === 0" class="text-muted">
                              Aucune ligne.
                            </div>

                            <div v-else class="table-responsive">
                              <table class="table table-sm align-middle mb-0">
                                <thead>
                                  <tr>
                                    <th>Produit</th>
                                    <th class="text-end">Qté</th>
                                    <th class="text-end">PU</th>
                                    <th class="text-end">Total</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  <tr v-for="l in selected.lignes" :key="l['@id'] || l.id">
                                    <td>{{ l.produit?.nom ?? "—" }}</td>
                                    <td class="text-end">{{ l.quantite }}</td>
                                    <td class="text-end">{{ Number(l.prixUnitaire || 0).toFixed(2) }} €</td>
                                    <td class="text-end">
                                      {{
                                        (Number(l.prixUnitaire || 0) * Number(l.quantite || 0)).toFixed(2)
                                      }} €
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <details v-if="selected && !detailsLoading" class="mt-3">
                            <summary class="text-muted">Voir JSON brut</summary>
                            <pre class="bg-light p-3 rounded mt-2 mb-0" style="white-space: pre-wrap;">{{ selected }}</pre>
                          </details>
                        </div>
                      </div>
                    </div>
                    <!-- /DÉTAIL -->

                  </div>
                </div>
              </div>
              <!-- /COLLAPSE -->

            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
