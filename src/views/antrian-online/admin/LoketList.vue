<script setup lang="ts">
import { useApiPrivate } from "@/composables/useApi";
import { useAuthStore } from "@/stores/auth.store";
import { onMounted, ref } from "vue";

const authStore = useAuthStore();

const cards = ref([
  {
    title: "Loket Peralihan Hak tanpa Perantara",
    description:
      "Loket untuk mengajukan layanan peralihan hak sertifikat tanah",
    icon: "i-lucide-smile",
    to: "/admin/antrian-online/list-antrian",
  },
]);
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar title="Daftar Loket">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <CustomersAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageGrid>
        <UPageCard
          v-for="(loket, index) in loketList"
          :key="index"
          v-bind="loket"
        />
      </UPageGrid>
    </template>
  </UDashboardPanel>
</template>
