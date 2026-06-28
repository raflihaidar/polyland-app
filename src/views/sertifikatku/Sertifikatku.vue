<script setup lang="ts">
import type { TabsItem, DropdownMenuItem } from "@nuxt/ui";
import {
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  computed,
  nextTick,
} from "vue";
import { type CertificateParams, type CertificateStatus } from "@/types";
import { useRoute, useRouter } from "vue-router";
import { useApiPrivate } from "@/composables/useApi";

provide("head-title", "Sertifikatku");

const router = useRouter();
const route = useRoute();
const api = useApiPrivate();

const typeCertificate = ref<TabsItem[]>([
  { label: "Semua", value: "" },
  { label: "SHM", value: "SHM" },
  { label: "SHGB", value: "SHGB" },
  { label: "SHGU", value: "SHGU" },
]);

const activeTab = ref("");
const certificates = ref<any[]>([]);
const isLoading = ref(false);
const hasMore = ref(true);
const selectedSort = ref("createdAt_desc");
const sentinel = ref<HTMLElement | null>(null);

const params = ref<CertificateParams>({
  page: 1,
  limit: 10,
  search: "",
  type: null,
  status: null,
  sortOrder: "desc",
  sortBy: "createdAt",
});

// ========================
// IntersectionObserver
// ========================
let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (!sentinel.value) return;

  observer = new IntersectionObserver(
    async (entries) => {
      const entry = entries[0];
      if (entry!.isIntersecting && !isLoading.value && hasMore.value) {
        params.value.page += 1;
        await getListCertificate(true);
      }
    },
    {
      root: null,
      rootMargin: "0px 0px 300px 0px",
      threshold: 0,
    },
  );

  observer.observe(sentinel.value);
};

// ========================
// API
// ========================
const getListCertificate = async (append = false) => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;

    const { data } = await api.get("/certificate", {
      params: params.value,
    });

    const incoming = data.data || [];

    if (append) {
      certificates.value.push(...incoming);
    } else {
      certificates.value = incoming;
    }

    hasMore.value = incoming.length >= params.value.limit;
  } finally {
    isLoading.value = false;
  }
};

const resetAndFetch = async () => {
  params.value.page = 1;
  hasMore.value = true;
  await getListCertificate(false);
};

// ========================
// Search
// ========================
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    resetAndFetch();
  }, 300);
};

// ========================
// Tab
// ========================
const handleSelectedTab = (value: string) => {
  router.replace({
    query: { ...route.query, type: value || undefined },
  });
  params.value.type = value || null;
  resetAndFetch();
};

watch(activeTab, (value) => {
  handleSelectedTab(value);
});

// ========================
// Sort
// ========================
const items = computed(
  () =>
    [
      {
        label: "Urutkan",
        icon: "tabler:sort-descending",
        type: "label" as const,
      },
      { type: "separator" as const },
      {
        label: "Terbaru",
        type: "checkbox" as const,
        checked: selectedSort.value === "createdAt_desc",
        onUpdateChecked() {
          selectedSort.value = "createdAt_desc";
          params.value.sortBy = "createdAt";
          params.value.sortOrder = "desc";
          resetAndFetch();
        },
      },
      {
        label: "Terlama",
        type: "checkbox" as const,
        checked: selectedSort.value === "createdAt_asc",
        onUpdateChecked() {
          selectedSort.value = "createdAt_asc";
          params.value.sortBy = "createdAt";
          params.value.sortOrder = "asc";
          resetAndFetch();
        },
      },
      {
        label: "Nama A - Z",
        type: "checkbox" as const,
        checked: selectedSort.value === "label_asc",
        onUpdateChecked() {
          selectedSort.value = "label_asc";
          params.value.sortBy = "label";
          params.value.sortOrder = "asc";
          resetAndFetch();
        },
      },
      {
        label: "Nama Z - A",
        type: "checkbox" as const,
        checked: selectedSort.value === "label_desc",
        onUpdateChecked() {
          selectedSort.value = "label_desc";
          params.value.sortBy = "label";
          params.value.sortOrder = "desc";
          resetAndFetch();
        },
      },
    ] satisfies DropdownMenuItem[],
);

// ========================
// Status helpers
// ========================
const STATUS_LABEL: Record<CertificateStatus, string> = {
  AKTIF: "Aktif",
  TIDAK_AKTIF: "Tidak aktif",
  DALAM_PROSES: "Dalam proses",
  BERMASALAH: "Bermasalah",
};

const statusIconMapping = (status: CertificateStatus) => {
  if (status === "AKTIF") return "tabler:circle-check-filled";
  else if (status === "TIDAK_AKTIF") return "ri:close-circle-fill";
  else if (status === "DALAM_PROSES") return "tabler:clock";
  else if (status === "BERMASALAH") return "tabler:face-id-error";
};

const statusColorMapping = (status: CertificateStatus) => {
  if (status === "AKTIF") return "success";
  else if (status === "TIDAK_AKTIF") return "primary";
  else if (status === "DALAM_PROSES") return "warning";
  else if (status === "BERMASALAH") return "error";
};

// ========================
// Lifecycle
// ========================
onMounted(async () => {
  const typeQuery = route.query.type as string;
  if (typeQuery) {
    activeTab.value = typeQuery;
    params.value.type = typeQuery;
  }

  await getListCertificate();
  await nextTick();
  setupObserver();
});

onUnmounted(() => {
  observer?.disconnect();
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<template>
  <div class="flex flex-col">
    <!-- Search & Filter -->
    <section class="shrink-0">
      <div class="flex gap-x-3">
        <UInput
          icon="tabler:search"
          size="xl"
          class="w-full"
          variant="outline"
          placeholder="Cari sertifikat"
          v-model="params.search"
          @input="handleSearch"
        />
        <UDropdownMenu
          :items="items"
          :content="{ align: 'end' }"
          :ui="{ content: 'w-36' }"
        >
          <UButton icon="tabler:filter" size="xl" />
        </UDropdownMenu>
      </div>

      <div class="bg-white w-full">
        <UTabs
          size="md"
          variant="pill"
          v-model="activeTab"
          :content="false"
          :items="typeCertificate"
          class="w-full mt-3 bg-secondary"
        />
      </div>
    </section>

    <!-- List -->
    <section v-if="certificates.length > 0" class="mt-5 space-y-3">
      <div
        v-for="item in certificates"
        :key="item.id"
        class="bg-white p-3 rounded-2xl shadow-border"
      >
        <RouterLink
          :to="`sertifikatku/${item.id}`"
          class="flex flex-col w-full justify-between items-start gap-x-3"
        >
          <div
            class="w-16 h-16 bg-white rounded-xl mb-5 border border-slate-200 p-2"
          >
            <img src="@/assets/logo-garuda.png" alt="" class="w-full" />
          </div>
          <div class="w-full mb-2">
            <section class="w-full flex justify-between items-center">
              <p class="font-semibold text-primary">
                {{ item.label || item.nib }}
              </p>
              <UBadge
                class="rounded-full"
                variant="subtle"
                :label="STATUS_LABEL[item.status as CertificateStatus]"
                :icon="statusIconMapping(item.status)"
                :color="statusColorMapping(item.status)"
              />
            </section>
            <p class="text-xs italic mt-3">
              RT {{ item.address?.rt }}, RW {{ item.address?.rw }},
              {{ item.address?.village }}, Kec. {{ item.address?.district }},
              {{ item.address?.regency }}, {{ item.address?.province }}
            </p>
          </div>
          <div class="text-xs flex items-center gap-x-5 font-medium">
            <UBadge
              class="rounded-full"
              variant="soft"
              :label="item.type"
              icon="tabler:file-certificate"
              color="primary"
            />
            <p class="flex items-center text-slate-500">
              <UIcon name="tabler:ruler-3" class="size-6 mr-2" />
              {{ item.area_size }}
            </p>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Empty state -->
    <section v-if="!isLoading && certificates.length === 0" class="mt-5">
      <UEmpty
        icon="tabler:certificate-2-off"
        title="Belum ada sertifikat"
        description="Tidak ada sertifikat yang sesuai dengan pencarian atau filter yang dipilih."
        :actions="[
          {
            icon: 'tabler:plus-filled',
            label: 'Buat antrian online',
            to: '/antrian-online',
          },
          {
            icon: 'tabler:refresh',
            label: 'Refresh',
            color: 'neutral',
            variant: 'subtle',
            onClick: resetAndFetch,
          },
        ]"
      />
    </section>

    <!-- Sentinel -->
    <div ref="sentinel" class="h-1 w-full" />

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-4">
      <UIcon name="tabler:loader-2" class="size-6 animate-spin text-primary" />
    </div>

    <!-- Habis -->
    <p
      v-if="!hasMore && !isLoading && certificates.length > 0"
      class="text-center text-xs text-slate-400 py-4"
    >
      Semua sertifikat sudah ditampilkan
    </p>
  </div>
</template>
