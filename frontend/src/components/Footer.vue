<template>
  <footer class="bg-dark text-white py-4 mt-auto border-top border-secondary">
    <div class="container text-center small">

      <div class="mb-2">
        © 2026 <strong>Café Français</strong>
      </div>

      <div class="d-flex justify-content-center flex-wrap gap-3">

        <RouterLink to="/mentions-legales" class="text-white-50 text-decoration-none">
          Mentions légales
        </RouterLink>

        <RouterLink to="/confidentialite" class="text-white-50 text-decoration-none">
          Politique de confidentialité
        </RouterLink>

        <RouterLink to="/cgv" class="text-white-50 text-decoration-none">
          CGV
        </RouterLink>
      </div>

    </div>
  </footer>
</template>
