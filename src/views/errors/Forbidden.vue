<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4"
  >
    <p class="text-8xl font-bold text-primary">403</p>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      Akses Ditolak
    </h1>
    <p class="text-gray-500 dark:text-gray-400 max-w-md">
      Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi
      administrator jika ini adalah kesalahan.
    </p>
    <div class="flex gap-3 mt-2">
      <UButton
        label="Kembali"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.back()"
      />
      <UButton
        label="Ke Beranda"
        icon="i-lucide-home"
        color="primary"
        @click="router.push('/')"
      />
    </div>
  </div>
</template>
