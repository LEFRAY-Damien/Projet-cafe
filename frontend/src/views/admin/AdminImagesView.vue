<script setup>
import { onMounted } from "vue"
import { useAdminImagesCrud } from "../../composables/useAdminImagesCrud"

const {
  produits,
  loading,
  error,
  search,
  sortKey,
  sortDir,
  mode,
  form,
  filteredSortedImages,
  init,
  resetForm,
  editImage,
  removeImage,
  submitForm,
  toggleSort,
  produitLabel,
} = useAdminImagesCrud()

onMounted(() => init())
</script>

<template>
  <div class="row g-3">
    <!-- FORM -->
    <div class="col-12 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 mb-0">{{ mode === "create" ? "Ajouter une image" : "Modifier l'image" }}</h2>
            <button class="btn btn-outline-secondary btn-sm" @click="resetForm">Nouveau</button>
          </div>

          <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

          <form @submit.prevent="submitForm" class="vstack gap-3">
            <div>
              <label class="form-label">URL</label>
              <input v-model="form.url" class="form-control" type="text" placeholder="https://... ou /images/..." />
            </div>

            <div>
              <label class="form-label">ALT (optionnel)</label>
              <input v-model="form.alt" class="form-control" type="text" placeholder="Ex: Café espresso" />
            </div>

            <div>
              <label class="form-label">Produit</label>
              <select v-model="form.produitIri" class="form-select">
                <option value="">— Choisir —</option>
                <option v-for="p in produits" :key="p['@id']" :value="p['@id']">
                  {{ p.nom }}
                </option>
              </select>
            </div>

            <div v-if="form.url" class="border rounded p-2">
              <div class="text-muted small mb-2">Aperçu</div>
              <img :src="form.url" alt="" class="img-fluid rounded" />
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-primary w-100" type="submit" :disabled="loading">
                {{ loading ? "En cours..." : (mode === "create" ? "Ajouter" : "Enregistrer") }}
              </button>
              <button class="btn btn-outline-secondary" type="button" @click="resetForm" :disabled="loading">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- LIST -->
    <div class="col-12 col-lg-8">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 class="h5 mb-0">Images</h2>
            <input v-model="search" class="form-control" style="max-width: 320px" placeholder="Rechercher (url/alt)..." />
          </div>

          <div v-if="loading" class="text-muted mb-2">Chargement...</div>

          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th role="button" @click="toggleSort('id')">
                    # <span class="text-muted small">{{ sortKey === "id" ? (sortDir === "asc" ? "↑" : "↓") : "" }}</span>
                  </th>
                  <th>Aperçu</th>
                  <th>URL</th>
                  <th>ALT</th>
                  <th>Produit</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="img in filteredSortedImages" :key="img['@id'] || img.id">
                  <td>{{ img.id }}</td>

                  <td style="width:90px">
                    <img :src="img.url" alt="" class="img-fluid rounded border" style="max-height:60px" />
                  </td>

                  <td class="text-muted" style="max-width:260px">{{ img.url }}</td>
                  <td>{{ img.alt }}</td>
                  <td>{{ produitLabel(img) }}</td>

                  <td class="text-end">
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" @click="editImage(img)">Éditer</button>
                      <button class="btn btn-sm btn-outline-danger" @click="removeImage(img)" :disabled="loading">Supprimer</button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!loading && filteredSortedImages.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">Aucune image.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="text-muted small">Total : <strong>{{ filteredSortedImages.length }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>
