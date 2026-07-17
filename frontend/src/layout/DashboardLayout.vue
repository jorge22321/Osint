<template>
  <div class="h-screen bg-[#11131b] text-[#e1e2ed] font-sans overflow-hidden flex">
    <Sidebar />

    <main class="flex-1 flex flex-col ml-56 min-h-0">
      <!-- Header fijo -->
      <Header class="flex-shrink-0" />

      <!-- Contenido con scroll -->
      <div class="flex-1 overflow-y-auto p-0 custom-scrollbar min-h-0">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #11131b;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #434655;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #5a5e73;
}
</style>