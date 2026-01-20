import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import { useAuthStore } from "./stores/auth"

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import "./assets/main.css"

const app = createApp(App)

// 1) Créer Pinia et l'enregistrer
const pinia = createPinia()
app.use(pinia)

// 2) Initialiser l'auth (recharge user depuis token si présent)
const auth = useAuthStore()
auth.init()

// 3) Router + mount
app.use(router)
app.mount("#app")
