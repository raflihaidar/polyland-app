<script setup lang="ts">
import { provide, ref, onMounted, onBeforeUnmount } from "vue";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

provide("head-title", "Scan QR");

const scanResult = ref<string | null>(null);
const scanError = ref<string | null>(null);
const isScanning = ref(true);
let scanner: Html5QrcodeScanner | null = null;

const onScanSuccess = (decodedText: string) => {
  scanResult.value = decodedText;
  scanError.value = null;
  isScanning.value = false;
  scanner?.clear();

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

const resetScan = () => {
  scanResult.value = null;
  scanError.value = null;
  isScanning.value = true;
  setTimeout(() => {
    initScanner();
  }, 100);
};

const initScanner = () => {
  scanner = new Html5QrcodeScanner(
    "qr-reader",
    {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      rememberLastUsedCamera: true,
    },
    false,
  );
  scanner.render(onScanSuccess, onScanError);
};

onMounted(() => {
  initScanner();
});

onBeforeUnmount(() => {
  scanner?.clear().catch(() => {});
});
</script>

<template>
  <div class="page-bg">
    <!-- Scanner Area -->
    <div v-if="isScanning" class="scanner-wrapper">
      <!-- Header label -->
      <p class="scan-label">Scan Kode QR</p>

      <div class="scanner-frame">
        <!-- Corner brackets -->
        <div class="corner top-left" />
        <div class="corner top-right" />
        <div class="corner bottom-left" />
        <div class="corner bottom-right" />

        <!-- Scanning line animation -->
        <div class="scan-line" />

        <!-- QR Reader element -->
        <div id="qr-reader" class="qr-reader" />
      </div>

      <p class="scan-hint">Pastikan QR Code berada di dalam bingkai</p>
    </div>

    <!-- Result Area -->
    <div v-else class="result-wrapper">
      <div class="result-icon">✓</div>
      <p class="result-title">QR Terdeteksi!</p>
      <p class="result-text">{{ scanResult }}</p>
      <button class="reset-btn" @click="resetScan">Scan Lagi</button>
    </div>
  </div>
</template>

<style scoped>
/* ── CSS Variables ─────────────────────────────── */
:root {
  --color-primary: #c70000;
}

/* ── Page Background ─────────────────────────────── */
.page-bg {
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: "DM Sans", sans-serif;
}

/* ── Scanner Wrapper ─────────────────────────────── */
.scanner-wrapper {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

/* ── Scan Label ─────────────────────────────── */
.scan-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.04em;
  margin: 0;
}

/* ── Scanner Frame ─────────────────────────────── */
.scanner-frame {
  position: relative;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* ── Corner Brackets ─────────────────────────────── */
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  z-index: 10;
  pointer-events: none;
}

.corner::before,
.corner::after {
  content: "";
  position: absolute;
  background: #c70000;
  border-radius: 2px;
}

.corner::before {
  width: 100%;
  height: 3px;
}
.corner::after {
  width: 3px;
  height: 100%;
}

.top-left {
  top: 12px;
  left: 12px;
}
.top-right {
  top: 12px;
  right: 12px;
  transform: scaleX(-1);
}
.bottom-left {
  bottom: 12px;
  left: 12px;
  transform: scaleY(-1);
}
.bottom-right {
  bottom: 12px;
  right: 12px;
  transform: scale(-1);
}

/* ── Scanning Line ─────────────────────────────── */
.scan-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #c70000 40%,
    #ff4444 50%,
    #c70000 60%,
    transparent 100%
  );
  box-shadow: 0 0 8px 2px rgba(199, 0, 0, 0.6);
  z-index: 10;
  pointer-events: none;
  animation: scanMove 2.4s ease-in-out infinite;
}

/* @keyframes scanMove {
  0% {
    top: 10%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 90%;
    opacity: 0;
  }
} */

/* ── QR Reader overrides ─────────────────────────────── */
.qr-reader {
  width: 100% !important;
}

.qr-reader :deep(#qr-reader__scan_region) {
  background: #ffffff !important;
  border: none !important;
}

.qr-reader :deep(#qr-reader__scan_region video) {
  border-radius: 12px;
  width: 100% !important;
  max-width: 100% !important;
}

.qr-reader :deep(#qr-reader__dashboard) {
  background: #ffffff !important;
  border: none !important;
  border-top: 1px solid #ececec !important;
  padding: 12px !important;
}

.qr-reader :deep(#qr-reader__dashboard span),
.qr-reader :deep(#qr-reader__dashboard p) {
  color: #888 !important;
  font-family: "DM Sans", sans-serif !important;
  font-size: 0.8rem !important;
}

.qr-reader :deep(button) {
  background: linear-gradient(135deg, #c70000, #8b0000) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
  font-family: "DM Sans", sans-serif !important;
  cursor: pointer !important;
  transition: opacity 0.2s !important;
}

.qr-reader :deep(button:hover) {
  opacity: 0.85 !important;
}

.qr-reader :deep(select) {
  background: #f5f5f5 !important;
  color: #1a1a1a !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  font-family: "DM Sans", sans-serif !important;
}

/* ── Hint Text ─────────────────────────────── */
.scan-hint {
  font-size: 0.8rem;
  color: #999;
  text-align: center;
  margin: 0;
}

/* ── Result Area ─────────────────────────────── */
.result-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

.result-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #c70000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #fff;
  box-shadow: 0 0 20px rgba(199, 0, 0, 0.25);
}

.result-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.result-text {
  font-size: 0.9rem;
  color: #666;
  word-break: break-all;
  max-width: 320px;
  margin: 0;
}

.reset-btn {
  background: linear-gradient(135deg, #c70000, #8b0000);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 28px;
  font-size: 0.95rem;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.15s;
  margin-top: 0.5rem;
}

.reset-btn:hover {
  opacity: 0.85;
  transform: scale(1.03);
}
</style>
