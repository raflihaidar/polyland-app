<script setup lang="ts">
import { ref } from "vue";
import type { NavigationMenuItem } from "@nuxt/ui";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useConfirmDialog } from "@/composables/useConfirmModal";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { capitalizeFirstLetter } from "@/utils/formatter";

const router = useRouter();
const route = useRoute();
const open = ref(false);
const authStore = useAuthStore();
const openMenuPopover = ref(false);
const isLoading = ref(false);
const confirm = useConfirmDialog();
const toast = useToast();

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
      to: "/admin/antrian-online/list",
      icon: "fluent:people-queue-32-regular",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Peralihan Hak",
      to: "/admin/peralihan-hak/list-permohonan",
      icon: "grommet-icons:document-transfer",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Hak Akses",
      to: "/admin/hak-akses",
      icon: "i-lucide-settings",
      defaultOpen: false,
      type: "trigger",
      children: [
        {
          label: "Users",
          to: "/admin/hak-akses/users",
          onSelect: () => {
            open.value = false;
          },
        },
        {
          label: "Roles",
          to: "/admin/hak-akses/roles",
          exact: true,
          onSelect: () => {
            open.value = false;
          },
        },
        {
          label: "Privilege",
          to: "/admin/hak-akses/privilege",
          exact: true,
          onSelect: () => {
            open.value = false;
          },
        },
      ],
    },
  ],
] satisfies NavigationMenuItem[][];

const logout = async () => {
  try {
    const isConfirmed = await confirm({
      title: "Logout",
      description: "Apakah Anda yakin ingin logout dari akun ini?",
    });
    if (!isConfirmed) return;
    isLoading.value = true;
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.log(error);
    toast.add({
      title: "Logout Gagal, silahkan coba lagi",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <UDashboardGroup unit="rem">
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
    </UDashboardSidebar>

    <UDashboardPanel :id="route.name">
      <template #header>
        <UDashboardNavbar :title="route.meta?.title">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UPopover v-model:open="openMenuPopover">
              <div
                class="flex items-center gap-x-3 cursor-pointer"
                @click="openMenuPopover = true"
              >
                <UAvatar size="xl" icon="tabler:user" />
                <p class="font-medium">
                  {{
                    capitalizeFirstLetter(authStore.user?.username || "unknown")
                  }}
                </p>
              </div>
              <template #content>
                <div class="w-64">
                  <div
                    class="flex items-center gap-x-3 border-b border-gray-400 p-3 cursor-pointer"
                  >
                    <UIcon
                      name="tabler:user-square-rounded"
                      class="size-10 text-primary"
                    />
                    <section>
                      <h4 class="text-sm font-medium">Profil</h4>
                      <p class="text-xs text-dark">Lihat detail profil</p>
                    </section>
                  </div>
                  <div class="p-3">
                    <UButton
                      class="m-0"
                      icon="tabler:logout"
                      label="Keluar"
                      @click="logout"
                      :loading="isLoading"
                      block
                    />
                  </div>
                </div>
              </template>
            </UPopover>
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <RouterView />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
