import { createRouter, createWebHistory } from "vue-router"

import HomeView from "../views/HomeView.vue"
import ProduitsView from "../views/ProduitsView.vue"
import LoginView from "../views/LoginView.vue"
import ContactView from "../views/ContactView.vue"
import TestApi from "../views/ProduitsView.vue"
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
    { path: "/test", name: "test", component: TestApi },
    { path: "/cgv", component: CgvView },
    { path: "/confidentialite", component: ConfidentialiteView },
    { path: "/mentions-legales", component: MentionsLegalesView }
  ],
})

export default router
