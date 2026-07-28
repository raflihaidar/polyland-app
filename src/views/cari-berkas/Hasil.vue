<script setup lang="ts">
import { provide, computed, ref, onMounted } from "vue";
import { useApplicationStore } from "@/stores/application.store";
import { useRoute } from "vue-router";
import { formatRupiah, formatDateIndonesia } from "@/utils/formatter";
import { statusTextColor, type ApplicationData } from "@/types";
import AppLoading from "@/components/shared/AppLoading.vue";
import { router } from "@/router";

const route = useRoute();
const fileNumber = route.query?.fileNumber as string;

provide("head-title", `${fileNumber}`);

const applicationStore = useApplicationStore();

const detailBerkas = ref<ApplicationData | null>(null);
const loading = ref(false);
const errorMessage = ref("");

const statusBerkasMapping = [
  { value: "DIPROSES", label: "Diterima Loket" },
  { value: "VERIFIKASI_BERKAS", label: "Tahap Verifikasi" },
  { value: "MENUNGGU_PEMBAYARAN", label: "Menunggu Pembayaran" },
  { value: "VERIFIKASI_PEMBAYARAN", label: "Tahap Verifikasi Pembayaran" },
  { value: "PROSES_PENERBITAN", label: "Proses Penerbitan Sertifikat" },
  { value: "DITOLAK", label: "Pengajuan Ditolak" },
  { value: "SELESAI", label: "Proses Selesai" },
];

const handlePayment = async () => {
  if (detailBerkas.value) {
    router.push(
      `/cari-berkas/pembayaran/${detailBerkas.value.payment.order_id}`,
    );
  }
};

const getDetailApplication = async () => {
  const { data, status, message } =
    await applicationStore.searchApplication(fileNumber);

  if (status === "success") {
    detailBerkas.value = data;
  } else {
    errorMessage.value = message;
  }
};

const statusBerkasLookup = computed(() => {
  return Object.fromEntries(statusBerkasMapping.map((s) => [s.value, s.label]));
});

const statusLabel = computed(() => {
  return detailBerkas.value
    ? statusBerkasLookup.value[detailBerkas.value.status] || "Unknown"
    : "Memuat...";
});

const statusColor = computed(() => {
  const status = detailBerkas.value?.status;

  if (status === "MENUNGGU_PEMBAYARAN") return "text-yellow-600";
  if (status === "DITOLAK") return "text-red-600";
  if (status === "SELESAI") return "text-green-600";

  return "text-blue-600";
});

const showPaymentButton = computed(() => {
  return detailBerkas.value?.status === "MENUNGGU_PEMBAYARAN";
});

onMounted(() => {
  getDetailApplication();
});
</script>

<template>
  <section v-if="applicationStore.isLoading('FETCH_DETAIL')">
    <AppLoading />
  </section>
  <section class="relative w-full h-full">
    <section v-if="detailBerkas" class="p-2">
      <section class="w-full flex justify-between items-start flex-col">
        <p class="font-bold text-lg">Peralihan Hak Jual Beli</p>
        <p
          :class="[
            'font-semibold',
            'text-sm',
            statusTextColor[detailBerkas.status],
          ]"
          class="text-nowrap"
        >
          {{ statusLabel }}
        </p>
      </section>

      <section class="w-full mt-5 border-b border-slate-200 pb-3">
        <div class="flex items-center justify-between mb-3">
          <p>Biaya</p>
          <p class="text-primary font-medium">
            {{ formatRupiah(detailBerkas.total_fee) }}
          </p>
        </div>

        <div class="flex items-center justify-between mb-3">
          <p>Petugas</p>
          <p>{{ detailBerkas.officer?.name || "-" }}</p>
        </div>

        <div class="flex items-center justify-between mb-3">
          <p>Dibuat</p>
          <p>{{ formatDateIndonesia(detailBerkas.createdAt) }}</p>
        </div>

        <div class="flex items-center justify-between mb-3">
          <p>Selesai</p>
          <p>{{ formatDateIndonesia(detailBerkas.payment?.paidAt) || "-" }}</p>
        </div>
      </section>

      <!-- Tombol Pembayaran -->
      <section v-if="showPaymentButton" class="mt-5">
        <UButton
          block
          :loading="loading"
          label="Bayar Sekarang"
          @click="handlePayment"
        />
      </section>

      <!-- Pemohon -->
      <section class="w-full mt-5 border-b border-slate-200 pb-3">
        <p class="font-bold mb-2">Pemohon</p>
        <p>{{ detailBerkas.person.name }}</p>
      </section>

      <!-- Kontak Kantor -->
      <section class="w-full mt-5 border-b border-slate-200 pb-3">
        <p class="font-bold mb-3">Kontak Kantor</p>

        <div class="mb-3">
          <p class="font-medium">{{ detailBerkas.landOffice.name }}</p>
          <p class="text-sm text-gray-600">
            {{ detailBerkas.landOffice.address }}
          </p>
        </div>

        <div class="mb-3">
          <p>Email</p>
          <p class="text-sm text-gray-600">
            {{ detailBerkas.landOffice.email }}
          </p>
        </div>

        <div>
          <p>Telp</p>
          <p class="text-sm text-gray-600">
            {{ detailBerkas.landOffice.phone }}
          </p>
        </div>
      </section>
    </section>
    <section
      v-else
      class="w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <UEmpty
        icon="tabler:file-sad"
        title="Berkas tidak ditemukan"
        :description="errorMessage"
      />
    </section>
  </section>
</template>
