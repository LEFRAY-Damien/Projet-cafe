<script setup>
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"
import { usePanierStore } from "../stores/panier"

const router = useRouter()
const auth = useAuthStore()
const panier = usePanierStore()

function onLogout() {
  auth.logout()
  router.replace("/") // ✅ retour accueil, et pas de retour arrière vers /admin
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style="z-index:10;">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">Café Français</RouterLink>

      <div class="navbar-nav ms-auto align-items-center">

        <RouterLink class="nav-link" to="/produits">Produits</RouterLink>

        <!-- 🛒 PANIER -->
        <RouterLink v-if="auth.isLoggedIn" to="/panier" class="nav-link position-relative">
          Panier
          <span
            v-if="panier.count > 0"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          >
            {{ panier.count }}
          </span>
        </RouterLink>

        <!-- 👤 COMPTE -->
        <RouterLink v-if="auth.isLoggedIn" class="nav-link" to="/compte">
          Compte
        </RouterLink>

        <RouterLink class="nav-link" to="/contact">Contact</RouterLink>

        <!-- 🔐 ADMIN -->
        <RouterLink v-if="auth.isAdmin" class="nav-link" to="/admin/produits">
          Admin
        </RouterLink>

        <!-- 🔑 LOGIN -->
        <RouterLink v-if="!auth.isLoggedIn" class="nav-link" to="/login">
          Se connecter
        </RouterLink>

        <button v-else class="btn btn-outline-light btn-sm ms-2" @click="onLogout">
          Déconnexion
        </button>

      </div>
    </div>
  </nav>
</template>
