<script setup>
import { useLoginForm } from "@/composables/useLoginForm"

const { email, password, error, loading, submit } = useLoginForm({
  redirectTo: "/produits",
  defaultEmail: "test@test.com",
})
</script>

<template>
  <div class="home-bg d-flex align-items-center justify-content-center text-white">
    <div class="home-overlay"></div>

    <div class="home-content container" style="max-width: 520px;">
      <div class="text-center mb-4">
        <h1 class="mb-2">Se connecter</h1>
        <p class="mb-0 opacity-75">Accède à ton compte Café Français</p>
      </div>

      <div class="card bg-dark bg-opacity-75 border-0 shadow">
        <div class="card-body p-4">
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <form @submit.prevent="submit">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="email"
                type="email"
                class="form-control"
                autocomplete="email"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Mot de passe</label>
              <input
                v-model="password"
                type="password"
                class="form-control"
                autocomplete="current-password"
                required
              />
            </div>

            <button class="btn btn-light w-100" :disabled="loading">
              {{ loading ? "Connexion..." : "Connexion" }}
            </button>
          </form>

          <div class="text-center mt-3">
            <small class="opacity-75">Pas encore de compte ? (plus tard)</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
