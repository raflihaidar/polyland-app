<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount, onMounted } from "vue";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useInfoDialog } from "@/composables/useInfoModal";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "Scan Kode",
    description: "Arahkan kamera ke QR code atau barcode pada dokumen.",
  },
);

const emit = defineEmits<{
  scan: [decodedText: string];
}>();

const infoDialog = useInfoDialog();

const SCANNER_ELEMENT_ID = `qr-reader-${Math.random().toString(36).slice(2)}`;

const scanMode = ref<"camera" | "upload">("camera");
const isScannerStarting = ref(false);
const isFileScanning = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
let html5QrCode: Html5Qrcode | null = null;

const scannerFormats = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.EAN_13,
];

const getOrCreateScanner = () => {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      formatsToSupport: scannerFormats,
      verbose: false,
    });

    console.log("scanner id : ", SCANNER_ELEMENT_ID);
  }
  return html5QrCode;
};

const stopCamera = async () => {
  if (html5QrCode) {
    try {
      const state = html5QrCode.getState();
      // 2 = SCANNING (hanya stop kalau sedang aktif scanning)
      if (state === 2) {
        await html5QrCode.stop();
      }
    } catch (error) {
      console.log("stopCamera error:", error);
    }
  }
};

const stopScanner = async () => {
  if (html5QrCode) {
    try {
      await stopCamera();
      html5QrCode.clear();
    } catch (error) {
      console.log("stopScanner error:", error);
    } finally {
      html5QrCode = null;
    }
  }
};

const onScanSuccess = async (decodedText: string) => {
  await stopScanner();
  // toast.add({
  //   title: "Kode Terdeteksi",
  //   description: `Hasil scan: ${decodedText}`,
  //   color: "success",
  // });
  emit("scan", decodedText);
};

const onScanFailure = () => {
  // Dipanggil terus-menerus tiap frame gagal dibaca, sengaja dibiarkan kosong
};

const startCameraScanner = async () => {
  isScannerStarting.value = true;
  await nextTick();

  try {
    const scanner = getOrCreateScanner();
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
      onScanFailure,
    );
  } catch (error: any) {
    await infoDialog({
      title: "Gagal",
      type: "error",
      description:
        error?.message ??
        "Pastikan browser memiliki izin akses kamera dan tidak sedang dipakai aplikasi lain.",
    });
  } finally {
    isScannerStarting.value = false;
  }
};

const switchToUploadMode = async () => {
  await stopScanner();
  scanMode.value = "upload";
};

const switchToCameraMode = async () => {
  await stopScanner();
  scanMode.value = "camera";
  await nextTick();
  await startCameraScanner();
};

const triggerFilePicker = () => {
  fileInputRef.value?.click();
};

const handleFileScan = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = "";
  if (!file) return;

  isFileScanning.value = true;
  try {
    if (!html5QrCode) {
      html5QrCode = getOrCreateScanner();
    }
    const decodedText = await html5QrCode.scanFile(file, false);
    await onScanSuccess(decodedText);
  } catch (error) {
    await infoDialog({
      type: "error",
      title: "Kode Tidak Terdeteksi",
      description:
        "Tidak dapat membaca QR/barcode dari gambar ini. Coba gunakan gambar lain yang lebih jelas.",
    });
  } finally {
    isFileScanning.value = false;
  }
};

const close = async () => {
  await stopScanner();
  scanMode.value = "camera";
};

defineExpose({ open, close });

onMounted(async () => {
  scanMode.value = "camera";
  await startCameraScanner();
});

onBeforeUnmount(async () => {
  await stopScanner();
});
</script>

<template>
  <div class="p-4 space-y-3">
    <!-- Toggle Kamera / Upload -->
    <div class="flex items-center gap-2">
      <UButton
        label="Kamera"
        icon="i-lucide-camera"
        size="sm"
        class="flex-1 justify-center"
        :color="scanMode === 'camera' ? 'primary' : 'neutral'"
        :variant="scanMode === 'camera' ? 'solid' : 'outline'"
        @click="switchToCameraMode"
      />
      <UButton
        label="Upload Gambar"
        icon="i-lucide-image-up"
        size="sm"
        class="flex-1 justify-center"
        :color="scanMode === 'upload' ? 'primary' : 'neutral'"
        :variant="scanMode === 'upload' ? 'solid' : 'outline'"
        @click="switchToUploadMode"
      />
    </div>

    <!-- Mode: Kamera -->
    <template v-if="scanMode === 'camera'">
      <p class="text-xs text-muted">{{ description }}</p>

      <div
        class="relative rounded-lg overflow-hidden bg-black/90 min-h-70 flex items-center justify-center"
      >
        <div :id="SCANNER_ELEMENT_ID" class="w-full" />
        <div
          v-if="isScannerStarting"
          class="absolute inset-0 flex items-center justify-center"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-6 text-white animate-spin"
          />
        </div>
      </div>
    </template>

    <!-- Mode: Upload Gambar -->
    <template v-else>
      <p class="text-xs text-muted">
        Pilih foto atau screenshot yang memuat QR code / barcode.
      </p>

      <div
        class="rounded-lg border border-primary min-h-70 flex flex-col items-center justify-center gap-3 p-6 cursor-pointer hover:bg-elevated/40 transition-colors"
        @click="triggerFilePicker"
      >
        <template v-if="isFileScanning">
          <UIcon
            name="i-lucide-loader-2"
            class="size-8 text-primary animate-spin"
          />
          <p class="text-sm text-muted">Membaca kode dari gambar...</p>
        </template>
        <template v-else>
          <UIcon name="i-lucide-image-up" class="size-8 text-muted" />
          <p class="text-sm font-medium">Klik untuk pilih gambar</p>
          <p class="text-xs text-muted">Format JPG, JPEG, atau PNG</p>
        </template>
      </div>

      <div :id="SCANNER_ELEMENT_ID" class="hidden" />

      <input
        ref="fileInputRef"
        type="file"
        accept=".jpg,.jpeg,.png"
        class="hidden"
        @change="handleFileScan"
      />
    </template>
  </div>
</template>
