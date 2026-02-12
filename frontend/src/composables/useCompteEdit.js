import { ref } from "vue"
import api from "@/api/axios"
import { useAuthStore } from "@/stores/auth"

export function useCompteEdit(initial = {}) {
  const auth = useAuthStore()

  const editMode = ref(false)
  const saving = ref(false)
  const saveError = ref(null)
  const saveSuccess = ref(false)

  // ✅ suppression
  const deleting = ref(false)
  const deleteError = ref(null)

  const form = ref({
    prenom: "",
    nom: "",
    whatsapp: "",
  })

  const reset = () => {
    editMode.value = false
    saving.value = false
    saveError.value = null
    saveSuccess.value = false

    deleting.value = false
    deleteError.value = null
  }

  const startEdit = () => {
    saveError.value = null
    saveSuccess.value = false

    const p = initial?.prenom?.value ?? auth.user?.prenom ?? ""
    const n = initial?.nom?.value ?? auth.user?.nom ?? ""
    const w = initial?.whatsapp?.value ?? auth.user?.whatsapp ?? ""

    form.value = { prenom: p || "", nom: n || "", whatsapp: w || "" }
    editMode.value = true
  }

  const cancelEdit = () => {
    editMode.value = false
  }

  const save = async () => {
    saveError.value = null
    saveSuccess.value = false
    saving.value = true

    try {
      const userId = auth.user?.id
      if (!userId) throw new Error("User ID introuvable (auth.user.id)")

      await api.patch(
        `/api/users/${userId}`,
        {
          prenom: form.value.prenom,
          nom: form.value.nom,
          whatsapp: form.value.whatsapp || null,
        },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      )

      await auth.init()

      saveSuccess.value = true
      editMode.value = false
    } catch (e) {
      saveError.value = e?.response
        ? `HTTP ${e.response.status} - ${JSON.stringify(e.response.data)}`
        : e?.message ?? String(e)
    } finally {
      saving.value = false
    }
  }

  // ✅ DELETE compte (self)
  // return true/false (pratique pour la vue)
  const deleteAccount = async () => {
    deleteError.value = null
    deleting.value = true

    try {
      const userId = auth.user?.id
      if (!userId) throw new Error("User ID introuvable (auth.user.id)")

      await api.delete(`/api/users/${userId}`)
      return true
    } catch (e) {
      deleteError.value = e?.response
        ? `HTTP ${e.response.status} - ${JSON.stringify(e.response.data)}`
        : e?.message ?? String(e)
      return false
    } finally {
      deleting.value = false
    }
  }

  return {
    editMode,
    saving,
    saveError,
    saveSuccess,
    form,
    startEdit,
    cancelEdit,
    save,
    reset,

    // ✅ suppression
    deleting,
    deleteError,
    deleteAccount,
  }
}
