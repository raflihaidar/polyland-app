<template>
  <div
    class="fixed inset-x-0 bottom-0 z-40 h-20 max-w-md mx-auto bg-white drop-shadow-2xl"
  >
    <div class="relative grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
      <div
        class="flex flex-col items-center justify-center w-full h-full gap-1 cursor-pointer hover:bg-secondary"
        :class="route.path === '/' ? 'text-primary' : 'text-neutral-400'"
        @click="router.push({ name: 'public.home' })"
      >
        <UIcon name="lucide:home" class="w-6 h-6" />
        <p class="text-xs font-medium">Beranda</p>
      </div>
      <div
        class="flex flex-col items-center justify-center w-full h-full gap-1 cursor-pointer hover:bg-secondary"
        :class="
          route.path === '/profil'
            ? 'text-primary bg-primary-semi'
            : 'text-neutral-400'
        "
        @click="router.push({ name: 'profil' })"
      >
        <UIcon name="ri:user-3-line" class="w-6 h-6" />
        <p class="text-xs font-medium">Profil</p>
      </div>
      <div
        class="absolute flex justify-center transform -translate-x-1/2 w-fit h-fit -top-1/2 left-1/2"
      >
        <button
          class="rounded-full bg-primary shadow-xl min-w-20 min-h-20 w-20 h-20 border-8 border-white flex justify-center items-center"
          @click="router.push({ name: 'public.scan-qr' })"
        >
          <UIcon name="ri:qr-scan-2-line" class="w-11 h-11 text-white" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
</script>

<style scoped>
.custom-shadow {
  box-shadow:
    0 -8px 10px rgba(0, 0, 0, 0.08),
    0 -3px 6px rgba(0, 0, 0, 0.04);
}
</style>
