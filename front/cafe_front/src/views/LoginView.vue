<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"

const router = useRouter()
const auth = useAuthStore()

const email = ref("test@test.com")
const password = ref("")
const error = ref(null)
const loading = ref(false)

const submit = async () => {
  error.value = null
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push("/produits")
  } catch (e) {
    error.value =
      e?.response
        ? `HTTP ${e.response.status} - ${JSON.stringify(e.response.data)}`
        : e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-5" style="max-width: 520px;">
    <h1 class="mb-4">Se connecter</h1>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" autocomplete="email" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Mot de passe</label>
        <input v-model="password" type="password" class="form-control" autocomplete="current-password" required />
      </div>

      <button class="btn btn-dark w-100" :disabled="loading">
        {{ loading ? "Connexion..." : "Connexion" }}
      </button>
    </form>
  </div>
</template>
