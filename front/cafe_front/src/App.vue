<template>
  <nav class="navbar navbar-expand-lg navbar-dark text-white bg-transparent position-absolute top-0 w-100"
    style="z-index:10;">

    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">Café Français</RouterLink>

      <div class="navbar-nav">
        <RouterLink class="nav-link" to="/info">Info</RouterLink>
        <RouterLink class="nav-link" to="/produits">Produits</RouterLink>
        <RouterLink class="nav-link" to="/contact">Contact</RouterLink>
        <RouterLink class="nav-link" to="/login">Se connecter</RouterLink>
      </div>
    </div>
  </nav>

  <router-view />
</template>
