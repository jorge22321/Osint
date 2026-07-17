//frontend/src/layout/Header.vue
<template>
  <!-- Nota: el left-56 ajusta el espacio para el sidebar -->
  <header class="h-14 w-full border-b border-[#434655] bg-[#11131b] flex justify-between items-center px-6 z-40 sticky top-0 font-sans">
    
    <!-- Barra de búsqueda -->
    <div class="flex items-center flex-1">
      <div class="relative w-full max-w-sm group">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#c3c6d7] text-sm group-focus-within:text-blue-500 transition-colors"></i>
        <input 
          class="w-full bg-[#191b23] border border-[#434655] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#e1e2ed] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-[#8d90a0]" 
          placeholder="Búsqueda global del sistema..." 
          type="text"
        />
      </div>
    </div>

    <!-- Acciones del lado derecho -->
    <div class="flex items-center gap-3">
      <button class="w-8 h-8 flex items-center justify-center text-[#c3c6d7] hover:text-blue-500 transition-colors">
        <i class="fa-solid fa-bell text-sm"></i>
      </button>
      <button class="w-8 h-8 flex items-center justify-center text-[#c3c6d7] hover:text-blue-500 transition-colors">
        <i class="fa-solid fa-moon text-sm"></i>
      </button>
      
      <div class="h-6 w-[1px] bg-[#434655] mx-1"></div>
      
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-500">Sistema Activo</span>
        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>
    </div>
  </header>
</template>