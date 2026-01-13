import { createRouter, createWebHistory } from "vue-router"

import HomeView from "../views/HomeView.vue"
import ProduitsView from "../views/ProduitsView.vue"
import LoginView from "../views/LoginView.vue"
import ContactView from "../views/ContactView.vue"
import TestApi from "../views/ProduitsView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/produits", name: "produits", component: ProduitsView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/contact", name: "contact", component: ContactView },
    { path: "/test", name: "test", component: TestApi },
  ],
})

export default router
