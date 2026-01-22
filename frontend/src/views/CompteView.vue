<script setup>
import { useCompte } from "@/composables/useCompte"

const { isLoggedIn, prenom, nom, email, roles } = useCompte()
</script>

<template>
  <!-- 🔹 Fond identique à la Home -->
  <div class="home-bg d-flex align-items-center justify-content-center text-white">
    <div class="home-overlay"></div>

    <!-- 🔹 Contenu -->
    <div class="home-content container py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">

          <h1 class="h3 mb-4 text-center">Mon compte</h1>

          <div v-if="!isLoggedIn" class="alert alert-warning text-dark">
            Vous devez être connecté pour accéder à cette page.
          </div>

          <div v-else class="card text-dark">
            <div class="card-body">
              <h2 class="h5 card-title mb-3">Informations personnelles</h2>

              <ul class="list-group list-group-flush mb-3">
                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Prénom</span>
                  <span>{{ prenom }}</span>
                </li>

                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Nom</span>
                  <span>{{ nom }}</span>
                </li>

                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Email</span>
                  <span>{{ email }}</span>
                </li>

                <li class="list-group-item d-flex justify-content-between">
                  <span class="fw-semibold">Rôles</span>
                  <span class="text-muted">
                    {{ roles.length ? roles.join(", ") : "—" }}
                  </span>
                </li>
              </ul>

              <div class="alert alert-danger mb-3">
                <strong>Zone sensible</strong><br />
                La suppression du compte est définitive.
              </div>

              <button class="btn btn-outline-danger w-100" disabled>
                Se désinscrire (à venir)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
