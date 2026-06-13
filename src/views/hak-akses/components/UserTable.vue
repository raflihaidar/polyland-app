<script setup lang="ts">
import { h, ref, watch, resolveComponent, onMounted } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useApiPrivate } from "@/composables/useApi";
import { useRouter } from "vue-router";
import { useReferenceStore } from "@/stores/reference.store";
import { useConfirmDialog } from "@/composables/useConfirmModal";
import { useDebounceFn } from "@vueuse/core";
import BasePagination from "@/components/BasePagination.vue";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const referenceStore = useReferenceStore()
const router = useRouter();
const toast = useToast();
const confirm = useConfirmDialog();
const isLoading = ref<boolean>(false);
const userList = ref<any[]>([]);
const statusFilter = ref("all");
const searchQuery = ref<string>("");

const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});

const columnFilters = ref([]);
const columnVisibility = ref();
const rowSelection = ref({});

const handleDelete = useDebounceFn(async (id: string) => {
  try {
    
    const isConfirmed = await confirm({
      title: "Apakah anda yakin menghapus user ini?",
      // description: "Apakah anda yakin menghapus user ini?",
    });
    
    if (isConfirmed) {
      isLoading.value = true;
      const { data } = await useApiPrivate().delete(
        `/person/${id}`,
      );

      if (data.status === "success") {
        toast.add({
          color: 'success',
          title: "Berhasil",
          description: data.message ?? "User berhasil dihapus",
        });

        getUserList()
      }
    }
  } catch (error: any) {
    toast.add({
      title: "Gagal",
      description: error.response.data ?? "User gagal dihapus.",
    });
  } finally {
    isLoading.value = false;
  }
}, 300)

const columns: TableColumn<any>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) =>
      h("span", { class: "font-medium" }, row.original.name ?? "-"),
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) =>
      h("span", { class: "font-mono text-sm" }, row.original.nik ?? "-"),
  },
  {
    accessorKey: "phone",
    header: "No. HP",
    cell: ({ row }) => h("span", {}, row.original.phone ?? "-"),
  },
  {
    accessorKey: "gender",
    header: "Jenis Kelamin",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          variant: "subtle",
          color: row.original.gender === "LAKI_LAKI" ? "primary" : "secondary",
        },
        () => (row.original.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"),
      ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) =>
      h(
        "div",
        { class: "flex gap-1 flex-wrap max-w-64" },
        row.original.roles.map((item: any) =>
          h(
            UBadge,
            {
              variant: "soft",
              color: "primary"
            },
            () => item.role.name
          ),
        )
      ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      return h("div", { class: "flex gap-2" },
        [
          h(UButton, {
            icon: "ri:eye-line",
            color: "neutral",
            class: "cursor-pointer",
            onClick: () => router.push(`/admin/person/${row.original.id}`),
          }),
           h(UButton, {
            icon: "radix-icons:pencil-2",
            color: "warning",
            class: "cursor-pointer",
            onClick: () => router.push(`/admin/person/${row.original.id}`),
          }),
           h(UButton, {
            icon: "radix-icons:trash",
            color: "primary",
            class: "cursor-pointer",
            onClick: () => handleDelete(row.original.id),
          })
        ]);
    },
  },
];

const getUserList = async () => {
  try {
    isLoading.value = true;

    const status = statusFilter.value === "all" ? "" : statusFilter.value;
    const page = pagination.value.page;
    const limit = pagination.value.limit;
    const search = searchQuery.value ?? "";

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status && { status }),
      ...(search && { search }),
    });

    const { data } = await useApiPrivate().get(
      `/person/`, { params }
    );

    if (data.message) {
      userList.value = data.data.users;
      pagination.value.total = data.data.meta.total;
      pagination.value.totalPages = data.data.meta.totalPages;
      pagination.value.page = data.data.meta.page;
      pagination.value.limit = data.data.meta.limit;
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

const goToPage = (page: number) => {
  pagination.value.page = page;
  getUserList();
};

const handleSearch = useDebounceFn(() => {
  getUserList()
}, 300)

const handleFilterStatus = useDebounceFn(() => {
  getUserList()
}, 300)

watch(
  () => [pagination.value.page, pagination.value.limit],
  getUserList,
  { immediate: true }
)

onMounted(async () => {
  await getUserList()
  await referenceStore.getAllRole(searchQuery.value)


  console.log(referenceStore.roles)
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-1.5 mt-5">
    <div class="flex flex-wrap items-center gap-1.5">
      <USelect
        @change="handleFilterStatus"
        v-model="statusFilter"
        :items="referenceStore.roles"
        labelKey="name"
        valueKey="id"
        :ui="{
          trailingIcon:
            'group-data-[state=open]:rotate-180 transition-transform duration-200',
        }"
        placeholder="Filter status"
        class="min-w-44"
      />
    </div>

    <div class="flex items-center gap-x-3">
      <UInput v-model="searchQuery" class="max-w-sm" @input="handleSearch" icon="i-lucide-search"
        placeholder="Cari nama / NIK..." />
    </div>
  </div>
  <div class="mt-5">
    <UTable ref="table" v-model:column-filters="columnFilters" v-model:column-visibility="columnVisibility"
      v-model:row-selection="rowSelection" class="shrink-0" :data="userList" :columns="columns" :loading="isLoading"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0',
      }" />
    <BasePagination v-model="pagination" @goToPage="goToPage" />
  </div>
</template>
