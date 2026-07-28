<script setup lang="ts">
import { ref, computed, onMounted, resolveComponent } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useApiPrivate } from "@/composables/useApi";
import { useRouter } from "vue-router";
import { statusColor, statusLabel } from "@/types";

const UIcon = resolveComponent("UIcon");
const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UCard = resolveComponent("UCard");

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref<boolean>(true);
const isLoadingRecent = ref<boolean>(true);

// ==== Statistik ringkasan ====
const stats = ref({
  total: 0,
  menunggu: 0,
  proses: 0,
  selesai: 0,
});

// ==== Status jaringan blockchain (Polygon) ====
const blockchainStats = ref({
  networkStatus: "connected" as "connected" | "disconnected",
  chainId: 137,
  lastBlockNumber: 0,
  lastBlockHash: "",
  totalVerified: 0,
  totalOnChain: 0,
});

const polygonscanUrl = computed(() => {
  const baseUrl =
    blockchainStats.value.chainId === 137
      ? "https://polygonscan.com"
      : "https://amoy.polygonscan.com";
  return blockchainStats.value.lastBlockNumber
    ? `${baseUrl}/block/${blockchainStats.value.lastBlockNumber}`
    : baseUrl;
});

const networkLabel = computed(() =>
  blockchainStats.value.chainId === 137
    ? "Polygon Mainnet"
    : "Polygon Amoy (Testnet)",
);

const statusDistribution = ref<{ status: string; count: number }[]>([]);

const visibleDistribution = computed(() =>
  statusDistribution.value.filter((s) => s.count > 0),
);

const getMaxCount = () => {
  if (!visibleDistribution.value.length) return 1;
  return Math.max(...visibleDistribution.value.map((s) => s.count), 1);
};

// ==== Permohonan Terbaru ====
const recentApplications = ref<any[]>([]);
const RECENT_APPLICATIONS_LIMIT = 5;

// Tanggal referensi default = hari ini (dipakai backend untuk filter "bulan ini")
const getTodayDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const statCards = [
  {
    key: "total",
    label: "Total Permohonan",
    icon: "i-tabler-file-certificate",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "menunggu",
    label: "Menunggu Verifikasi",
    icon: "i-tabler-clock-hour-4",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    key: "proses",
    label: "Dalam Proses",
    icon: "i-tabler-loader-2",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    key: "selesai",
    label: "Selesai Bulan Ini",
    icon: "i-tabler-circle-check",
    color: "text-success",
    bg: "bg-success/10",
  },
];

const getRecentApplications = async () => {
  try {
    isLoadingRecent.value = true;

    const landOfficeId = authStore.user?.land_office_id;

    const res = await useApiPrivate().get(
      `/ownership-transfer/${landOfficeId}`,
      {
        params: {
          limit: RECENT_APPLICATIONS_LIMIT,
          page: 1,
          search: "",
          date: getTodayDateString(),
        },
      },
    );

    const applications = res.data?.data?.applications;
    recentApplications.value = Array.isArray(applications) ? applications : [];
  } catch (error) {
    // console.error("Gagal memuat permohonan terbaru:", error);
    recentApplications.value = [];
  } finally {
    isLoadingRecent.value = false;
  }
};

const getDashboardData = async () => {
  try {
    isLoading.value = true;

    const landOfficeId = authStore.user?.land_office_id;

    const [summaryRes, distribusiRes] = await Promise.all([
      useApiPrivate().get(
        `/ownership-transfer/dashboard/summary/${landOfficeId}`,
      ),
      useApiPrivate().get(
        `/ownership-transfer/dashboard/distribusi-status/${landOfficeId}`,
      ),
    ]);

    // ==== Mapping Summary ====
    const summaryData = summaryRes.data?.data;
    if (summaryData) {
      stats.value = {
        total: summaryData.total_permohonan ?? 0,
        menunggu: summaryData.menunggu_verifikasi ?? 0,
        proses: summaryData.dalam_proses ?? 0,
        selesai: summaryData.selesai_bulan_ini ?? 0,
      };
    }

    // ==== Mapping Distribusi Status ====
    const distribusiData = distribusiRes.data?.data;
    if (Array.isArray(distribusiData)) {
      statusDistribution.value = distribusiData.map((item: any) => ({
        status: item.status,
        count: item.jumlah,
      }));
    }
  } catch (error) {
    console.error("Gagal memuat data dashboard:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([getDashboardData(), getRecentApplications()]);
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-highlighted">
          Semangat Pagi!, {{ authStore.user?.name }}
        </h1>
      </div>

      <UButton
        icon="i-tabler-plus"
        label="Buat Permohonan"
        color="primary"
        @click="router.push('/admin/peralihan-hak/create')"
      />
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="card in statCards"
        :key="card.key"
        :ui="{ body: 'p-4 sm:p-4' }"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-muted">{{ card.label }}</span>
            <span class="text-2xl font-bold text-highlighted">
              {{ isLoading ? "-" : (stats as any)[card.key] }}
            </span>
          </div>
          <div
            class="size-11 rounded-lg flex items-center justify-center"
            :class="card.bg"
          >
            <UIcon :name="card.icon" class="size-6" :class="card.color" />
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Status Jaringan Blockchain (Polygon) -->
      <!-- <UCard class="lg:col-span-1">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-tabler-cube" class="size-5 text-primary" />
            <span class="font-semibold text-highlighted">
              Status Jaringan Blockchain
            </span>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Jaringan</span>
            <UBadge color="primary" variant="subtle">
              {{ networkLabel }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Status Koneksi</span>
            <UBadge
              :color="
                blockchainStats.networkStatus === 'connected'
                  ? 'success'
                  : 'error'
              "
              variant="subtle"
              class="gap-1"
            >
              <UIcon
                :name="
                  blockchainStats.networkStatus === 'connected'
                    ? 'i-tabler-plug-connected'
                    : 'i-tabler-plug-connected-x'
                "
                class="size-3.5"
              />
              {{
                blockchainStats.networkStatus === "connected"
                  ? "Terhubung"
                  : "Terputus"
              }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Sertifikat Terverifikasi</span>
            <span class="text-sm font-semibold text-highlighted">
              {{ blockchainStats.totalVerified }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Tercatat On-Chain</span>
            <span class="text-sm font-semibold text-highlighted">
              {{ blockchainStats.totalOnChain }}
            </span>
          </div>

          <div class="flex flex-col gap-1 pt-2 border-t border-default">
            <span class="text-xs text-muted">Blok Terakhir</span>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-tabler-link"
                class="size-3.5 text-muted shrink-0"
              />
              <span class="text-xs font-mono truncate text-highlighted">
                #{{ blockchainStats.lastBlockNumber || "-" }}
              </span>
            </div>
            <span
              class="text-xs font-mono truncate text-muted"
              :title="blockchainStats.lastBlockHash"
            >
              {{ blockchainStats.lastBlockHash || "-" }}
            </span>
          </div>

          <UButton
            icon="i-tabler-external-link"
            label="Lihat di Polygonscan"
            variant="ghost"
            size="sm"
            block
            :to="polygonscanUrl"
            target="_blank"
          />
        </div>
      </UCard> -->

      <!-- Distribusi Status Permohonan -->
      <!-- Distribusi Status Permohonan -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-tabler-chart-bar" class="size-5 text-primary" />
            <span class="font-semibold text-highlighted">
              Distribusi Status Permohonan
            </span>
          </div>
        </template>

        <div class="flex flex-col gap-3">
          <div
            v-for="item in visibleDistribution"
            :key="item.status"
            class="flex items-center gap-3"
          >
            <span class="text-xs w-40 shrink-0 truncate text-muted">
              {{ statusLabel[item.status] ?? item.status }}
            </span>
            <div class="flex-1 h-2.5 rounded-full bg-elevated overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="`bg-${statusColor[item.status] ?? 'neutral'}-500`"
                :style="{ width: `${(item.count / getMaxCount()) * 100}%` }"
              />
            </div>
            <span class="text-xs w-8 text-right font-medium text-highlighted">
              {{ item.count }}
            </span>
          </div>

          <div
            v-if="!isLoading && !visibleDistribution.length"
            class="text-sm text-muted text-center py-6"
          >
            Belum ada data permohonan
          </div>
        </div>
      </UCard>

      <!-- Permohonan Terbaru -->
      <UCard class="lg:col-span-1">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-tabler-file-description"
                class="size-5 text-primary"
              />
              <span class="font-semibold text-highlighted">
                Permohonan Terbaru
              </span>
            </div>
            <UButton
              label="Lihat Semua"
              icon="i-tabler-arrow-right"
              trailing
              variant="ghost"
              size="sm"
              @click="router.push('/admin/peralihan-hak/list-permohonan')"
            />
          </div>
        </template>

        <div class="flex flex-col divide-y divide-default">
          <!-- Skeleton loading -->
          <template v-if="isLoadingRecent">
            <div
              v-for="n in 3"
              :key="`skeleton-${n}`"
              class="flex items-center justify-between gap-3 py-3"
            >
              <div class="flex items-center gap-3 min-w-0 w-full">
                <div
                  class="size-9 rounded-lg bg-elevated animate-pulse shrink-0"
                />
                <div class="flex flex-col gap-1.5 min-w-0 w-1/2">
                  <div class="h-3.5 w-32 rounded bg-elevated animate-pulse" />
                  <div class="h-3 w-24 rounded bg-elevated animate-pulse" />
                </div>
              </div>
              <div
                class="h-5 w-20 rounded-full bg-elevated animate-pulse shrink-0"
              />
            </div>
          </template>

          <template v-else>
            <div
              v-for="app in recentApplications"
              :key="app.id"
              class="flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-elevated/40 -mx-4 px-4 rounded-lg transition-colors"
              @click="router.push(`/admin/peralihan-hak/permohonan/${app.id}`)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                >
                  <UIcon
                    name="i-tabler-file-certificate"
                    class="size-4.5 text-primary"
                  />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-medium truncate">
                    {{ app.person?.name ?? "-" }}
                  </span>
                  <span class="text-xs text-muted font-mono">
                    {{ app.file_number ?? "-" }}
                  </span>
                </div>
              </div>

              <UBadge
                :color="statusColor[app.status] ?? 'neutral'"
                variant="subtle"
                class="capitalize whitespace-nowrap shrink-0"
              >
                {{ statusLabel[app.status] ?? app.status }}
              </UBadge>
            </div>

            <div
              v-if="!recentApplications.length"
              class="text-sm text-muted text-center py-8"
            >
              Belum ada permohonan terbaru bulan ini
            </div>
          </template>
        </div>
      </UCard>
    </div>
  </div>
</template>
