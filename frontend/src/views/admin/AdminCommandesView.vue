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
  formatDateTime,
  formatDateOnly,
} = useAdminCommandes()

onMounted(() => loadCommandes())

function badgeClass(statut) {
  const s = String(statut || "").toLowerCase()
  if (s.includes("val") || s.includes("paid") || s.includes("ok")) return "text-bg-success"
  if (s.includes("att") || s.includes("prep") || s.includes("cours")) return "text-bg-warning"
  if (s.includes("ann") || s.includes("refus")) return "text-bg-danger"
  return "text-bg-secondary"
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
            style="max-width: 360px"
            placeholder="Rechercher (id, statut, dates...)"
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
              <th>Date commande</th>
              <th>Date retrait</th>
              <th>Statut</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in filteredCommandes" :key="c['@id'] || c.id">
              <td class="fw-semibold">{{ c.id }}</td>
              <td>{{ formatDateTime(c.dateCommande) }}</td>
              <td>{{ formatDateOnly(c.dateRetrait) }}</td>
              <td>
                <span class="badge" :class="badgeClass(c.statut)">
                  {{ c.statut || "—" }}
                </span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" @click="openDetails(c)">
                  Détail
                </button>
              </td>
            </tr>

            <tr v-if="filteredCommandes.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Aucune commande.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-muted small">
        Note : le champ <code>user</code> n’est pas lisible côté API (readable:false), donc non affiché ici.
      </div>
    </div>
  </div>

  <!-- Détail -->
  <div v-if="detailsLoading || detailsError || selected" class="mt-3">
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3 class="h6 mb-0">Détail commande</h3>
          <button class="btn btn-sm btn-outline-secondary" @click="closeDetails">Fermer</button>
        </div>

        <div v-if="detailsError" class="alert alert-danger py-2">{{ detailsError }}</div>
        <div v-if="detailsLoading" class="text-muted">Chargement du détail...</div>

        <div v-if="selected && !detailsLoading" class="row g-3">
          <div class="col-12 col-md-6">
            <div class="border rounded p-3">
              <div class="text-muted small">Commande numéro</div>
              <div class="fw-semibold">{{ selected.id }}</div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="border rounded p-3">
              <div class="text-muted small">Statut</div>
              <div>
                <span class="badge" :class="badgeClass(selected.statut)">
                  {{ selected.statut || "—" }}
                </span>
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
            <!-- Si produit = IRI -->
            <code v-if="typeof l.produit === 'string'">
              {{ l.produit }}
            </code>

            <!-- Si produit = objet -->
            <span v-else>
              {{ l.produit?.nom ?? l.produit?.title ?? '—' }}
            </span>
          </td>

          <td class="text-end">{{ l.quantite }}</td>

          <td class="text-end">
            {{ Number(l.prixUnitaire || 0).toFixed(2) }} €
          </td>

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
