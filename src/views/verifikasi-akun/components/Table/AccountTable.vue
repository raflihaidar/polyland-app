<script setup lang="ts">
import { h, ref, watch, resolveComponent, onMounted } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel, type Row } from "@tanstack/table-core";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useApiPrivate } from "@/composables/useApi";
import { useRouter } from "vue-router";
import { useConfirmDialog } from "@/composables/useConfirmModal";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const router = useRouter();
const toast = useToast();
const confirm = useConfirmDialog()
const isLoading = ref<boolean>(false);
const accountList = ref<any[]>([]);
const statusFilter = ref("all");
const typeFilter = ref("all");
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

const handleApproved = async (id: string) => {
  try {
    isLoading.value = true
    const { data } = await useApiPrivate().put(`/verification-account/verify/${id}`, {
      status: 'APPROVED'
    })

    if (data.status === 'success') {
      toast.add({
        title: 'Berhasil',
        description: 'Berhasil menyetujui akun.',
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Gagal',
      description: error.response.data ?? 'Gagal menyetujui akun.',
    })
  } finally {
    isLoading.value = false
  }
}

const handleReject = async (id: string) => {
  try {
    isLoading.value = true

    const confirmed = await confirm({
      title: 'Konfirmasi penolakan akun',
      description: 'Apakah anda yakin menolak verifikasi akun ini?'
    })

    if(confirmed){
      const { data } = await useApiPrivate().put(`/verification-account/verify/${id}`, {
        status: 'REJECTED'
      })
  
      if (data.status === 'success') {
        toast.add({
          title: 'Berhasil',
          description: 'Berhasil menolak akun.',
        })
      }
    }
  } catch (error: any) {
    toast.add({
      title: 'Gagal',
      description: error.response.data ?? 'Gagal menolak akun.',
    })
  } finally {
    isLoading.value = false
  }
}

const columns: TableColumn<any>[] = [
  {
    accessorKey: "fullName",
    header: "Nama",
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-medium" },
        row.original.fullName ?? "-",
      ),
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-mono text-sm" },
        row.original.nik ?? "-",
      ),
  },
  {
    accessorKey: "phone",
    header: "No. HP",
    cell: ({ row }) =>
      h("span", {}, row.original.phone ?? "-"),
  },
  {
    accessorKey: "gender",
    header: "Jenis Kelamin",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          variant: "subtle",
          color:
            row.original.gender === "LAKI_LAKI"
              ? "primary"
              : "secondary",
        },
        () =>
          row.original.gender === "LAKI_LAKI"
            ? "Laki-laki"
            : "Perempuan",
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
          color: status === "APPROVED" ? "success" : "warning",
        },
        () => status,
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) =>
      h("div", { class: "flex gap-2" }, [
        h(UButton, {
          icon: "radix-icons:check",
          color: "success",
          class: 'cursor-pointer',
          onClick: () => handleApproved(row.original.id)
        }),

        h(UButton, {
          icon: "radix-icons:cross-2",
          color: "error",
          class: 'cursor-pointer',
          onClick: () =>  handleReject(row.original.id)
        }),

        h(UButton, {
          icon: "ri:eye-line",
          color: "primary",
          class: 'cursor-pointer',
          onClick: () =>
            router.push(`/admin/person/${row.original.id}`),
        }),
      ]),
  }
];

// Ambil daftar permohonan
const getListAccount = async () => {
  try {
    isLoading.value = true;

    const status = statusFilter.value === "all" ? "" : statusFilter.value;
    const type = typeFilter.value === "all" ? "" : typeFilter.value;
    const page = serverPagination.value.page;
    const limit = serverPagination.value.limit;
    const search = searchQuery.value ?? "";


    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status && { status }),
      ...(type && { type }),
      ...(search && { search }),
    });

    const { data } = await useApiPrivate().get(
      `/verification-account/list-account`,
    );

    if (data.message) {
      accountList.value = data.data;
      serverPagination.value.total = data.data.meta.total;
      serverPagination.value.totalPages = data.data.meta.totalPages;
      serverPagination.value.page = data.data.meta.page;
      serverPagination.value.limit = data.data.meta.limit;
    }
  } catch (error) {
    // accountList.value = [];
    console.log(error)
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
      await getListAccount();
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

// watch(
//   () => statusFilter.value,
//   () => {
//     serverPagination.value.page = 1;
//     getListAccount();
//   },
// );

// watch(
//   () => typeFilter.value,
//   () => {
//     serverPagination.value.page = 1;
//     getListAccount();
//   },
// );

// watch(
//   () => selectedDate.value,
//   () => {
//     serverPagination.value.page = 1;
//     getListAccount();
//   },
// );

// let searchTimeout: ReturnType<typeof setTimeout>;
// watch(
//   () => searchQuery.value,
//   () => {
//     clearTimeout(searchTimeout);
//     searchTimeout = setTimeout(() => {
//       serverPagination.value.page = 1;
//       getListAccount();
//     }, 400);
//   },
// );

const goToPage = (page: number) => {
  serverPagination.value.page = page;
  getListAccount();
};

onMounted(() => {
  getListAccount();
});
</script>

<template>
  <div class="mt-5">
    <UTable ref="table" v-model:column-filters="columnFilters" v-model:column-visibility="columnVisibility"
      v-model:row-selection="rowSelection" v-model:pagination="pagination" :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }" class="shrink-0" :data="accountList" :columns="columns" :loading="isLoading" :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0',
      }" />

    <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
      <div class="text-sm text-muted">
        Total
        <span class="font-semibold text-highlighted">
          {{ serverPagination.total }}
        </span>
      </div>

      <div class="flex items-center gap-1.5">
        <UPagination :default-page="serverPagination.page" :items-per-page="serverPagination.limit"
          :total="serverPagination.total" @update:page="goToPage" />
      </div>
    </div>
  </div>
</template>
