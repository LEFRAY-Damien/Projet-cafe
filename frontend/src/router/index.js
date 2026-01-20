import { createRouter, createWebHistory } from "vue-router"

import HomeView from "../views/HomeView.vue"
import ProduitsView from "../views/ProduitsView.vue"
import LoginView from "../views/LoginView.vue"
import ContactView from "../views/ContactView.vue"
import CgvView from "../views/CgvView.vue"
import ConfidentialiteView from "../views/ConfidentialiteView.vue"
import MentionsLegalesView from "../views/MentionsLegalesView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/produits", name: "produits", component: ProduitsView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/contact", name: "contact", component: ContactView },

    // Si tu veux garder /test, mets une vraie page dédiée plus tard
    // { path: "/test", name: "test", component: () => import("../views/TestApiView.vue") },

    { path: "/cgv", component: CgvView },

    {
      path: "/admin",
      component: () => import("@/views/admin/AdminLayout.vue"),
      children: [
        { path: "produits", component: () => import("@/views/admin/AdminProduitsView.vue") },
        { path: "categories", component: () => import("@/views/admin/AdminCategoriesView.vue") },
        { path: "images", component: () => import("@/views/admin/AdminImagesView.vue") },
        { path: "commandes", component: () => import("@/views/admin/AdminCommandesView.vue") },
        { path: "users", component: () => import("@/views/admin/AdminUsersView.vue") },
        { path: "", redirect: "/admin/produits" },
      ],
    },

    { path: "/confidentialite", component: ConfidentialiteView },
    { path: "/mentions-legales", component: MentionsLegalesView },
  ],
})

export default router
