import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"

export function useLoginForm(options = {}) {
  const router = useRouter()
  const auth = useAuthStore()

  const redirectTo = options.redirectTo ?? "/produits"
  const defaultEmail = options.defaultEmail ?? "test@test.com"

  const email = ref(defaultEmail)
  const password = ref("")
  const error = ref(null)
  const loading = ref(false)

  const submit = async () => {
    error.value = null
    loading.value = true
    try {
      await auth.login(email.value, password.value)
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
    auth,
    email,
    password,
    error,
    loading,
    submit,
  }
}
