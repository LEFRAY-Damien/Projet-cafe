<script setup>
import Navbar from "./components/Navbar.vue"
import Footer from "./components/Footer.vue"
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <Navbar />

    <!-- 🔑 router-view devient un conteneur flex -->
    <main class="flex-grow-1 d-flex flex-column">
      <router-view class="flex-grow-1 d-flex flex-column" />
    </main>

    <Footer />
  </div>
</template>
