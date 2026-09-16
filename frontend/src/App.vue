//frontend/src/App.vue
<template>
  <router-view></router-view>
  <NotificationModal />
</template>

<script setup>
import NotificationModal from '@/components/NotificationModal.vue'
</script>

<style>
/* Estilos globales para toda la app */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
 
  background-color: var(--bg-dark, #0f172a); 
}
</style>
