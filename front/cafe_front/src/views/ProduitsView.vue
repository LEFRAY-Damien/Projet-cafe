<script setup>
import { onMounted, ref } from "vue";
import api from "../api/axios";

const loading = ref(true);
const error = ref(null);
const raw = ref(null);
const produits = ref([]);

onMounted(async () => {
  try {
    const res = await api.get("/api/produits");
    raw.value = res.data;
    produits.value = res.data.member ?? res.data["hydra:member"] ?? [];

  } catch (e) {
    error.value =
      e?.response
        ? `HTTP ${e.response.status} - ${JSON.stringify(e.response.data)}`
        : e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <h1>Test API</h1>

  <p v-if="loading">Chargement…</p>

  <p v-else-if="error" style="color:red;">
    Erreur: {{ error }}
  </p>

  <div v-else>
    <h2>Produits ({{ produits.length }})</h2>

    <ul>
      <li v-for="p in produits" :key="p.id ?? p['@id']">
        {{ p.nom ?? p.name ?? p.titre ?? p['@id'] }}
      </li>
    </ul>

    <h3>Réponse brute</h3>
    <pre style="white-space: pre-wrap">{{ raw }}</pre>
  </div>
</template>
