<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const open = ref(false);

const links = [
  [
    {
      label: "Dashboard",
      icon: "ri:dashboard-line",
      to: "/admin/dashboard",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Antrian Online",
      // to: "/admin/antrian-online",
      icon: "fluent:people-queue-32-regular",
      defaultOpen: false,
      type: "trigger",
      children: [
        // {
        //   label: "Dashboard",
        //   to: "/admin/antrian-online/dashboard",
        //   exact: true,
        //   onSelect: () => {
        //     open.value = false;
        //   },
        // },
        {
          label: "Antrian",
          to: "/admin/antrian-online/list",
          onSelect: () => {
            open.value = false;
          },
        },
      ],
    },
    {
      label: "Layanan Peralihan Hak",
      to: "/admin/peralihan-hak",
      icon: "i-lucide-settings",
      defaultOpen: false,
      type: "trigger",
      children: [
        // {
        //   label: "Dashboard",
        //   to: "/admin/peralihan-hak/dashboard",
        //   exact: true,
        //   onSelect: () => {
        //     open.value = false;
        //   },
        // },
        {
          label: "Permohonan",
          to: "/admin/peralihan-hak/list-permohonan",
          exact: true,
          onSelect: () => {
            open.value = false;
          },
        },
      ],
    },
    {
      label: "Kelola Hak Akses",
      to: "/admin/hak-akses",
      icon: "i-lucide-settings",
      defaultOpen: false,
      type: "trigger",
      children: [
        {
          label: "Roles",
          to: "/settings",
          exact: true,
          onSelect: () => {
            open.value = false;
          },
        },
        {
          label: "Users",
          to: "/settings/members",
          onSelect: () => {
            open.value = false;
          },
        },
      ],
    },
  ],
] satisfies NavigationMenuItem[][];
</script>

<template>
  <UDashboardGroup unit="rem" storage="local">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header>
        <h1 class="text-center font-bold text-primary">Jejak Tanahku</h1>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <RouterView />
    <NotificationsSlideover />
  </UDashboardGroup>
</template>
