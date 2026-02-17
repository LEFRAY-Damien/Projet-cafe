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
  router.replace("/") // ✅ retour accueil, et pas de retour arrière vers /admin
}

async function refreshTodoCount() {
  todoCount.value = 0
  if (!auth.isAdmin || !auth.token) return

  try {
    const res = await api.get("/api/admin/commandes", {
      headers: { Authorization: `Bearer ${auth.token}` },
    })

    const list = res.data?.["hydra:member"] ?? res.data?.member ?? res.data ?? []

    // ✅ à traiter = en_attente + prete
    todoCount.value = list.filter((c) => ["en_attente", "prete"].includes(c?.statut)).length
  } catch {
    todoCount.value = 0
  }
}

onMounted(() => {
  refreshTodoCount()
})

// refresh quand l’admin se connecte / token change
watch(
  () => [auth.isAdmin, auth.token],
  () => refreshTodoCount()
)
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

        <!-- 🔐 ADMIN + badge commandes à traiter -->
        <RouterLink v-if="auth.isAdmin" class="nav-link position-relative" to="/admin/produits">
          Admin
          <span
            v-if="todoCount > 0"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
            title="Commandes à traiter (en attente + prêtes)"
          >
            {{ todoCount }}
          </span>
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
