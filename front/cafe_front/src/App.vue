<script setup>
import { useAuthStore } from "./stores/auth"
import Footer from "./components/Footer.vue"

const auth = useAuthStore()
</script>

<template>
  <div class="d-flex flex-column min-vh-100">

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style="z-index:10;">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" to="/">Café Français</RouterLink>

        <div class="navbar-nav">
          <RouterLink class="nav-link" to="/produits">Produits</RouterLink>
          <RouterLink class="nav-link" to="/contact">Contact</RouterLink>

          <RouterLink v-if="!auth.isLoggedIn" class="nav-link" to="/login">
            Se connecter
          </RouterLink>
          <button v-else class="btn btn-outline-light btn-sm ms-2" @click="auth.logout()">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>

    <!-- Contenu des pages -->
    <main class="flex-grow-1">
      <router-view />
    </main>

    <!-- Footer global -->
    <Footer />
  </div>
</template>
