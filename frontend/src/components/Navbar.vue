<script setup>
import { useAuthStore } from "../stores/auth"
const auth = useAuthStore()
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style="z-index:10;">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">Café Français</RouterLink>



      <div class="navbar-nav">
        <RouterLink class="nav-link" to="/produits">Produits</RouterLink>
        <RouterLink class="nav-link" to="/contact">Contact</RouterLink>

        <!-- ✅ COMPTE -->
        <RouterLink v-if="auth.isLoggedIn" class="nav-link" to="/compte">
          Compte
        </RouterLink>

        <!-- 🔐 ADMIN -->
        <RouterLink v-if="auth.isAdmin" class="nav-link" to="/admin/produits">
          Admin
        </RouterLink>


        <RouterLink v-if="!auth.isLoggedIn" class="nav-link" to="/login">
          Se connecter
        </RouterLink>

        <button v-else class="btn btn-outline-light btn-sm ms-2" @click="auth.logout()">
          Déconnexion
        </button>
      </div>
    </div>
  </nav>
</template>
