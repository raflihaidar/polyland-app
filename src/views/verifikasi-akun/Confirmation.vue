<script setup lang="ts">
import { provide } from "vue";
import { useRouter } from "vue-router";

provide("head-title", "Verifikasi Akun");

const router = useRouter();

const goToHome = () => {
  router.push("/");
};
</script>

<template>
  <div
    class="w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-10 px-4 text-center space-y-6"
  >
    <!-- Icon Success -->
    <div
      class="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 mx-auto"
    >
      <UIcon name="i-lucide-check-circle" class="text-green-600 w-12 h-12" />
    </div>

    <!-- Title -->
    <div>
      <h1 class="text-xl font-semibold">Verifikasi Akun Berhasil Dikirim</h1>
      <p class="text-gray-600 mt-2 text-sm">
        Verifikasi akun anda telah berhasil dikirim dan sedang diproses."
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="w-full space-y-3 pt-4">
      <UButton block variant="outline" @click="goToHome">
        Kembali ke Beranda
      </UButton>
    </div>
  </div>
</template>
