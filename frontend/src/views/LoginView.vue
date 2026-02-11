<script setup>
import { useLoginForm } from "@/composables/useLoginForm"
import { useRegisterForm } from "@/composables/useRegisterForm"

// ✅ destructuring : refs top-level (sinon v-model reçoit un objet ref)
const {
  email: loginEmail,
  password: loginPassword,
  error: loginError,
  loading: loginLoading,
  submit: submitLogin,
} = useLoginForm({
  redirectTo: "/produits",
  defaultEmail: "test@test.com",
})

const {
  prenom,
  nom,
  email: registerEmail,
  whatsapp,
  plainPassword,
  plainPassword2,
  error: registerError,
  loading: registerLoading,
  submit: submitRegister,
} = useRegisterForm({
  redirectTo: "/produits",
  autoLogin: true,
})
</script>

<template>
  <div class="home-bg d-flex align-items-center justify-content-center">
    <div class="home-overlay"></div>

    <div class="home-content container py-4" style="max-width: 980px;">
      <div class="text-center mb-4 text-white">
        <h1 class="mb-2">Café Français</h1>
        <p class="mb-0 opacity-75">Connexion / Création de compte</p>
      </div>

      <div class="row g-3">
        <!-- LOGIN -->
        <div class="col-12 col-lg-6">
          <div class="card bg-dark bg-opacity-75 border-0 shadow h-100 text-white">
            <div class="card-body p-4">
              <h2 class="h4 mb-3">Se connecter</h2>

              <div v-if="loginError" class="alert alert-danger">
                {{ loginError }}
              </div>

              <form @submit.prevent="submitLogin">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    v-model="loginEmail"
                    type="email"
                    class="form-control"
                    autocomplete="email"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Mot de passe</label>
                  <input
                    v-model="loginPassword"
                    type="password"
                    class="form-control"
                    autocomplete="current-password"
                    required
                  />
                </div>

                <button class="btn btn-light w-100" :disabled="loginLoading">
                  {{ loginLoading ? "Connexion..." : "Connexion" }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- REGISTER -->
        <div class="col-12 col-lg-6">
          <div class="card bg-dark bg-opacity-75 border-0 shadow h-100 text-white">
            <div class="card-body p-4">
              <h2 class="h4 mb-3">Créer un compte</h2>

              <div v-if="registerError" class="alert alert-danger">
                {{ registerError }}
              </div>

              <form @submit.prevent="submitRegister">
                <div class="row g-2">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Prénom</label>
                    <input v-model="prenom" class="form-control" autocomplete="given-name" required />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nom</label>
                    <input v-model="nom" class="form-control" autocomplete="family-name" required />
                  </div>
                </div>

                <div class="mt-3">
                  <label class="form-label">Email</label>
                  <input v-model="registerEmail" type="email" class="form-control" autocomplete="email" required />
                </div>

                <div class="mt-3">
                  <label class="form-label">WhatsApp (optionnel)</label>
                  <input v-model="whatsapp" class="form-control" placeholder="+33..." autocomplete="tel" />
                </div>

                <div class="mt-3">
                  <label class="form-label">Mot de passe</label>
                  <input v-model="plainPassword" type="password" class="form-control" autocomplete="new-password" required />
                </div>

                <div class="mt-3">
                  <label class="form-label">Confirmer</label>
                  <input v-model="plainPassword2" type="password" class="form-control" autocomplete="new-password" required />
                </div>

                <button class="btn btn-outline-light w-100 mt-3" :disabled="registerLoading">
                  {{ registerLoading ? "Création..." : "Créer mon compte" }}
                </button>
              </form>

              <small class="d-block mt-3 opacity-75">
                Tu peux ensuite gérer tes favoris et tes commandes.
              </small>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
