<!-- <script setup lang="ts">
import { useAuthStore } from "@/stores/auth.store";
import { ref } from "vue";
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
</template> -->
