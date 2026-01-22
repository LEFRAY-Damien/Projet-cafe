// src/composables/useCompte.js
import { computed } from "vue"
import { useAuthStore } from "@/stores/auth"

export function useCompte() {
  const auth = useAuthStore()

  const isLoggedIn = computed(() => auth.isLoggedIn)
  const user = computed(() => auth.user)

  // Champs “safe” pour l'affichage (front only)
  const prenom = computed(() => user.value?.prenom ?? "Non renseigné")
  const nom = computed(() => user.value?.nom ?? "Non renseigné")
  const email = computed(() => user.value?.email ?? "Non renseigné")
  const roles = computed(() => user.value?.roles ?? [])

  return {
    isLoggedIn,
    user,
    prenom,
    nom,
    email,
    roles,
  }
}
