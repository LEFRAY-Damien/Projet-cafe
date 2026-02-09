import { computed, onMounted, ref } from "vue"
import api from "@/api/axios"
import { useAuthStore } from "@/stores/auth"

export function useMesCommandes() {
    const auth = useAuthStore()

    const selected = ref(null)
    const detailsLoading = ref(false)
    const detailsError = ref("")


    const commandes = ref([])
    const loading = ref(false)
    const error = ref("")

    const isLoggedIn = computed(() => auth.isLoggedIn)

    async function openDetails(cmd) {
        detailsLoading.value = true
        detailsError.value = ""
        selected.value = null

        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("Token manquant")

            // IMPORTANT: pour un user, le détail est sur /api/commandes/{id} (pas /admin)
            const iri = cmd?.["@id"] ?? (cmd?.id ? `/api/commandes/${cmd.id}` : null)
            if (!iri) throw new Error("Commande invalide")

            const res = await api.get(iri, {
                headers: { Authorization: `Bearer ${token}` },
            })

            selected.value = res.data
        } catch (e) {
            detailsError.value =
                e?.response?.data?.detail ||
                e?.response?.data?.message ||
                e?.message ||
                "Erreur inconnue"
        } finally {
            detailsLoading.value = false
        }
    }

    function closeDetails() {
        selected.value = null
        detailsError.value = ""
    }


    function setError(e) {
        error.value =
            e?.response?.data?.detail ||
            e?.response?.data?.message ||
            e?.message ||
            "Erreur inconnue"
    }

    async function loadMesCommandes() {
        if (!auth.token) return
        loading.value = true
        error.value = ""

        try {
            const res = await api.get("/api/me/commandes", {
                headers: { Authorization: `Bearer ${auth.token}` },
            })


            commandes.value = res.data?.["hydra:member"] ?? res.data?.member ?? res.data ?? []
        } catch (e) {
            setError(e)
        } finally {
            loading.value = false
        }
    }

    function formatDateTime(raw) {
        if (!raw) return "—"
        const d = new Date(raw)
        return isNaN(d.getTime()) ? String(raw) : d.toLocaleString()
    }

    function formatDateOnly(raw) {
        if (!raw) return "—"
        const d = new Date(raw)
        return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString()
    }

    return {
        isLoggedIn,
        commandes,
        loading,
        error,
        loadMesCommandes,
        formatDateTime,
        formatDateOnly,
        selected,
        detailsLoading,
        detailsError,
        openDetails,
        closeDetails,

    }
}
