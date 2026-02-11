import { computed } from "vue"
import { useAuthStore } from "@/stores/auth"

export function useCompte() {
  const auth = useAuthStore()

  const isLoggedIn = computed(() => auth.isLoggedIn)
  const user = computed(() => auth.user)

  // ✅ pas de "Non renseigné" ici (sinon ça pollue le formulaire)
  const prenom = computed(() => user.value?.prenom ?? "")
  const nom = computed(() => user.value?.nom ?? "")
  const email = computed(() => user.value?.email ?? "")
  const whatsapp = computed(() => user.value?.whatsapp ?? "")
  const roles = computed(() => user.value?.roles ?? [])

  return { isLoggedIn, user, prenom, nom, email, roles, whatsapp }
}
