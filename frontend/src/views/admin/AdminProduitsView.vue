<script setup>
import { onMounted } from "vue"
import { useAdminProduitsCrud } from "@/composables/useAdminProduitsCrud"

const {
    categories,
    loading,
    error,
    success,
    search,
    sortKey,
    sortDir,
    mode,
    form,
    imagePreview,
    canAddImageNow,
    filteredSortedProduits,
    init,
    resetForm,
    editProduit,
    removeProduit,
    submitForm,
    toggleSort,
    categorieLabel,
    firstImageUrl,
    addImageToCurrentProduct,
    removeImage,
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

                            <div v-if="success" class="alert alert-success py-2">
                                {{ success }}
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
                                </div>

                                <div class="form-check">
                                    <input id="dispo" v-model="form.disponible" class="form-check-input"
                                        type="checkbox" />
                                    <label for="dispo" class="form-check-label">Disponible</label>
                                </div>

                                <!-- ✅ IMAGES -->
                                <div class="border rounded p-2">
                                    <div class="fw-semibold mb-2">
                                        {{ mode === "create" ? "Image à l'ajout (optionnel)" : "Images du produit" }}
                                    </div>

                                    <!-- CREATE : juste choisir une image (pas de liste / pas de supprimer) -->
                                    <div v-if="mode === 'create'">
                                        <select v-model="form.imageMode" class="form-select mb-2">
                                            <option value="url">Lien (URL)</option>
                                            <option value="file">Fichier (upload jpg/png/gif…)</option>
                                        </select>

                                        <div v-if="form.imageMode === 'url'">
                                            <input v-model="form.imageUrl" class="form-control mb-2" type="text"
                                                placeholder="URL de l'image (https://... ou /uploads/...)" />
                                        </div>
                                        <div v-else>
                                            <input class="form-control mb-2" type="file" accept="image/*"
                                                @change="(e) => (form.imageFile = e.target.files?.[0] ?? null)" />
                                        </div>
                                    </div>

                                    <!-- EDIT : vrai CRUD -->
                                    <div v-else>
                                        <select v-model="form.imageMode" class="form-select mb-2">
                                            <option value="url">Lien (URL)</option>
                                            <option value="file">Fichier (upload jpg/png/gif…)</option>
                                        </select>

                                        <div v-if="form.imageMode === 'url'">
                                            <input v-model="form.imageUrl" class="form-control mb-2" type="text"
                                                placeholder="URL de l'image (https://... ou /uploads/...)" />
                                        </div>
                                        <div v-else>
                                            <input class="form-control mb-2" type="file" accept="image/*"
                                                @change="(e) => (form.imageFile = e.target.files?.[0] ?? null)" />
                                        </div>

                                        <button class="btn btn-outline-primary w-100 mb-2" type="button"
                                            @click="addImageToCurrentProduct" :disabled="loading || !canAddImageNow">
                                            Ajouter l’image maintenant
                                        </button>

                                        <!-- Liste + supprimer uniquement en EDIT -->
                                        <div class="d-flex flex-wrap gap-2">
                                            <template v-if="form.iri">
                                                <div v-for="(img, idx) in (filteredSortedProduits.find(x => x['@id'] === form.iri)?.images ?? [])"
                                                    :key="typeof img === 'string' ? img : img['@id']"
                                                    class="border rounded p-1" style="width: 90px;">
                                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                                        <span v-if="idx === 0"
                                                            class="badge text-bg-primary">Cover</span>
                                                        <span v-else class="badge text-bg-light text-muted"> </span>
                                                    </div>

                                                    <div class="ratio ratio-1x1 bg-light rounded overflow-hidden">
                                                        <img v-if="firstImageUrl({ images: [img] })"
                                                            :src="firstImageUrl({ images: [img] })"
                                                            class="object-fit-cover w-100 h-100" alt="image" />
                                                        <div v-else
                                                            class="d-flex align-items-center justify-content-center text-muted small">
                                                            —
                                                        </div>
                                                    </div>

                                                    <button class="btn btn-sm btn-outline-danger w-100 mt-1"
                                                        type="button" @click="removeImage(img)" :disabled="loading">
                                                        Suppr.
                                                    </button>
                                                </div>
                                            </template>
                                        </div>

                                        <div class="form-text mt-2">
                                            Les images apparaissent sur la carte produit (1ère image = miniature).
                                        </div>
                                    </div>
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

                <div class="col-12 col-lg-8">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                <h2 class="h5 mb-0">Produits</h2>

                                <input v-model="search" class="form-control" style="max-width: 320px"
                                    placeholder="Rechercher (nom/description)..." />
                            </div>

                            <div v-if="loading" class="text-muted mb-2">Chargement...</div>

                            <div v-if="!loading && filteredSortedProduits.length === 0"
                                class="text-center text-muted py-4">
                                Aucun produit.
                            </div>

                            <div v-else class="overflow-y-auto pe-1">
                                <div class="d-flex flex-row flex-nowrap overflow-auto pb-2">
                                    <div v-for="p in filteredSortedProduits" :key="p['@id'] || p.id"
                                        class="flex-shrink-0 me-3" style="width: 260px;">
                                        <div class="card h-100 shadow-sm">
                                            <div class="ratio ratio-4x3 bg-light">
                                                <img v-if="firstImageUrl(p)" :src="firstImageUrl(p)"
                                                    class="card-img-top object-fit-cover" :alt="p.nom" />
                                                <div v-else
                                                    class="d-flex align-items-center justify-content-center text-muted">
                                                    Pas d’image
                                                </div>
                                            </div>

                                            <div class="card-body p-2 d-flex flex-column">
                                                <div class="d-flex justify-content-between align-items-start gap-2">
                                                    <div class="text-start">
                                                        <div class="mb-1">
                                                            <span class="badge text-bg-light text-muted">
                                                                {{ categorieLabel(p) }}
                                                            </span>
                                                        </div>

                                                        <div class="fw-semibold">{{ p.nom }}</div>
                                                    </div>


                                                    <span class="badge"
                                                        :class="p.disponible ? 'text-bg-success' : 'text-bg-secondary'">
                                                        {{ p.disponible ? "Oui" : "Non" }}
                                                    </span>
                                                </div>

                                                <div class="text-start small text-muted mt-2" style="min-height: 38px;">
                                                    {{ p.description }}
                                                </div>

                                                <div class="mt-2 text-start fw-semibold">
                                                    {{ Number(p.prix ?? 0).toFixed(2) }} €
                                                </div>

                                                <div class="mt-auto pt-2 d-flex gap-2">
                                                    <button class="btn btn-sm btn-outline-primary w-100"
                                                        @click="editProduit(p)">
                                                        Éditer
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-danger w-100"
                                                        @click="removeProduit(p)" :disabled="loading">
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="text-muted small mt-3">
                                Total : <strong>{{ filteredSortedProduits.length }}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
