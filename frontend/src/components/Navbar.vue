<script setup>
import { onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import api from "@/api/axios"
import { useAuthStore } from "../stores/auth"
import { usePanierStore } from "../stores/panier"

const router = useRouter()
const auth = useAuthStore()
const panier = usePanierStore()

const todoCount = ref(0)

function onLogout() {
  auth.logout()
  todoCount.value = 0
  router.replace("/")
}

async function refreshTodoCount() {
  todoCount.value = 0
  if (!auth.isAdmin || !auth.token) return

  try {
    const res = await api.get("/api/admin/commandes", {
      headers: { Authorization: `Bearer ${auth.token}` },
    })

    const list = res.data?.["hydra:member"] ?? res.data?.member ?? res.data ?? []
    todoCount.value = list.filter((c) => ["en_attente", "prete"].includes(c?.statut)).length
  } catch {
    todoCount.value = 0
  }
}

onMounted(() => refreshTodoCount())

watch(
  () => [auth.isAdmin, auth.token],
  () => refreshTodoCount()
)
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style="z-index: 10;">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">Café Français</RouterLink>

      <!-- 🍔 Hamburger -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 🔽 Tout le menu (collapsable) -->
      <div id="mainNavbar" class="collapse navbar-collapse">
        <!-- ✅ TOUT à droite comme avant -->
        <div class="navbar-nav ms-auto align-items-lg-center">
          <RouterLink class="nav-link" to="/produits">Produits</RouterLink>

          <!-- 🛒 PANIER -->
          <RouterLink
            v-if="auth.isLoggedIn"
            to="/panier"
            class="nav-link position-relative"
          >
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
          <RouterLink
            v-if="auth.isAdmin"
            class="nav-link position-relative"
            to="/admin/produits"
          >
            Admin
            <span
              v-if="todoCount > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
            >
              {{ todoCount }}
            </span>
          </RouterLink>

          <!-- 🔑 LOGIN / LOGOUT -->
          <RouterLink v-if="!auth.isLoggedIn" class="nav-link" to="/login">
            Se connecter
          </RouterLink>

          <button
            v-else
            class="btn btn-outline-light btn-sm ms-lg-2 mt-2 mt-lg-0"
            @click="onLogout"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>