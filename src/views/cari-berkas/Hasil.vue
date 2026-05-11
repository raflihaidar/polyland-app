<script setup lang="ts">
import { provide, computed, ref } from "vue";
import { useApplicationStore } from "@/stores/application.store";
import {
  createPublicClient,
  createWalletClient,
  custom,
  parseUnits,
  http,
  parseGwei,
} from "viem";
import { polygonAmoy } from "viem/chains";
import PaymentABI from "../../abi/applicationPayment.json";
import ERC20ABI from "../../abi/erc20.json";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

const paymentContractAddress = import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS_V4;
const usdcAddress = import.meta.env.VITE_USDC_ADDRESS;

const route = useRoute();

provide("head-title", `${route.query?.fileNumber}`);

const store = useApplicationStore();
const { detailBerkas } = storeToRefs(store);

const txHash = ref("");
const error = ref("");
const loading = ref(false);

const statusBerkasMapping = [
  { value: "DIPROSES", label: "Diterima Loket" },
  { value: "VERIFIKASI_BERKAS", label: "Tahap Verifikasi" },
  { value: "MENUNGGU_PEMBAYARAN", label: "Menunggu Pembayaran" },
  { value: "PENANDATANGANAN", label: "Menunggu Penandatanganan Dokumen" },
  { value: "DITOLAK", label: "Pengajuan Ditolak" },
  { value: "SELESAI", label: "Proses Selesai" },
];

function toBytes32(str: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  if (bytes.length > 32)
    throw new Error("String terlalu panjang untuk bytes32");
  const padded = new Uint8Array(32);
  padded.set(bytes);
  return (
    "0x" +
    Array.from(padded)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

const handlePayment = async () => {
  try {
    loading.value = true;
    error.value = "";

    // 1. Inisialisasi Public Client untuk cek status transaksi
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(),
    });

    const walletClient = createWalletClient({
      chain: polygonAmoy,
      transport: custom(window.ethereum),
    });

    const [account] = await walletClient.requestAddresses();

    // Persiapan data
    const applicationIdBytes32 = toBytes32(detailBerkas.value?.file_number!);
    const kantahCodeBytes32 = toBytes32(detailBerkas.value?.landOffice.code!);
    const amount = parseUnits(String(detailBerkas.value?.total_fee), 6);

    // ======================
    // 1. APPROVE
    // ======================
    // Gunakan writeContract dan tunggu sampai transaksi sukses

    const fees = await publicClient.estimateFeesPerGas();

    const approveHash = await walletClient.writeContract({
      account,
      address: usdcAddress,
      abi: ERC20ABI,
      functionName: "approve",
      args: [paymentContractAddress, amount],
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      maxFeePerGas: fees.maxFeePerGas,
    });

    // TUNGGU konfirmasi transaksi approve sebelum lanjut ke pay
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    // estimate gas
    const gas = await publicClient.estimateContractGas({
      account,
      address: paymentContractAddress,
      abi: PaymentABI,
      functionName: "pay",
      args: [
        applicationIdBytes32,
        kantahCodeBytes32,
        BigInt(detailBerkas.value?.land.area_size!),
      ],
    });

    // ======================
    // 2. PAY
    // ======================
    const payHash = await walletClient.writeContract({
      account,
      address: paymentContractAddress,
      abi: PaymentABI,
      functionName: "pay",
      args: [
        applicationIdBytes32,
        kantahCodeBytes32,
        BigInt(detailBerkas.value?.land.area_size!),
      ],
      gas,
      maxFeePerGas: parseGwei("40"),
      maxPriorityFeePerGas: parseGwei("30"),
    });

    txHash.value = payHash;
    alert("Pembayaran Berhasil!");
  } catch (err: any) {
    console.error(err);
    error.value = err.shortMessage || err.message || "User rejected request";
  } finally {
    loading.value = false;
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

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};
</script>

<template>
  <section v-if="detailBerkas" class="p-2">
    <!-- Header -->
    <section class="w-full flex justify-between items-start flex-col">
      <p class="font-bold text-lg">Peralihan Hak Jual Beli</p>
      <p :class="['font-semibold', 'text-sm', statusColor]" class="text-nowrap">
        {{ statusLabel }}
      </p>
    </section>

    <!-- Informasi Biaya -->
    <section class="w-full mt-5 border-b border-slate-200 pb-3">
      <div class="flex items-center justify-between mb-3">
        <p>Biaya</p>
        <p>{{ formatRupiah(detailBerkas.total_fee) }}</p>
      </div>

      <div class="flex items-center justify-between mb-3">
        <p>Petugas</p>
        <p>-</p>
      </div>

      <div class="flex items-center justify-between mb-3">
        <p>Dibuat</p>
        <p>{{ detailBerkas.createdAt }}</p>
      </div>

      <div class="flex items-center justify-between mb-3">
        <p>Selesai</p>
        <p>{{ detailBerkas.paidAt || "-" }}</p>
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
</template>
