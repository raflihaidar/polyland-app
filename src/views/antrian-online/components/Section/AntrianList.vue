<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>
<template>
  <p>Mulai Mengantri</p>

  <UButton
    @click="router.push('/antrian-online/create')"
    class="absolute left-1/2 bottom-[10%] -translate-x-1/2 -translate-y-1/2"
    label="Mulai Mengantri"
  />
</template>
