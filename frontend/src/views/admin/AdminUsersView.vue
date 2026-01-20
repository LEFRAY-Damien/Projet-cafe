<script setup>
import { onMounted } from "vue"
import { useAdminUsersCrud } from "../../composables/useAdminUsersCrud"

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
} = useAdminUsersCrud()

onMounted(() => loadUsers())
</script>

<template>
  <div class="row g-3">
    <!-- FORM -->
    <div class="col-12 col-lg-4">
      <div class="card shadow-sm">
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
              <input v-model="form.whatsapp" class="form-control" type="text" placeholder="+33..." />
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
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 class="h5 mb-0">Utilisateurs</h2>

            <div class="d-flex gap-2">
              <input
                v-model="search"
                class="form-control"
                style="max-width: 320px"
                placeholder="Rechercher (email, nom, rôle...)"
              />
              <button class="btn btn-outline-primary" @click="loadUsers" :disabled="loading">
                Rafraîchir
              </button>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
          <div v-if="loading" class="text-muted mb-2">Chargement...</div>

          <div class="table-responsive" v-if="!loading">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th role="button" @click="toggleSort('id')">
                    # <span class="text-muted small">{{ sortKey === "id" ? "↕" : "" }}</span>
                  </th>
                  <th role="button" @click="toggleSort('email')">
                    Email <span class="text-muted small">{{ sortKey === "email" ? "↕" : "" }}</span>
                  </th>
                  <th>Nom</th>
                  <th>Rôles</th>
                  <th class="text-center">Actif</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="u in filteredSortedUsers" :key="u['@id'] || u.id">
                  <td class="fw-semibold">{{ u.id }}</td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.prenom }} {{ u.nom }}</td>
                  <td class="text-muted">{{ rolesLabel(u) }}</td>
                  <td class="text-center">
                    <span class="badge" :class="u.isActive ? 'text-bg-success' : 'text-bg-secondary'">
                      {{ u.isActive ? "Oui" : "Non" }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" @click="editUser(u)">
                        Éditer
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" @click="toggleActive(u)" :disabled="loading">
                        Toggle actif
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredSortedUsers.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">Aucun utilisateur.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="text-muted small">
            Note : on ne gère pas le mot de passe ici (non exposé dans <code>user:write</code>).
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
