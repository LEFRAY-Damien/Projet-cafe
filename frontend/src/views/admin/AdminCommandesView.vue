<script setup>
import { onMounted } from "vue"
import { useAdminCommandes } from "../../composables/useAdminCommandes"

const {
  loading,
  error,
  search,
  filteredCommandes,
  loadCommandes,
  openDetails,
  closeDetails,
  selected,
  detailsLoading,
  detailsError,
  updateStatut,
  formatDateTime,
  formatDateOnly,
  removeCommande,

  // ✅ user helpers
  userLabel,
  userEmail,
  userIsDeleted,
} = useAdminCommandes()

onMounted(() => loadCommandes())

function confirmDelete() {
  return window.confirm("Supprimer cette commande ?")
}

function badgeClass(statut) {
  switch (statut) {
    case "prete":
      return "text-bg-primary"
    case "retiree":
      return "text-bg-success"
    case "refusee":
      return "text-bg-danger"
    case "annulee":
      return "text-bg-secondary"
    default:
      return "text-bg-warning"
  }
}
</script>

<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 class="h5 mb-0">Commandes</h2>

        <div class="d-flex gap-2">
          <input
            v-model="search"
            class="form-control"
            style="max-width: 420px"
            placeholder="Rechercher (id, statut, dates, client...)"
          />
          <button class="btn btn-outline-primary" @click="loadCommandes" :disabled="loading">
            Rafraîchir
          </button>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
      <div v-if="loading" class="text-muted">Chargement...</div>

      <div class="table-responsive" v-if="!loading">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>Date commande</th>
              <th>Date retrait</th>
              <th>Statut</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in filteredCommandes" :key="c['@id'] || c.id">
              <td class="fw-semibold">{{ c.id }}</td>

              <!-- ✅ Client -->
              <td>
                <div class="fw-semibold d-flex align-items-center gap-2">
                  <span>{{ userLabel(c.user) }}</span>

                  <span v-if="userIsDeleted(c.user)" class="badge text-bg-secondary">
                    Supprimé
                  </span>
                </div>
                <div class="small text-muted">{{ userEmail(c.user) }}</div>
              </td>

              <td>{{ formatDateTime(c.dateCommande) }}</td>
              <td>{{ formatDateOnly(c.dateRetrait) }}</td>

              <td>
                <span class="badge" :class="badgeClass(c.statut)">
                  {{ c.statut || "—" }}
                </span>
              </td>

              <td class="text-end">
                <div class="d-inline-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click="openDetails(c)">
                    Détail
                  </button>

                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete() && removeCommande(c)"
                    :disabled="loading || detailsLoading"
                    title="Supprimer"
                  >
                    Suppr.
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredCommandes.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Aucune commande.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-muted small">
        Note : en admin, la commande inclut maintenant <code>user</code> (nom/email + badge supprimé si inactif).
      </div>
    </div>
  </div>

  <!-- Détail -->
  <div v-if="detailsLoading || detailsError || selected" class="mt-3">
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3 class="h6 mb-0">Détail commande</h3>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" @click="closeDetails">Fermer</button>
          </div>
        </div>

        <div v-if="detailsError" class="alert alert-danger py-2">{{ detailsError }}</div>
        <div v-if="detailsLoading" class="text-muted">Chargement du détail...</div>

        <div v-if="selected && !detailsLoading" class="row g-3">
          <!-- ✅ Client -->
          <div class="col-12">
            <div class="border rounded p-3">
              <div class="text-muted small">Client</div>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <div class="fw-semibold">
                  {{ userLabel(selected.user) }}
                  <span v-if="userIsDeleted(selected.user)" class="badge text-bg-secondary ms-2">Supprimé</span>
                </div>
                <div class="text-muted small">{{ userEmail(selected.user) }}</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="border rounded p-3">
              <div class="text-muted small">Commande numéro</div>
              <div class="fw-semibold">{{ selected.id }}</div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="border rounded p-3">
              <div class="text-muted small">Statut</div>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="badge" :class="badgeClass(selected.statut)">
                  {{ selected.statut || "—" }}
                </span>

                <select
                  class="form-select form-select-sm"
                  style="max-width: 220px"
                  :value="selected.statut"
                  @change="updateStatut(selected, $event.target.value)"
                  :disabled="detailsLoading || loading"
                >
                  <option value="en_attente">🕒 En attente</option>
                  <option value="prete">🛍️ Prête</option>
                  <option value="retiree">🧾 Retirée</option>
                  <option value="refusee">❌ Refusée</option>
                  <option value="annulee">🚫 Annulée</option>
                </select>
              </div>
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

        <!-- Lignes de commande -->
        <div v-if="selected && !detailsLoading" class="mt-3">
          <h4 class="h6">Articles</h4>

          <div v-if="!selected.lignes || selected.lignes.length === 0" class="text-muted">
            Aucune ligne.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produit</th>
                  <th class="text-end">Qté</th>
                  <th class="text-end">PU</th>
                  <th class="text-end">Total</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="l in selected.lignes" :key="l['@id'] || l.id">
                  <td>{{ l.id }}</td>

                  <td>
                    <code v-if="typeof l.produit === 'string'">{{ l.produit }}</code>
                    <span v-else>
                      {{ l.produit?.nom ?? l.produit?.title ?? "—" }}
                    </span>
                  </td>

                  <td class="text-end">{{ l.quantite }}</td>

                  <td class="text-end">{{ Number(l.prixUnitaire || 0).toFixed(2) }} €</td>
                  <td class="text-end">
                    {{ (Number(l.prixUnitaire || 0) * Number(l.quantite || 0)).toFixed(2) }} €
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
</template>
