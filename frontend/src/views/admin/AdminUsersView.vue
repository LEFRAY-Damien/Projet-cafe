<script setup>
import { onMounted, ref, computed } from "vue"
import { useAdminUsersCrud } from "../../composables/useAdminUsersCrud"

function isSoftDeleted(u) {
  return !!u.deletedAt || String(u?.email || "").startsWith("deleted+")
}

// ✅ Switch
const showDeleted = ref(false)

const {
  loading,
  error,
  search,
  sortKey,
  sortDir,
  form,
  filteredSortedUsers,
  rolesLabel,
  resetForm,
  loadUsers,
  editUser,
  submitForm,
  toggleActive,
  toggleSort,

  // ✅ delete
  deleting,
  deletingId,
  deleteError,
  softDeleteUser,
} = useAdminUsersCrud()

onMounted(() => loadUsers())

// ✅ Liste affichée (cache les supprimés si switch OFF)
const displayedUsers = computed(() => {
  const list = filteredSortedUsers.value || []
  return showDeleted.value ? list : list.filter((u) => !isSoftDeleted(u))
})
</script>

<template>
  <div class="home-bg d-flex align-items-center justify-content-center text-white">
    <div class="home-overlay"></div>

    <div class="home-content container py-4">
      <div class="row g-3">
        <!-- FORM -->
        <div class="col-12 col-lg-4">
          <div class="card shadow-sm text-dark">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h5 mb-0">Éditer un utilisateur</h2>
                <button class="btn btn-outline-secondary btn-sm" @click="resetForm">
                  Vider
                </button>
              </div>

              <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

              <div v-if="!form.id" class="alert alert-info py-2">
                Clique sur <strong>Éditer</strong> dans la liste.
              </div>

              <form v-else @submit.prevent="submitForm" class="vstack gap-3">
                <div>
                  <label class="form-label">Email</label>
                  <input v-model="form.email" class="form-control" type="email" />
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label">Nom</label>
                    <input v-model="form.nom" class="form-control" type="text" />
                  </div>
                  <div class="col-6">
                    <label class="form-label">Prénom</label>
                    <input v-model="form.prenom" class="form-control" type="text" />
                  </div>
                </div>

                <div>
                  <label class="form-label">WhatsApp</label>
                  <input
                    v-model="form.whatsapp"
                    class="form-control"
                    type="text"
                    placeholder="+33..."
                  />
                </div>

                <div>
                  <label class="form-label">Rôles</label>
                  <input
                    v-model="form.rolesText"
                    class="form-control"
                    type="text"
                    placeholder="ROLE_USER,ROLE_ADMIN"
                  />
                  <div class="form-text">
                    Sépare par des virgules. <code>ROLE_USER</code> sera toujours ajouté.
                  </div>
                </div>

                <div class="form-check">
                  <input id="active" v-model="form.isActive" class="form-check-input" type="checkbox" />
                  <label for="active" class="form-check-label">Compte actif</label>
                </div>

                <button class="btn btn-primary" type="submit" :disabled="loading">
                  {{ loading ? "En cours..." : "Enregistrer" }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- LIST -->
        <div class="col-12 col-lg-8">
          <div class="card shadow-sm text-dark">
            <div class="card-body">
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2 class="h5 mb-0">Utilisateurs</h2>

                <div class="d-flex flex-wrap gap-2 align-items-center">
                  <input
                    v-model="search"
                    class="form-control"
                    style="max-width: 320px"
                    placeholder="Rechercher (email, nom, rôle...)"
                  />

                  <!-- ✅ Switch -->
                  <div class="form-check form-switch m-0">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="showDeleted"
                      v-model="showDeleted"
                    />
                    <label class="form-check-label" for="showDeleted">
                      Afficher supprimés
                    </label>
                  </div>

                  <button class="btn btn-outline-primary" @click="loadUsers" :disabled="loading">
                    Rafraîchir
                  </button>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
              <div v-if="deleteError" class="alert alert-danger py-2">{{ deleteError }}</div>
              <div v-if="loading" class="text-muted mb-2">Chargement...</div>

              <div v-if="!loading && displayedUsers.length" class="list-group list-group-flush">
                <div
                  v-for="u in displayedUsers"
                  :key="u.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div class="fw-semibold">
                      {{ u.prenom }} {{ u.nom }}
                    </div>

                    <div class="small text-muted">
                      Adresse mail: {{ u.email }} <br />
                      Role: {{ rolesLabel(u) }}
                    </div>

                    <div class="small">
                      Actif :
                      <span
                        v-if="typeof (u.isActive ?? u.active) === 'boolean'"
                        :class="(u.isActive ?? u.active) ? 'text-success' : 'text-secondary'"
                      >
                        {{ (u.isActive ?? u.active) ? "Oui" : "Non" }}
                      </span>
                      <span v-else class="text-warning">Inconnu</span>
                    </div>
                  </div>

                  <!-- ✅ Si soft deleted => message à la place des boutons -->
                  <div v-if="isSoftDeleted(u)" class="text-muted small">
                    Compte supprimé
                  </div>

                  <!-- ✅ Sinon => boutons normaux -->
                  <div v-else class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="editUser(u)" :disabled="loading" title="Éditer">
                      Éditer
                    </button>

                    <button
                      class="btn btn-outline-secondary"
                      @click="toggleActive(u)"
                      :disabled="loading"
                      title="Activer/Désactiver"
                    >
                      Toggle
                    </button>

                    <button
                      class="btn btn-outline-danger"
                      @click="softDeleteUser(u)"
                      :disabled="loading || deleting"
                      title="Supprimer (soft delete)"
                    >
                      <span v-if="deletingId === u.id" class="spinner-border spinner-border-sm me-1"></span>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              <div v-else-if="!loading" class="text-center text-muted py-4">
                Aucun utilisateur.
              </div>

              <div class="text-muted small">
                Note : on ne gère pas le mot de passe ici (non exposé dans <code>user:write</code>).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
