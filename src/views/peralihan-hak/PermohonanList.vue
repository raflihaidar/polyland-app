<script setup lang="ts">
import {
  useTemplateRef,
  h,
  ref,
  watch,
  resolveComponent,
  onMounted,
} from "vue";
import { upperFirst } from "scule";
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel, type Row } from "@tanstack/table-core";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useAuthStore } from "@/stores/auth.store";
import { useApiPrivate } from "@/composables/useApi";
import { useRouter } from "vue-router";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const router = useRouter();
const toast = useToast();
const table = useTemplateRef("table");
const authStore = useAuthStore();
const isLoading = ref<boolean>(false);
const applicationList = ref<any[]>([]);
const statusFilter = ref("all");
const typeFilter = ref("all");
const selectedDate = ref<string>("");
const searchQuery = ref<string>("");

// Pagination dari server
const serverPagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});

const columnFilters = ref([]);
const columnVisibility = ref();
const rowSelection = ref({});
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

// Status badge color mapping
const statusColorMap: Record<string, any> = {
  DIPROSES: "info",
  VERIFIKASI_BERKAS: "warning",
  MENUNGGU_PEMBAYARAN: "warning",
  PENANDATANGANAN: "primary",
  DITOLAK: "error",
  SELESAI: "success",
};

const statusLabelMap: Record<string, string> = {
  DIPROSES: "Diproses",
  VERIFIKASI_BERKAS: "Verifikasi Berkas",
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  PENANDATANGANAN: "Penandatanganan",
  DITOLAK: "Ditolak",
  SELESAI: "Selesai",
};

function getRowItems(row: Row<any>) {
  return [
    {
      type: "label",
      label: "Aksi",
    },
    {
      type: "separator",
    },
    {
      label: "Lihat Detail",
      icon: "i-lucide-eye",
      onSelect() {
        router.push(`/admin/peralihan-hak/${row.original.id}`);
      },
    },
    {
      label: "Verifikasi Berkas",
      icon: "i-lucide-file-check",
      onSelect() {
        handleUpdateStatus(row.original.id, "VERIFIKASI_BERKAS");
      },
    },
    {
      label: "Selesaikan",
      icon: "i-lucide-check-circle",
      onSelect() {
        handleUpdateStatus(row.original.id, "SELESAI");
      },
    },
    {
      type: "separator",
    },
    {
      label: "Tolak Permohonan",
      icon: "i-lucide-x-circle",
      color: "error",
      onSelect() {
        handleUpdateStatus(row.original.id, "DITOLAK");
      },
    },
  ];
}

const columns: TableColumn<any>[] = [
  {
    accessorKey: "file_number",
    header: "No. Berkas",
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-mono text-sm font-medium" },
        row.original.file_number ?? "-",
      ),
  },
  {
    accessorKey: "person",
    header: "Nama Pemohon",
    cell: ({ row }) =>
      h("div", { class: "flex flex-col gap-0.5" }, [
        h("span", { class: "font-medium" }, row.original.person?.name ?? "-"),
        h(
          "span",
          { class: "text-xs text-muted" },
          row.original.person?.nik ?? "",
        ),
      ]),
  },
  {
    accessorKey: "land",
    header: "Lokasi Tanah",
    cell: ({ row }) => {
      const land = row.original.land;
      if (!land) return h("span", {}, "-");
      const address = `${land.street_address}, RT ${land.rt}/RW ${land.rw}, ${land.village?.name}, ${land.district?.name}`;
      return h("div", { class: "flex flex-col gap-0.5" }, [
        h("span", { class: "text-sm" }, address),
        h(
          "span",
          { class: "text-xs text-muted" },
          `${land.regency?.name}, ${land.province?.name}`,
        ),
      ]);
    },
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) =>
      h(
        UBadge,
        { variant: "outline", color: "neutral" },
        () => row.original.type ?? "-",
      ),
  },
  {
    accessorKey: "nib",
    header: "NIB",
    cell: ({ row }) =>
      h("span", { class: "font-mono text-sm" }, row.original.nib ?? "-"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.original.status;
      const color = statusColorMap[status] ?? "neutral";
      const label = statusLabelMap[status] ?? status;
      return h(
        UBadge,
        { class: "capitalize whitespace-nowrap", variant: "subtle", color },
        () => label,
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tgl. Permohonan",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return h(
        "span",
        { class: "text-sm whitespace-nowrap" },
        date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) =>
      h(UButton, {
        icon: "ri:eye-line",
        class: "cursor-pointer",
        onClick: () =>
          router.push(`/admin/peralihan-hak/permohonan/${row.original?.id}`),
      }),
  },
];

// Ambil daftar permohonan
const getApplicationList = async () => {
  try {
    isLoading.value = true;

    const status = statusFilter.value === "all" ? "" : statusFilter.value;
    const type = typeFilter.value === "all" ? "" : typeFilter.value;
    const page = serverPagination.value.page;
    const limit = serverPagination.value.limit;
    const search = searchQuery.value ?? "";

    let dateParam = "";
    if (selectedDate.value) {
      dateParam = selectedDate.value;
    }

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status && { status }),
      ...(type && { type }),
      ...(search && { search }),
      ...(dateParam && { date: dateParam }),
    });

    const { data } = await useApiPrivate().get(
      `/ownership-transfer/${authStore.user?.land_office_id}?${params.toString()}`,
    );

    if (data.message) {
      applicationList.value = data.data.applications;
      serverPagination.value.total = data.data.meta.total;
      serverPagination.value.totalPages = data.data.meta.totalPages;
      serverPagination.value.page = data.data.meta.page;
      serverPagination.value.limit = data.data.meta.limit;
    }
  } catch (error) {
    applicationList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateStatus = async (id: string, status: string) => {
  try {
    isLoading.value = true;
    const { data } = await useApiPrivate().put(
      `/ownership-transfer/${id}/status`,
      { status },
    );

    if (data.status === "success") {
      toast.add({
        title: "Berhasil Update Status",
        description: data.message,
        color: "success",
      });
      await getApplicationList();
    } else {
      toast.add({
        title: "Gagal Update Status",
        description: data.message,
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Terjadi Kesalahan",
      description: "Gagal memperbarui status permohonan.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => statusFilter.value,
  () => {
    serverPagination.value.page = 1;
    getApplicationList();
  },
);

watch(
  () => typeFilter.value,
  () => {
    serverPagination.value.page = 1;
    getApplicationList();
  },
);

watch(
  () => selectedDate.value,
  () => {
    serverPagination.value.page = 1;
    getApplicationList();
  },
);

let searchTimeout: ReturnType<typeof setTimeout>;
watch(
  () => searchQuery.value,
  () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      serverPagination.value.page = 1;
      getApplicationList();
    }, 400);
  },
);

const goToPage = (page: number) => {
  serverPagination.value.page = page;
  getApplicationList();
};

onMounted(async () => {
  await getApplicationList();
});
</script>

<template>
  <UDashboardPanel id="peralihan-hak">
    <template #header>
      <UDashboardNavbar title="Daftar Permohonan Peralihan Hak">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Filter Bar -->
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex items-center gap-x-3">
          <!-- Search Input -->
          <UInput
            v-model="searchQuery"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="Cari nama pemohon / NIB..."
          />
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <!-- Date Filter -->
          <UInput
            v-model="selectedDate"
            type="date"
            icon="i-lucide-calendar"
            placeholder="Filter tanggal..."
          />

          <!-- Type Filter -->
          <USelect
            v-model="typeFilter"
            :items="[
              { label: 'Semua Tipe', value: 'all' },
              { label: 'SHM', value: 'SHM' },
              { label: 'SHGB', value: 'SHGB' },
              { label: 'SHGU', value: 'SHGU' },
            ]"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            placeholder="Tipe Sertifikat"
            class="min-w-40"
          />

          <!-- Status Filter -->
          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'Semua Status', value: 'all' },
              { label: 'Diproses', value: 'DIPROSES' },
              { label: 'Verifikasi Berkas', value: 'VERIFIKASI_BERKAS' },
              { label: 'Menunggu Pembayaran', value: 'MENUNGGU_PEMBAYARAN' },
              { label: 'Penandatanganan', value: 'PENANDATANGANAN' },
              { label: 'Ditolak', value: 'DITOLAK' },
              { label: 'Selesai', value: 'SELESAI' },
            ]"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            placeholder="Filter status"
            class="min-w-44"
          />

          <!-- Tambah Permohonan -->
          <UButton
            label="Buat Permohonan"
            icon="i-lucide-plus"
            color="primary"
            class="min-w-44"
            @click="router.push('/admin/peralihan-hak/create')"
          />
        </div>
      </div>

      <!-- Table -->
      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
        class="shrink-0"
        :data="applicationList"
        :columns="columns"
        :loading="isLoading"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0',
        }"
      />

      <!-- Pagination & Info -->
      <div
        class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto"
      >
        <div class="text-sm text-muted">
          Total
          <span class="font-semibold text-highlighted">
            {{ serverPagination.total }}
          </span>
          permohonan
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="serverPagination.page"
            :items-per-page="serverPagination.limit"
            :total="serverPagination.total"
            @update:page="goToPage"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
