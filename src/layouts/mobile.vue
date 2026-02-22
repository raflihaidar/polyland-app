<script setup lang="ts">
import Header from "../components/shared/HeaderMobile.vue";
import Navigation from "../components/shared/NavMobile.vue";
</script>

<template>
    <div class="w-full">
        <Header />
        <div class="w-full bg-secondary h-screen pt-20 px-5">
            <slot />
        </div>
        <Navigation />
    </div>
</template>
