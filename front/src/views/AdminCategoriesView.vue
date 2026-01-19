<script setup>
import { onMounted } from "vue"
import { useAdminCategoriesCrud } from "@/composables/useAdminCategoriesCrud"

const {
    categories,
    loading,
    error,
    search,
    sortKey,
    sortDir,
    mode,
    form,
    filteredSortedCategories,
    resetForm,
    loadCategories,
    editCategorie,
    removeCategorie,
    submitForm,
    toggleSort,
} = useAdminCategoriesCrud()

onMounted(() => {
    loadCategories()
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
                                    {{ mode === "create" ? "Créer une catégorie" : "Modifier la catégorie" }}
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
                                    <input v-model="form.nom" class="form-control" type="text"
                                        placeholder="Ex: Boissons" />
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

                            <hr />
                            <div class="text-muted small">
                                API : <code>/api/categories</code> (GET/POST/PUT/DELETE)
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LIST -->
                <div class="col-12 col-lg-8">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                <h2 class="h5 mb-0">Catégories</h2>

                                <div class="d-flex gap-2">
                                    <input v-model="search" class="form-control" style="max-width: 260px"
                                        placeholder="Rechercher..." />
                                    <button class="btn btn-outline-primary" @click="loadCategories" :disabled="loading">
                                        Rafraîchir
                                    </button>
                                </div>
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
                                            <th class="text-end">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr v-for="c in filteredSortedCategories" :key="c['@id'] || c.id">
                                            <td>{{ c.id }}</td>
                                            <td class="fw-semibold">{{ c.nom }}</td>
                                            <td class="text-end">
                                                <div class="btn-group">
                                                    <button class="btn btn-sm btn-outline-primary"
                                                        @click="editCategorie(c)">
                                                        Éditer
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-danger"
                                                        @click="removeCategorie(c)" :disabled="loading">
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr v-if="!loading && filteredSortedCategories.length === 0">
                                            <td colspan="3" class="text-center text-muted py-4">
                                                Aucune catégorie.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="text-muted small">
                                Total : <strong>{{ filteredSortedCategories.length }}</strong>
                            </div>

                            <div class="alert alert-warning mt-3 mb-0 py-2">
                                <strong>Note :</strong> si une catégorie est utilisée par des produits,
                                la suppression peut échouer (contrainte SQL). Dans ce cas on gèrera une “suppression
                                refusée” propre.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

</template>
