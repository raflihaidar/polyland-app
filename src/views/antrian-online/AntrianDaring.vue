<script setup lang="ts">
import MobileLayout from "@/layouts/Mobile.vue";
import type { OfficeLand, User } from "@/types";
import { provide, ref } from "vue";
import AntrianList from "./components/Section/AntrianList.vue";
import type { TabsItem } from "@nuxt/ui";
import PanggilanList from "./components/Section/PanggilanList.vue";

provide("head-title", "Antrian Daring");

const activeSection = ref<"form" | "loket" | "detail">("form");

const handleMenu = (menu: "form" | "loket" | "detail") => {
  activeSection.value = menu;
};
const active = ref("Antrian");

interface AntrianOnline {
  pemohon: User | null;
  office: OfficeLand | null;
}

const data = ref<AntrianOnline>({
  pemohon: null,
  office: null,
});

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
  <MobileLayout>
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
  </MobileLayout>
</template>
