<script setup lang="ts">
import { h, ref, resolveComponent, onMounted, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useApiPrivate } from "@/composables/useApi";
import { useConfirmDialog } from "@/composables/useConfirmModal";
import { useDebounceFn } from "@vueuse/core";
import { useReferenceStore } from "@/stores/reference.store";
import BasePagination from "@/components/BasePagination.vue";

const UButton = resolveComponent("UButton");

const toast = useToast();
const referenceStore = useReferenceStore();
const confirm = useConfirmDialog();
const isLoading = ref(false);
const roleList = ref<any[]>([]);
const searchQuery = ref("");

const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});

// Modal state
const isModalOpen = ref(false);
const isSaving = ref(false);
const editTarget = ref<any>(null);
const formName = ref("");

const openCreate = () => {
  editTarget.value = null;
  formName.value = "";
  isModalOpen.value = true;
};

const openEdit = (row: any) => {
  editTarget.value = row;
  formName.value = row.name;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  formName.value = "";
  editTarget.value = null;
};

const handleSave = async () => {
  if (!formName.value.trim()) {
    toast.add({ title: "Nama role tidak boleh kosong", color: "error" });
    return;
  }
  try {
    isSaving.value = true;
    if (editTarget.value) {
      await useApiPrivate().put(
        `/reference/role/${editTarget.value.id}/update`,
        {
          name: formName.value,
        },
      );
      toast.add({
        title: "Berhasil",
        description: "Role berhasil diperbarui",
        color: "success",
      });
    } else {
      await useApiPrivate().post("/reference/role/create", {
        name: formName.value,
      });
      toast.add({
        title: "Berhasil",
        description: "Role berhasil ditambahkan",
        color: "success",
      });
    }
    closeModal();
    getRoleList();
  } catch (error: any) {
    toast.add({
      title: "Gagal",
      description: error?.response?.data?.message ?? "Terjadi kesalahan",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = useDebounceFn(async (id: number) => {
  try {
    const isConfirmed = await confirm({
      title: "Hapus Role",
      description: "Apakah anda yakin ingin menghapus role ini?",
    });
    if (!isConfirmed) return;

    isLoading.value = true;
    const { data } = await useApiPrivate().delete(
      `/reference/role/${id}/delete`,
    );
    if (data.status === "success") {
      toast.add({
        title: "Berhasil",
        description: data.message,
        color: "success",
      });
      getRoleList();
    }
  } catch (error: any) {
    toast.add({
      title: "Gagal",
      description: error?.response?.data?.message ?? "Role gagal dihapus",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}, 300);

const columns: TableColumn<any>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) =>
      h("span", { class: "text-gray-400" }, `${row.original.id}`),
  },
  {
    accessorKey: "name",
    header: "Nama Role",
    cell: ({ row }) =>
      h("span", { class: "font-medium capitalize" }, row.original.name ?? "-"),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) =>
      h("div", { class: "flex gap-2" }, [
        h(UButton, {
          icon: "radix-icons:pencil-2",
          color: "warning",
          class: "cursor-pointer",
          onClick: () => openEdit(row.original),
        }),
        h(UButton, {
          icon: "radix-icons:trash",
          color: "primary",
          class: "cursor-pointer",
          onClick: () => handleDelete(row.original.id),
        }),
      ]),
  },
];

const getRoleList = async () => {
  try {
    isLoading.value = true;

    const response = await referenceStore.getAllRole(
      searchQuery.value,
      pagination.value.page,
      pagination.value.limit,
    );

    roleList.value = response.data?.roles ?? [];
    // pagination.value.total = response.data?.meta?.total ?? 0;
    // pagination.value.totalPages = response.data?.meta?.totalPages ?? 1;
    // pagination.value.page = response.data?.meta?.page ?? 1;
    // pagination.value.limit = response.data?.meta?.limit ?? 10;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const goToPage = (page: number) => {
  pagination.value.page = page;
  getRoleList();
};

const handleSearch = useDebounceFn(() => {
  pagination.value.page = 1;
  getRoleList();
}, 300);

watch(() => [pagination.value.page, pagination.value.limit], getRoleList, {
  immediate: true,
});

onMounted(() => getRoleList());
</script>

<template>
  <div class="space-y-5">
    <!-- Filter -->
    <div class="flex justify-between gap-x-3">
      <UInput
        v-model="searchQuery"
        class="max-w-xs"
        icon="i-lucide-search"
        placeholder="Cari nama role..."
        @input="handleSearch"
      />
      <UButton
        label="Tambah Role"
        icon="i-lucide-plus"
        color="primary"
        @click="openCreate"
      />
    </div>

    <!-- Table -->
    <UTable
      :data="roleList"
      :columns="columns"
      :loading="isLoading"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
      }"
    />

    <BasePagination v-model="pagination" @goToPage="goToPage" />

    <!-- Modal Create / Edit -->
    <UModal
      v-model:open="isModalOpen"
      :title="editTarget ? 'Edit Role' : 'Tambah Role'"
    >
      <template #body>
        <UFormField label="Nama Role" name="name" required>
          <UInput
            v-model="formName"
            placeholder="Masukkan nama role..."
            class="w-full"
            @keydown.enter="handleSave"
          />
        </UFormField>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Batal"
            color="neutral"
            variant="outline"
            @click="closeModal"
          />
          <UButton
            :label="editTarget ? 'Simpan Perubahan' : 'Tambah'"
            color="primary"
            :loading="isSaving"
            @click="handleSave"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
