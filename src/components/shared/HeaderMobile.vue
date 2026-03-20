<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { inject, computed } from "vue";

const route = useRoute();
const router = useRouter();
const title = inject("head-title", null);

const exclude = ['home', 'sertifikatku', 'aktaku', 'profile']

const isMainPage = computed(() => {
  return exclude.includes(route.name as string)
})
</script>

<template>
    <header
        v-if="route.name === 'home'"
        class="w-full bg-white flex z-50 justify-between items-center p-5 fixed top-0 shadow-xs"
    >
        <h1>Jejak Tanahku</h1>
        <UIcon name="iconoir:bell" class="size-6" />
    </header>
    <header
        v-else
        class="w-full bg-white flex items-center z-50 p-5 fixed top-0 shadow-xs"
    >
        <UIcon v-if="!isMainPage" name="ri:arrow-left-line" class="size-6" @click="router.back" />
        <p class="text-center w-full font-medium">{{ title }}</p>
    </header>
</template>
