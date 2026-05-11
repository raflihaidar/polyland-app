<script setup lang="ts">
import { provide, ref } from "vue";
import AntrianList from "./components/Section/AntrianList.vue";
import type { TabsItem } from "@nuxt/ui";
import PanggilanList from "./components/Section/PanggilanList.vue";

provide("head-title", "Antrian Daring");

const active = ref("Antrian");

const tabList: TabsItem[] = [
  {
    label: "Antrian",
    value: "Antrian",
  },
  {
    label: "Panggilan",
    value: "panggilan",
  },
];
</script>

<template>
  <template v-if="active === 'Antrian'">
    <AntrianList />
  </template>
  <template v-else>
    <PanggilanList />
  </template>
  <UTabs
    class="absolute bottom-0 left-0 right-0 w-[95%] mx-auto"
    v-model="active"
    :items="tabList"
  />
</template>
