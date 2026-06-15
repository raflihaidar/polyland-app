<script setup lang="ts">
import { useApiPrivate } from "@/composables/useApi";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { ref, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useReferenceStore } from "@/stores/reference.store";
import { storeToRefs } from "pinia";
import type { Role } from "@/types";

const toast = useToast();
const api = useApiPrivate();
const referenceStore = useReferenceStore();
const { roles } = storeToRefs(referenceStore);

interface PrivilegeItem {
  id: number;
  action: string;
  name: string;
}

interface ModuleItem {
  module_id: number;
  module_name: string;
  privileges: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
  allPrivileges: PrivilegeItem[];
}

interface SectionItem {
  section: string;
  modules: ModuleItem[];
}

const selectedRole = ref<Role | null>(null);
const sections = ref<SectionItem[]>([]);
const loadingRoles = ref(false);
const loadingPrivileges = ref(false);

const actions: { key: keyof ModuleItem["privileges"]; label: string }[] = [
  { key: "create", label: "Create" },
  { key: "read", label: "Read" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
  { key: "export", label: "Export" },
];

const getRoles = async () => {
  try {
    loadingRoles.value = true;
    await referenceStore.getAllRole();
  } catch {
    toast.add({ title: "Gagal memuat role", color: "error" });
  } finally {
    loadingRoles.value = false;
  }
};

const fetchPrivileges = async (role: Role | null) => {
  if (!role?.id) return;
  try {
    loadingPrivileges.value = true;
    sections.value = [];
    const { data } = await api.get(`/privilege/${role.id}`);
    sections.value = data.data ?? [];
  } catch {
    toast.add({ title: "Gagal memuat privilege", color: "error" });
  } finally {
    loadingPrivileges.value = false;
  }
};

const debouncedToggle = useDebounceFn(
  async (
    mod: ModuleItem,
    action: keyof ModuleItem["privileges"],
    value: boolean,
  ) => {
    if (!selectedRole.value?.id) return;

    const prev = mod.privileges[action];
    mod.privileges[action] = value;

    try {
      const privilege = mod.allPrivileges.find((p) => p.action === action);
      if (!privilege) throw new Error("Privilege not found");

      if (value) {
        await api.post(`/privilege/${selectedRole.value.id}/assign`, {
          privilegeId: privilege.id,
        });
      } else {
        await api.delete(`/privilege/${selectedRole.value.id}/remove`, {
          data: { privilegeId: privilege.id },
        });
      }
    } catch {
      mod.privileges[action] = prev;
      toast.add({ title: "Gagal mengubah privilege", color: "error" });
    }
  },
  300,
);

onMounted(async () => {
  await getRoles();
  if (roles.value) {
    selectedRole.value = roles.value[0] ?? null;
    await fetchPrivileges(selectedRole.value);
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Manage Privileges
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Kelola hak akses setiap role
      </p>
    </div>

    <!-- Role Selector -->
    <UCard>
      <UFormField label="Pilih Role" name="role" class="max-w-sm">
        <USelectMenu
          v-model="selectedRole"
          :items="referenceStore.roles"
          :loading="loadingRoles"
          label-key="name"
          placeholder="Pilih role..."
          class="w-full"
          @update:model-value="fetchPrivileges"
        />
      </UFormField>
    </UCard>

    <!-- Privilege Table -->
    <UCard v-if="selectedRole">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-shield-check" class="text-primary size-5" />
          <span class="font-semibold text-gray-800 dark:text-white">
            Privileges — {{ selectedRole.name }}
          </span>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="loadingPrivileges" class="flex justify-center py-16">
        <UIcon
          name="i-lucide-loader-circle"
          class="animate-spin text-3xl text-primary-500"
        />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!sections.length"
        class="flex flex-col items-center justify-center py-16 gap-2"
      >
        <UIcon
          name="i-lucide-inbox"
          class="text-4xl text-gray-300 dark:text-gray-600"
        />
        <p class="text-sm text-gray-400">Tidak ada privilege tersedia</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th
                class="text-left py-3 px-4 font-semibold text-primary dark:text-gray-300 w-64"
              >
                Section / Module
              </th>
              <th
                v-for="action in actions"
                :key="action.key"
                class="text-center py-3 px-2 font-semibold text-primary dark:text-gray-300 w-20"
              >
                {{ action.label }}
              </th>
            </tr>
          </thead>

          <tbody>
            <template v-for="section in sections" :key="section.section">
              <!-- Section Row -->
              <tr class="bg-primary/10 dark:bg-primary-950">
                <td
                  colspan="6"
                  class="py-2 px-4 font-semibold text-primary dark:text-primary-300 uppercase tracking-wide text-xs"
                >
                  {{ section.section }}
                </td>
              </tr>

              <!-- Module Rows -->
              <tr
                v-for="mod in section.modules"
                :key="mod.module_id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td
                  class="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium"
                >
                  {{ mod.module_name }}
                </td>

                <td
                  v-for="action in actions"
                  :key="action.key"
                  class="text-center py-3 px-2"
                >
                  <div class="flex justify-center">
                    <UCheckbox
                      :model-value="mod.privileges[action.key]"
                      :disabled="
                        !mod.allPrivileges.find((p) => p.action === action.key)
                      "
                      @update:model-value="
                        (val: boolean) =>
                          debouncedToggle(mod, action.key, val as boolean)
                      "
                    />
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Placeholder saat belum pilih role -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-24 gap-3 text-center"
    >
      <UIcon
        name="i-lucide-shield"
        class="text-5xl text-gray-200 dark:text-gray-700"
      />
      <p class="text-gray-400 dark:text-gray-500 text-sm">
        Pilih role untuk mengelola privilege
      </p>
    </div>
  </div>
</template>
