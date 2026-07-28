<script setup lang="ts">
import { provide, ref, onMounted, onBeforeUnmount } from "vue";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import QrBarcodeScanner from "@/components/QrBarcodeScanner.vue";

provide("head-title", "Scan QR");

const scanResult = ref<string | null>(null);
const scanError = ref<string | null>(null);
const isScanning = ref(true);
let scanner: Html5QrcodeScanner | null = null;

const onScanSuccess = (decodedText: string) => {
  try {
    const url = new URL(decodedText);
    window.location.href = url.href;
  } catch {
    console.log("bukan URL valid");
  }
};

const onScanError = (error: string) => {
  if (!error.includes("No MultiFormat Readers")) {
    scanError.value = error;
  }
};
</script>

<template>
  <div
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%]"
  >
    <h3 class="text-center font-medium text-xl mb-5">
      Verifikasi Sertifikat Tanah Elektronik
    </h3>
    <QrBarcodeScanner @scan="onScanSuccess" />

    <UButton block label="Kembali ke beranda" to="/" />
  </div>
</template>
