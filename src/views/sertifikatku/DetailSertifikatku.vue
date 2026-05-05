<script setup lang="ts">
import MobileLayout from "@/layouts/Mobile.vue";
import { useCertificateStore } from "@/stores/certificate.store";
import { useIPFSStore } from "@/stores/ipfs.store";
import { onMounted, ref, provide, computed, nextTick } from "vue";
import { useRoute } from "vue-router";
import { account, walletClient } from "@/lib/walletClient";
import { keccak256 } from "viem";
import { decrypt } from "eciesjs";
import { Buffer } from "buffer";
import VuePdfEmbed from "vue-pdf-embed";
import QrcodeVue from "qrcode.vue";

provide("head-title", "Detail Sertifikat");

const store = useIPFSStore();
const certificateStore = useCertificateStore();
const route = useRoute();
const certificate = ref<null | any>(null);
const pdfUrl = ref<string | null>(null);
const totalPages = ref<number>(0);
const currentPage = ref<number>(1);
const isDecrypting = ref(false);
const isLoading = ref(false);
const pdfContainer = ref<HTMLElement | null>(null);
const baseWidth = ref(0);
const scale = ref(1.0);

if (typeof window !== "undefined" && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

const updateWidth = () => {
  if (pdfContainer.value) {
    baseWidth.value = pdfContainer.value.clientWidth;
  } else {
    baseWidth.value = window.innerWidth - 32;
  }
};

const handleViewCertificate = async () => {
  if (!certificate.value) return;

  try {
    isDecrypting.value = true;

    const metadataResponse = await store.getMetadata(certificate.value.cid);
    const encryptedFileRaw = await store.getEncryptedFile(
      certificate.value.cid,
      certificate.value.code,
    );

    if (!metadataResponse || !encryptedFileRaw) {
      throw new Error("Data IPFS tidak ditemukan");
    }

    const message = "Otorisasi Kunci Sertifikat Digital Jejak Tanahku";
    const signature = await walletClient.signMessage({
      account: account as `0x${string}`,
      message,
    });

    const entropyHex = keccak256(signature);
    const privateKeyBuffer = Buffer.from(entropyHex.slice(2), "hex");
    const encryptedAESKeyBase64 =
      metadataResponse?.recipients?.[0]?.encryptedKey;

    if (!encryptedAESKeyBase64) {
      throw new Error("Encrypted key tidak ditemukan");
    }

    const encryptedKeyBuffer = Buffer.from(encryptedAESKeyBase64, "base64");
    const decryptedAESKeyBuffer = decrypt(privateKeyBuffer, encryptedKeyBuffer);

    if (decryptedAESKeyBuffer.length !== 32) {
      throw new Error("AES Key tidak valid (bukan 32 bytes)");
    }

    const iv = Uint8Array.from(Buffer.from(metadataResponse.aes.iv, "base64"));
    const authTag = Uint8Array.from(
      Buffer.from(metadataResponse.aes.authTag, "base64"),
    );
    const ciphertext = Uint8Array.from(Buffer.from(encryptedFileRaw));

    const encryptedCombined = new Uint8Array(
      ciphertext.length + authTag.length,
    );
    encryptedCombined.set(ciphertext);
    encryptedCombined.set(authTag, ciphertext.length);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      decryptedAESKeyBuffer.buffer as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encryptedCombined,
    );

    const blob = new Blob([decryptedBuffer], { type: "application/pdf" });
    pdfUrl.value = URL.createObjectURL(blob);
    currentPage.value = 1;

    // Hitung width setelah pdf-wrapper muncul di DOM
    await nextTick();
    updateWidth();
  } catch (error: any) {
    console.error("Proses Dekripsi Gagal:", error);
    alert(
      `Gagal membuka file:\n${error?.message || "Kesalahan tidak diketahui"}`,
    );
  } finally {
    isDecrypting.value = false;
  }
};

const handleDocumentLoad = (pdf: any) => {
  totalPages.value = pdf.numPages;
};

const handleDocumentRendered = () => {
  isLoading.value = false;
};

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    isLoading.value = true;
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    isLoading.value = true;
    currentPage.value++;
  }
};

const zoomIn = () => {
  if (scale.value < 2.5) {
    isLoading.value = true;
    scale.value = parseFloat((scale.value + 0.2).toFixed(1));
  }
};

const zoomOut = () => {
  if (scale.value > 1.0) {
    isLoading.value = true;
    scale.value = parseFloat((scale.value - 0.2).toFixed(1));
  }
};

const computedWidth = computed(() => baseWidth.value * scale.value);

const isLastPage = computed(() => currentPage.value === totalPages.value);

onMounted(async () => {
  if (route?.params?.id) {
    const res = await certificateStore.getDetailCertificate(
      route.params.id as string,
    );
    certificate.value = res.data;
  }

  nextTick(() => {
    updateWidth();
  });

  window.addEventListener("resize", updateWidth);
  window.addEventListener("orientationchange", () => {
    setTimeout(updateWidth, 200);
  });
});
</script>

<template>
  <MobileLayout>
    <div class="detail-container">
      <!-- Header -->
      <div class="cert-header">
        <p class="cert-label">NIB Sertifikat</p>
        <h3 class="cert-nib">
          {{ certificate?.nib || "Belum ada sertifikat" }}
        </h3>
      </div>

      <!-- Tombol Lihat -->
      <UButton
        v-if="!pdfUrl"
        @click="handleViewCertificate"
        :loading="isDecrypting"
        block
      >
        {{ isDecrypting ? "Mendekripsi..." : "Lihat Sertifikat" }}
      </UButton>

      <!-- PDF Viewer -->
      <div v-if="pdfUrl" class="pdf-section">
        <!-- Navigasi Halaman dan Fitur Zoom -->
        <div class="controls-wrapper">
          <div class="page-nav">
            <button
              class="nav-btn"
              :disabled="currentPage === 1"
              @click="goToPrevPage"
            >
              ‹ Prev
            </button>
            <span class="page-info"
              >Hal {{ currentPage }} / {{ totalPages }}</span
            >
            <button
              class="nav-btn"
              :disabled="currentPage === totalPages"
              @click="goToNextPage"
            >
              Next ›
            </button>
          </div>

          <!-- Tombol Zoom In & Out -->
          <div class="zoom-controls">
            <button class="zoom-btn" :disabled="scale <= 1.0" @click="zoomOut">
              ➖
            </button>
            <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
            <button class="zoom-btn" :disabled="scale >= 2.5" @click="zoomIn">
              ➕
            </button>
          </div>
        </div>

        <!-- Wrapper anchor untuk QR overlay -->
        <div class="pdf-section-wrapper">
          <!-- PDF Card -->
          <div class="pdf-card">
            <div class="pdf-wrapper" ref="pdfContainer">
              <div v-if="isLoading" class="pdf-loading">Memuat halaman...</div>
              <vue-pdf-embed
                :source="pdfUrl"
                :page="currentPage"
                :width="computedWidth"
                @loaded="handleDocumentLoad"
                @rendered="handleDocumentRendered"
              />
            </div>
          </div>

          <div v-if="isLastPage && totalPages > 1" class="qr-overlay">
            <div class="qr-box">
              <qrcode-vue
                :value="`https://jejak-tanahku.id/1`"
                :size="30"
                level="H"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<style scoped>
.controls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f3f4f6;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

.cert-header {
  padding: 4px 0;
}

.cert-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin: 0 0 4px;
}

.cert-nib {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  word-break: break-all;
}

.nav-btn {
  padding: 8px 16px;
  background-color: #065f46;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.2s;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):active {
  opacity: 0.8;
}

.page-info {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.page-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* Anchor utama untuk QR overlay */
.pdf-section-wrapper {
  position: relative;
  width: 100%;
}

/* pdf-card: shadow & rounded, tanpa overflow hidden */
.pdf-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  background: white;
  overflow-x: auto;
  overflow-y: visible;
}

/* pdf-wrapper: hanya container PDF */
.pdf-wrapper {
  width: 100%;
  background: white;
  line-height: 0;
}

.pdf-wrapper :deep(canvas) {
  display: block;
  max-width: none;
}

.pdf-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-size: 14px;
  color: #6b7280;
}

.qr-overlay {
  position: absolute;
  bottom: 15%;
  right: 10%;
  z-index: 20;
  pointer-events: none;
}

.qr-box {
  pointer-events: auto;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  line-height: normal;
}

.qr-box :deep(canvas) {
  display: block;
  width: auto !important;
  height: auto !important;
  max-width: none !important;
}

.qr-label {
  font-size: 7px;
  font-weight: 800;
  color: #065f46;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.zoom-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
  margin-top: 2px;
}

.zoom-btn {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-btn:not(:disabled):active {
  background-color: #f3f4f6;
}

.zoom-info {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  min-width: 45px;
  text-align: center;
}
</style>
