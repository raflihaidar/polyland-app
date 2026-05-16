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

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
// const UCheckbox = resolveComponent("UCheckbox");

const toast = useToast();
const table = useTemplateRef("table");
const authStore = useAuthStore();
const isLoading = ref<boolean>(false);
const loketList = ref<any[]>([]);
const queueList = ref<any[]>([]);
const statusFilter = ref("all");
const selectedLoket = ref<any>(null);
const selectedDate = ref<Date>(new Date());
const searchQuery = ref<string>("");

// Pagination dari server
const serverPagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
});

const columnFilters = ref([]);
const columnVisibility = ref();
const rowSelection = ref({});
const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
});

// Status badge color mapping
const statusColorMap: Record<string, any> = {
  MENUNGGU: "warning",
  DIPANGGIL: "info",
  SELESAI: "success",
  TIDAK_HADIR: "error",
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

    ...(row.original.status === "MENUNGGU"
      ? [
          {
            label: "Panggil Antrian",
            icon: "i-lucide-phone-call",
            onSelect() {
              handelCallQueue(selectedLoket.value?.id);
            },
          },
        ]
      : []),

    {
      label: "Selesaikan Antrian",
      icon: "i-lucide-check-circle",
      onSelect() {
        handleUpdateStatus(row.original.id.toString(), "SELESAI");
      },
    },

    {
      label: "Tandai Tidak Hadir",
      icon: "i-lucide-check-circle",
      color: "error",
      onSelect() {
        handleUpdateStatus(row.original.id.toString(), "TIDAK_HADIR");
      },
    },
  ];
}

const columns: TableColumn<any>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) =>
  //     h(UCheckbox, {
  //       modelValue: table.getIsSomePageRowsSelected()
  //         ? "indeterminate"
  //         : table.getIsAllPageRowsSelected(),
  //       "onUpdate:modelValue": (value: boolean | "indeterminate") =>
  //         table.toggleAllPageRowsSelected(!!value),
  //       ariaLabel: "Pilih semua",
  //     }),
  //   cell: ({ row }) =>
  //     h(UCheckbox, {
  //       modelValue: row.getIsSelected(),
  //       "onUpdate:modelValue": (value: boolean | "indeterminate") =>
  //         row.toggleSelected(!!value),
  //       ariaLabel: "Pilih baris",
  //     }),
  // },
  {
    accessorKey: "queue_number",
    header: "No. Antrian",
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-medium text-lg tabular-nums" },
        "A" + String(row.original.queue_number),
      ),
  },
  {
    accessorKey: "person",
    header: "Nama Pemohon",
    cell: ({ row }) =>
      h("span", { class: "font-medium" }, row.original.person?.name ?? "-"),
  },
  {
    accessorKey: "queue_date",
    header: "Tanggal Antrian",
    cell: ({ row }) => {
      const date = new Date(row.original.queue_date);
      return h(
        "span",
        {},
        date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "equals",
    cell: ({ row }) => {
      const status: string = row.original.status;
      const color = statusColorMap[status] ?? "neutral";
      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", color },
        () => status,
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row),
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
            }),
        ),
      ),
  },
];

// Ambil daftar loket
const getLoketList = async () => {
  try {
    isLoading.value = true;
    const { data } = await useApiPrivate().get(
      `/loket?office_id=${authStore.user?.land_office_id}`,
    );
    if (data.status === "success") {
      loketList.value = data.data;
      selectedLoket.value = loketList.value?.[0] ?? null;
    }
  } catch {
    loketList.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Ambil daftar antrian berdasarkan loket yang dipilih
const getQueueList = async () => {
  if (!selectedLoket.value?.id) return;

  try {
    isLoading.value = true;

    const status = statusFilter.value === "all" ? "" : statusFilter.value;
    const page = serverPagination.value.page;
    const limit = serverPagination.value.limit;
    const date = new Date(selectedDate.value) ?? "";
    const formatted = date.toISOString().split("T")[0];

    const search = searchQuery.value ?? "";

    const { data } = await useApiPrivate().get(
      `/loket/queues/${selectedLoket.value.id}?date=${formatted}&page=${page}&limit=${limit}&status=${status}&search=${search}`,
    );

    if (data.status === "success") {
      queueList.value = data.data.data;
      serverPagination.value = data.data.pagination;
    }
  } catch (error) {
    queueList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handelCallQueue = async (id: string) => {
  try {
    isLoading.value = true;
    const { data } = await useApiPrivate().put(`/queue/call-queue/${id}`);

    if (data.status === "success") {
      toast.add({
        title: data.message,
        color: "success",
      });
      await getQueueList();
    } else {
      toast.add({
        title: data.message,
        color: "error",
      });
    }
  } catch (error: any) {
    // toast.add({
    //   title: error.message,
    // });
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateStatus = async (
  id: string,
  status: "SELESAI" | "TIDAK_HADIR",
) => {
  try {
    isLoading.value = true;
    const { data } = await useApiPrivate().put(`/queue/status/${id}`, {
      status,
    });

    if (data.status === "success") {
      toast.add({
        title: "Berhasil Update Status Antrian",
        description: data.message,
        color: "success",
      });
      await getQueueList();
    } else {
      toast.add({
        title: "Gagal Update Status Antrian",
        description: data.message,
        color: "error",
      });
    }
  } catch (error: any) {
    // toast.add({
    //   title: error.message,
    // });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => statusFilter.value,
  () => {
    serverPagination.value.page = 1;
    getQueueList();
  },
);

watch(
  () => selectedLoket.value,
  () => {
    serverPagination.value.page = 1;
    getQueueList();
  },
);

watch(
  () => selectedDate.value,
  (val) => {
    serverPagination.value.page = 1;
    getQueueList();
  },
);

let searchTimeout: ReturnType<typeof setTimeout>;
watch(
  () => searchQuery.value,
  () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      serverPagination.value.page = 1;
      getQueueList();
    }, 400);
  },
);

const goToPage = (page: number) => {
  serverPagination.value.page = page;
  getQueueList();
};

onMounted(async () => {
  await getLoketList();
  await getQueueList();
});
</script>

<template>
  <UDashboardPanel id="queues">
    <template #header>
      <UDashboardNavbar title="Daftar Antrian">
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
            placeholder="Cari nama pemohon..."
          />

          <!-- Loket Selector -->
          <UPopover
            :content="{
              align: 'start',
              side: 'bottom',
              sideOffset: 8,
            }"
            v-if="loketList.length > 0"
          >
            <UButton
              color="neutral"
              variant="subtle"
              icon="material-symbols:wifi-home-outline-rounded"
            />
            <template #content>
              <div class="p-4">
                <p class="text-lg font-medium">Loket</p>
                <p class="text-xs">Loket anda saat ini</p>
                <div class="flex flex-col gap-1 min-w-40 mt-3">
                  <URadioGroup
                    v-model="selectedLoket"
                    :items="loketList"
                    value-key="id"
                    label-key="name"
                    class="border-2 border-primary p-2 rounded-lg"
                  />
                </div>
              </div>
            </template>
          </UPopover>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <!-- Date Filter -->
          <UInput
            v-model="selectedDate"
            type="date"
            icon="i-lucide-calendar"
            placeholder="Filter tanggal..."
          />

          <!-- Status Filter -->
          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'Semua', value: 'all' },
              { label: 'Menunggu', value: 'MENUNGGU' },
              { label: 'Dipanggil', value: 'DIPANGGIL' },
              { label: 'Selesai', value: 'SELESAI' },
              { label: 'Tidak Hadir', value: 'TIDAK_HADIR' },
            ]"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            placeholder="Filter status"
            class="min-w-36"
          />

          <!-- Column Visibility -->
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi
                      ?.getColumn(column.id)
                      ?.toggleVisibility(!!checked);
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault();
                  },
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Tampilan"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
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
        :data="queueList"
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
          antrian
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
