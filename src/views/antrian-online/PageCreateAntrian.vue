<script setup lang="ts">
import type { OfficeLand, User } from "@/types";
import FormCreateAntrian from "./components/Section/FormCreateAntrian.vue";
import LoketList from "./components/Section/LoketList.vue";
import { provide, ref } from "vue";

provide("head-title", "Antrian Daring");

const activeSection = ref<"form" | "loket" | "detail">("form");

const handleMenu = (menu: "form" | "loket" | "detail") => {
  activeSection.value = menu;
};

interface AntrianOnline {
  pemohon: User | null;
  office: OfficeLand | null;
}

const data = ref<AntrianOnline>({
  pemohon: null,
  office: null,
});
</script>

<template>
  <FormCreateAntrian
    v-if="activeSection === 'form'"
    v-model:data="data"
    @handleMenu="handleMenu"
  />
  <LoketList
    v-if="activeSection === 'loket'"
    v-model:data="data"
    @handleMenu="handleMenu"
  />
</template>
