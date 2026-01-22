import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import { useAuthStore } from "./stores/auth"

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import "./assets/main.css"

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

const auth = useAuthStore()
auth.init()

app.use(router)
app.mount("#app")
