import { ref } from "vue"
import { useRouter } from "vue-router"
import api from "@/api/axios"
import { useAuthStore } from "@/stores/auth"

export function useRegisterForm(options = {}) {
    const router = useRouter()
    const auth = useAuthStore()

    const redirectTo = options.redirectTo ?? "/produits"
    const autoLogin = options.autoLogin ?? true

    const email = ref("")
    const plainPassword = ref("")
    const plainPassword2 = ref("")
    const nom = ref("")
    const prenom = ref("")
    const whatsapp = ref("")

    const error = ref(null)
    const loading = ref(false)

    const submit = async () => {
        error.value = null

        if (plainPassword.value !== plainPassword2.value) {
            error.value = "Les mots de passe ne correspondent pas."
            return
        }

        loading.value = true
        try {
            await api.post("/api/register", {

                email: email.value,
                plainPassword: plainPassword.value,
                nom: nom.value,
                prenom: prenom.value,
                whatsapp: whatsapp.value || null,
            })

            if (autoLogin) {
                await auth.login(email.value, plainPassword.value)
            }

            router.push(redirectTo)
        } catch (e) {
            error.value =
                e?.response
                    ? `HTTP ${e.response.status} - ${JSON.stringify(e.response.data)}`
                    : e?.message ?? String(e)
        } finally {
            loading.value = false
        }
    }

    return {
        email,
        plainPassword,
        plainPassword2,
        nom,
        prenom,
        whatsapp,
        error,
        loading,
        submit,
    }
}
