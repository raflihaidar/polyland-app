<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useApiPrivate } from "@/composables/useApi";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import type { CertificateData } from "@/types";
import { useRoute } from "vue-router";

const certificate = defineModel<CertificateData | null>("certificate", {
  required: true,
});

const route = useRoute();
const api = useApiPrivate();
const toast = useToast();

const certificateList = ref<CertificateData[]>([]);
const isCertSearching = ref(false);
let certSearchTimeout: ReturnType<typeof setTimeout> | null = null;

const searchCertificate = async (query: string) => {
  if (!query || query.length < 3) {
    certificateList.value = [];
    return;
  }

  isCertSearching.value = true;
  if (certSearchTimeout) clearTimeout(certSearchTimeout);
  await new Promise<void>((resolve) => {
    certSearchTimeout = setTimeout(async () => {
      try {
        const { data } = await api.get(`/certificate/search?q=${query}`);
        certificateList.value = data.data ?? [];
      } catch (error) {
        console.log(error);
      } finally {
        isCertSearching.value = false;
        resolve();
      }
    }, 400);
  });
};

const selectCertificate = (value: (typeof certificateList.value)[0] | null) => {
  certificate.value = value ?? null;
  certificateList.value = [];
};

onMounted(async () => {
  if (route.params.id && certificate.value) {
    await searchCertificate(certificate.value.code);

    if (certificateList.value.length > 0) {
      selectCertificate(certificateList.value[0]!);
    }
  }
});

// ─── Scan Barcode / QR (html5-qrcode) ──────────────────────────────
const SCANNER_ELEMENT_ID = "certificate-qr-reader";

const scanMode = ref<"camera" | "upload">("camera");
const isScannerOpen = ref(false);
const isScannerStarting = ref(false);
const isFileScanning = ref(false);
const scanQuery = ref("");
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
  }
  return html5QrCode;
};

const stopCamera = async () => {
  if (html5QrCode) {
    try {
      const state = html5QrCode.getState();
      // 2 = SCANNING (only stop if actively scanning)
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

const handleScanResult = async (decodedText: string) => {
  scanQuery.value = decodedText;
  toast.add({
    title: "Kode Terdeteksi",
    description: `Hasil scan: ${decodedText}`,
    color: "success",
  });

  await searchCertificate(decodedText);
};

const onScanSuccess = async (decodedText: string) => {
  // Hindari trigger berkali-kali saat kamera masih membaca frame yang sama
  await stopScanner();
  isScannerOpen.value = false;
  await handleScanResult(decodedText);
};

const onScanFailure = () => {
  // Dipanggil terus-menerus tiap frame gagal dibaca, jadi sengaja dibiarkan kosong
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
    toast.add({
      title: "Gagal Membuka Kamera",
      description:
        error?.message ??
        "Pastikan browser memiliki izin akses kamera dan tidak sedang dipakai aplikasi lain.",
      color: "error",
    });
  } finally {
    isScannerStarting.value = false;
  }
};

const openScanner = async () => {
  isScannerOpen.value = true;
  scanMode.value = "camera";
  await startCameraScanner();
};

const switchToUploadMode = async () => {
  // Instance lama terikat ke DOM node kamera; hentikan & buang supaya
  // instance baru dibuat terikat ke DOM node upload (id sama, node beda).
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
  target.value = ""; // reset supaya file yang sama bisa dipilih ulang
  if (!file) return;

  isFileScanning.value = true;
  try {
    // Pastikan instance terikat ke node DOM mode "upload" saat ini
    if (!html5QrCode) {
      html5QrCode = getOrCreateScanner();
    }
    const decodedText = await html5QrCode.scanFile(file, false);
    isScannerOpen.value = false;
    await stopScanner();
    await handleScanResult(decodedText);
  } catch (error: any) {
    toast.add({
      title: "Kode Tidak Terdeteksi",
      description:
        "Tidak dapat membaca QR/barcode dari gambar ini. Coba gunakan gambar lain yang lebih jelas.",
      color: "error",
    });
  } finally {
    isFileScanning.value = false;
  }
};

const closeScanner = async () => {
  await stopScanner();
  isScannerOpen.value = false;
  scanMode.value = "camera";
};

onBeforeUnmount(async () => {
  await stopScanner();
});
</script>

<template>
  <div class="border border-default rounded-xl overflow-hidden">
    <div class="bg-elevated/50 px-6 py-4 border-b border-default">
      <p class="font-semibold text-sm flex items-center gap-2">
        <UIcon name="i-lucide-file-badge" class="size-4 text-primary" />
        Data Tanah &amp; Sertifikat
      </p>
    </div>
    <div class="p-6 space-y-5">
      <UFormField
        label="Cari Sertifikat Tanah (NIB / Kode)"
        class="col-span-2"
        required
      >
        <div class="flex items-center gap-2">
          <USelectMenu
            v-model="certificate"
            by="id"
            label-key="code"
            :items="certificateList"
            class="w-full"
            placeholder="Ketik NIB atau kode sertifikat..."
            :loading="isCertSearching"
            @update:searchTerm="searchCertificate"
            @update:modelValue="selectCertificate"
            @clear="() => selectCertificate(null)"
            clear
          />
          <UButton
            icon="i-lucide-scan-line"
            label="Scan"
            color="neutral"
            variant="outline"
            @click="openScanner"
          />
        </div>
      </UFormField>

      <div v-if="certificate?.id" class="grid grid-cols-3 gap-4">
        <UFormField label="Jenis Sertifikat">
          <UInput :value="certificate.type" class="w-full" readonly />
        </UFormField>
        <UFormField label="NIB">
          <UInput :value="certificate.nib" class="w-full" readonly />
        </UFormField>
        <UFormField label="Status">
          <UInput :value="certificate.status" class="w-full" readonly />
        </UFormField>
        <UFormField label="Luas Tanah">
          <UInput :value="certificate.land.area_size" class="w-full" readonly />
        </UFormField>
        <UFormField label="Alamat" class="col-span-2">
          <UInput
            :value="certificate.land.street_address"
            class="w-full"
            readonly
          />
        </UFormField>
        <UFormField label="RT">
          <UInput :value="certificate.land.rt" class="w-full" readonly />
        </UFormField>
        <UFormField label="RW">
          <UInput :value="certificate.land.rw" class="w-full" readonly />
        </UFormField>
        <UFormField label="Kelurahan">
          <UInput
            :value="certificate.land.village.name"
            class="w-full"
            readonly
          />
        </UFormField>
        <UFormField label="Kecamatan">
          <UInput
            :value="certificate.land.district.name"
            class="w-full"
            readonly
          />
        </UFormField>
        <UFormField label="Kabupaten / Kota">
          <UInput
            :value="certificate.land.regency.name"
            class="w-full"
            readonly
          />
        </UFormField>
        <UFormField label="Provinsi">
          <UInput
            :value="certificate.land.province.name"
            class="w-full"
            readonly
          />
        </UFormField>
      </div>

      <div
        v-else
        class="flex items-center gap-2 p-3 bg-elevated/40 rounded-lg border border-default border-dashed"
      >
        <UIcon name="i-lucide-info" class="size-4 text-muted shrink-0" />
        <p class="text-sm text-muted">
          Cari dan pilih sertifikat untuk mengisi data tanah secara otomatis,
          atau gunakan tombol Scan untuk membaca kode QR/barcode sertifikat.
        </p>
      </div>
    </div>

    <!-- Modal Scanner -->
    <UModal v-model:open="isScannerOpen" @close="closeScanner">
      <template #content>
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between">
            <p class="font-semibold text-sm flex items-center gap-2">
              <UIcon name="i-lucide-scan-line" class="size-4 text-primary" />
              Scan Kode Sertifikat
            </p>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="closeScanner"
            />
          </div>

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
            <p class="text-xs text-muted">
              Arahkan kamera ke QR code atau barcode pada dokumen sertifikat.
            </p>

            <div
              class="relative rounded-lg overflow-hidden bg-black/90 min-h-[280px] flex items-center justify-center"
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
              Pilih foto atau screenshot yang memuat QR code / barcode
              sertifikat.
            </p>

            <div
              class="rounded-lg border border-default border-dashed min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 cursor-pointer hover:bg-elevated/40 transition-colors"
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

            <!-- Elemen tersembunyi wajib untuk html5-qrcode.scanFile -->
            <div :id="SCANNER_ELEMENT_ID" class="hidden" />

            <input
              ref="fileInputRef"
              type="file"
              accept=".jpg,.jpeg,.png"
              class="hidden"
              @change="handleFileScan"
            />
          </template>

          <UButton
            label="Tutup"
            color="neutral"
            variant="outline"
            block
            @click="closeScanner"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
