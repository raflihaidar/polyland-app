<script setup lang="ts">
import { h, ref, watch, resolveComponent, onMounted } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useApiPrivate } from "@/composables/useApi";
import { useRouter } from "vue-router";
import { useConfirmDialog } from "@/composables/useConfirmModal";
import { useDebounceFn } from "@vueuse/core";
import BasePagination from "@/components/BasePagination.vue";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const router = useRouter();
const toast = useToast();
const confirm = useConfirmDialog();
const isLoading = ref<boolean>(false);
const accountList = ref<any[]>([]);
const statusFilter = ref("all");
const searchQuery = ref<string>("");
const openModalRejection = ref(false);
const selectedRejectionData = ref<string | null>(null);
const rejectionNotes = ref("");

const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});

const columnFilters = ref([]);
const columnVisibility = ref();
const rowSelection = ref({});

const statusColorMap: Record<string, any> = {
  APPROVED: "success",
  REJECTED: "error",
  PENDING: "warning",
};

const handleApproved = useDebounceFn(async (id: string) => {
  try {
    isLoading.value = true;

    const isConfirmed = await confirm({
      title: "Approved verifikasi akun",
      description: "Apakah anda yakin menyetujui verifikasi akun ini?",
    });

    if (isConfirmed) {
      const { data } = await useApiPrivate().post(
        `/verification-account/verify/${id}`,
        {
          status: "APPROVED",
        },
      );

      if (data.status === "success") {
        toast.add({
          color: "success",
          title: "Berhasil",
          description: data.message ?? "Verifikasi akun berhasil disetujui.",
        });

        getListAccount();
      }
    }
  } catch (error: any) {
    toast.add({
      title: "Gagal",
      description: error.response?.data?.message ?? "Gagal menyetujui akun.",
    });
  } finally {
    isLoading.value = false;
  }
}, 300);

const handleReject = useDebounceFn(async () => {
  try {
    isLoading.value = true;

    const isConfirmed = await confirm({
      title: "Konfirmasi penolakan akun",
      description: "Apakah anda yakin menolak verifikasi akun ini?",
    });

    if (isConfirmed) {
      const { data } = await useApiPrivate().post(
        `/verification-account/verify/${selectedRejectionData.value}`,
        {
          status: "REJECTED",
          rejectionReason: rejectionNotes.value,
        },
      );

      if (data.status === "success") {
        toast.add({
          color: "success",
          title: "Berhasil",
          description: data.message ?? "Verifikasi akun berhasil ditolak",
        });

        getListAccount();
      }
    }
  } catch (error: any) {
    toast.add({
      title: "Gagal",
      description: error.response.data ?? "Gagal menolak akun.",
    });
  } finally {
    openModalRejection.value = false;
    isLoading.value = false;
  }
}, 300);

const selectRejectionData = (id: string) => {
  openModalRejection.value = true;
  selectedRejectionData.value = id;
};

const columns: TableColumn<any>[] = [
  {
    accessorKey: "fullName",
    header: "Nama",
    cell: ({ row }) =>
      h("span", { class: "font-medium" }, row.original.fullName ?? "-"),
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return h(
        UBadge,
        {
          variant: "subtle",
          color: statusColorMap[status] ?? "neutral",
        },
        () => status,
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const isPending = row.original?.status === "PENDING";
      const buttonList: any = [
        h(UButton, {
          icon: "ri:eye-line",
          color: "primary",
          class: "cursor-pointer",
          onClick: () => router.push(`/admin/person/${row.original.id}`),
        }),
      ];
      if (isPending) {
        buttonList.unshift([
          h(UButton, {
            icon: "radix-icons:check",
            color: "success",
            class: "cursor-pointer",
            onClick: () => handleApproved(row.original.id),
          }),
          h(UButton, {
            icon: "radix-icons:cross-2",
            color: "error",
            class: "cursor-pointer",
            onClick: () => selectRejectionData(row.original.id),
          }),
        ]);
      }
      return h("div", { class: "flex gap-2" }, [...buttonList]);
    },
  },
];

const getListAccount = async () => {
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
      `/verification-account/list-account`,
      { params },
    );

    if (data.message) {
      accountList.value = data.data.account;
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
  getListAccount();
};

const handleSearch = useDebounceFn(() => {
  getListAccount();
}, 300);

const handleFilterStatus = useDebounceFn(() => {
  getListAccount();
}, 300);

watch(() => [pagination.value.page, pagination.value.limit], getListAccount, {
  immediate: true,
});

watch(
  () => openModalRejection.value,
  (val) => {
    if (!val) rejectionNotes.value = "";
  },
);

onMounted(() => {
  getListAccount();
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-1.5 mt-5">
    <div class="flex flex-wrap items-center gap-1.5">
      <USelect
        @change="handleFilterStatus"
        v-model="statusFilter"
        :items="[
          { label: 'Semua Status', value: 'all' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Disetujui', value: 'APPROVED' },
          { label: 'Ditolak', value: 'REJECTED' },
        ]"
        :ui="{
          trailingIcon:
            'group-data-[state=open]:rotate-180 transition-transform duration-200',
        }"
        placeholder="Filter status"
        class="min-w-44"
      />
    </div>

    <div class="flex items-center gap-x-3">
      <UInput
        v-model="searchQuery"
        class="max-w-sm"
        @input="handleSearch"
        icon="i-lucide-search"
        placeholder="Cari nama / NIK..."
      />
    </div>
  </div>
  <div class="mt-5">
    <UTable
      ref="table"
      v-model:column-filters="columnFilters"
      v-model:column-visibility="columnVisibility"
      v-model:row-selection="rowSelection"
      class="shrink-0"
      :data="accountList"
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
    <BasePagination v-model="pagination" @goToPage="goToPage" />
  </div>
  <UModal v-model:open="openModalRejection" title="Alasan Penolakan">
    <template #body>
      <UTextarea
        v-model="rejectionNotes"
        class="w-full"
        size="xl"
        placeholder="Berikan alasan penolakan"
        autoresize
      />
    </template>
    <template #footer>
      <div class="flex justify-end w-full gap-x-3">
        <UButton
          label="Batalkan"
          variant="outline"
          @click="openModalRejection = false"
        />
        <UButton label="Tolak" @click="handleReject" />
      </div>
    </template>
  </UModal>
</template>
