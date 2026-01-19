<script setup>
import { onMounted } from "vue"
import { useAdminProduitsCrud } from "@/composables/useAdminProduitsCrud"

const {
    categories,
    loading,
    error,
    search,
    sortKey,
    sortDir,
    mode,
    form,
    filteredSortedProduits,
    init,
    resetForm,
    editProduit,
    removeProduit,
    submitForm,
    toggleSort,
    categorieLabel,
} = useAdminProduitsCrud()

onMounted(() => {
    init()
})
</script>

<template>

    <div class="home-bg d-flex align-items-center justify-content-center text-white">
        <div class="home-overlay"></div>
        <div class="home-content container text-center">

            <div class="row g-3">
                <!-- FORM -->
                <div class="col-12 col-lg-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h2 class="h5 mb-0">
                                    {{ mode === "create" ? "Créer un produit" : "Modifier le produit" }}
                                </h2>
                                <button class="btn btn-outline-secondary btn-sm" @click="resetForm">
                                    Nouveau
                                </button>
                            </div>

                            <div v-if="error" class="alert alert-danger py-2">
                                {{ error }}
                            </div>

                            <form @submit.prevent="submitForm" class="vstack gap-3">
                                <div>
                                    <label class="form-label">Nom</label>
                                    <input v-model="form.nom" class="form-control" type="text" />
                                </div>

                                <div>
                                    <label class="form-label">Description</label>
                                    <textarea v-model="form.description" class="form-control" rows="4"></textarea>
                                </div>

                                <div>
                                    <label class="form-label">Prix</label>
                                    <input v-model="form.prix" class="form-control" type="number" step="0.01" min="0" />
                                </div>

                                <div>
                                    <label class="form-label">Catégorie</label>
                                    <select v-model="form.categorieIri" class="form-select">
                                        <option value="">— Choisir —</option>
                                        <option v-for="c in categories" :key="c['@id']" :value="c['@id']">
                                            {{ c.nom }}
                                        </option>
                                    </select>
                                    <div class="form-text">
                                        (la relation ManyToOne envoie l’IRI, ex: <code>/api/categories/1</code>)
                                    </div>
                                </div>

                                <div class="form-check">
                                    <input id="dispo" v-model="form.disponible" class="form-check-input"
                                        type="checkbox" />
                                    <label for="dispo" class="form-check-label">Disponible</label>
                                </div>

                                <div class="d-flex gap-2">
                                    <button class="btn btn-primary w-100" type="submit" :disabled="loading">
                                        {{ loading ? "En cours..." : (mode === "create" ? "Ajouter" : "Enregistrer") }}
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button" @click="resetForm"
                                        :disabled="loading">
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
                                <h2 class="h5 mb-0">Produits</h2>

                                <input v-model="search" class="form-control" style="max-width: 320px"
                                    placeholder="Rechercher (nom/description)..." />
                            </div>

                            <div v-if="loading" class="text-muted mb-2">Chargement...</div>

                            <div class="table-responsive">
                                <table class="table align-middle">
                                    <thead>
                                        <tr>
                                            <th role="button" @click="toggleSort('id')">
                                                # <span class="text-muted small">{{ sortKey === "id" ? (sortDir ===
                                                    "asc" ? "↑" : "↓") : "" }}</span>
                                            </th>
                                            <th role="button" @click="toggleSort('nom')">
                                                Nom <span class="text-muted small">{{ sortKey === "nom" ? (sortDir ===
                                                    "asc" ? "↑" : "↓") : "" }}</span>
                                            </th>
                                            <th>Description</th>
                                            <th>Catégorie</th>
                                            <th class="text-end">Prix</th>
                                            <th class="text-center">Dispo</th>
                                            <th class="text-end">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr v-for="p in filteredSortedProduits" :key="p['@id'] || p.id">
                                            <td>{{ p.id }}</td>
                                            <td class="fw-semibold">{{ p.nom }}</td>
                                            <td class="text-muted" style="max-width: 260px;">
                                                {{ p.description }}
                                            </td>
                                            <td>{{ categorieLabel(p) }}</td>
                                            <td class="text-end">{{ Number(p.prix ?? 0).toFixed(2) }} €</td>
                                            <td class="text-center">
                                                <span class="badge"
                                                    :class="p.disponible ? 'text-bg-success' : 'text-bg-secondary'">
                                                    {{ p.disponible ? "Oui" : "Non" }}
                                                </span>
                                            </td>
                                            <td class="text-end">
                                                <div class="btn-group">
                                                    <button class="btn btn-sm btn-outline-primary"
                                                        @click="editProduit(p)">
                                                        Éditer
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-danger"
                                                        @click="removeProduit(p)" :disabled="loading">
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr v-if="!loading && filteredSortedProduits.length === 0">
                                            <td colspan="7" class="text-center text-muted py-4">
                                                Aucun produit.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="text-muted small">
                                Total : <strong>{{ filteredSortedProduits.length }}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

</template>
