<script setup lang="ts">
import { provide } from "vue";
import MobileLayout from "../../layouts/Mobile.vue";

provide("head-title", "Aktaku");
</script>

<template>
  <MobileLayout>
    <p>Aktaku</p>
  </MobileLayout>
</template>
