<script setup>
import { onMounted } from "vue"
import { useCompte } from "@/composables/useCompte"
import { useMesCommandes } from "@/composables/useMesCommandes"
import { useCompteEdit } from "@/composables/useCompteEdit"
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()

// 🔹 Données compte (lecture)
const { isLoggedIn, prenom, nom, email, whatsapp, roles } = useCompte()

// 🔹 Edition compte (déstructuré = Solution A)
const {
  editMode,
  saving,
  saveError,
  saveSuccess,
  form,
  startEdit,
  cancelEdit,
  save,
  reset,
} = useCompteEdit({ prenom, nom, whatsapp })

// 🔹 Commandes
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

onMounted(async () => {
  reset() // 🔥 toujours en mode lecture à l’arrivée

  if (isLoggedIn.value) {
    await auth.init()
    loadMesCommandes()
  }
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

              <!-- Messages -->
              <div v-if="saveSuccess" class="alert alert-success">
                Informations mises à jour 👍
              </div>
              <div v-if="saveError" class="alert alert-danger">
                {{ saveError }}
              </div>

              <ul class="list-group list-group-flush mb-3">
                <!-- Prénom -->
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span class="fw-semibold">Prénom</span>

                  <span v-if="!editMode">{{ prenom || "Non renseigné" }}</span>
                  <input
                    v-else
                    v-model="form.prenom"
                    class="form-control form-control-sm"
                    style="max-width:240px"
                    autocomplete="given-name"
                  />
                </li>

                <!-- Nom -->
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span class="fw-semibold">Nom</span>

                  <span v-if="!editMode">{{ nom || "Non renseigné" }}</span>
                  <input
                    v-else
                    v-model="form.nom"
                    class="form-control form-control-sm"
                    style="max-width:240px"
                    autocomplete="family-name"
                  />
                </li>

                <!-- Email -->
                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Email</span>
                  <span>{{ email }}</span>
                </li>

                <!-- WhatsApp -->
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span class="fw-semibold">WhatsApp</span>

                  <span v-if="!editMode">{{ whatsapp || "Non renseigné" }}</span>
                  <input
                    v-else
                    v-model="form.whatsapp"
                    class="form-control form-control-sm"
                    style="max-width:240px"
                    placeholder="+33..."
                    autocomplete="tel"
                  />
                </li>

                <!-- Rôles -->
                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Rôles</span>
                  <span class="text-muted">
                    {{ roles.length ? roles.join(", ") : "—" }}
                  </span>
                </li>
              </ul>

              <!-- Boutons -->
              <div v-if="!editMode" class="d-grid gap-2">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="startEdit"
                >
                  Modifier mes infos
                </button>

                <button class="btn btn-outline-danger" disabled>
                  Se désinscrire (à venir)
                </button>
              </div>

              <div v-else class="d-grid gap-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="saving"
                  @click="save"
                >
                  {{ saving ? "Enregistrement..." : "Enregistrer" }}
                </button>

                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :disabled="saving"
                  @click="cancelEdit"
                >
                  Annuler
                </button>
              </div>

              <hr class="my-4" />

              <!-- Commandes -->
              <div class="d-grid">
                <button
                  class="btn btn-outline-primary"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseMesCommandes"
                >
                  Mes commandes ({{ commandes.length }})
                </button>
              </div>

              <div class="collapse mt-3" id="collapseMesCommandes">
                <div v-if="cmdError" class="alert alert-danger py-2">
                  {{ cmdError }}
                </div>

                <div v-if="cmdLoading" class="text-muted">
                  Chargement de vos commandes...
                </div>

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
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="c in commandes" :key="c.id">
                        <td>{{ c.id }}</td>
                        <td>{{ formatDateTime(c.dateCommande) }}</td>
                        <td>{{ formatDateOnly(c.dateRetrait) }}</td>
                        <td>{{ c.statut }}</td>
                        <td class="text-end">
                          <button class="btn btn-sm btn-outline-primary" @click="openDetails(c)">
                            Détail
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
