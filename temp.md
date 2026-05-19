<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import QrcodeVue from 'qrcode.vue'
import pdfFile from './assets/sertifikat.pdf'

const pdfUrl = ref(null)
const totalPages = ref(2)
const currentPage = ref(1)
const baseWidth = ref(0)
const isLoading = ref(false)
const pdfContainer = ref(null)

const scale = ref(1.0)

const updateWidth = () => {
  if (pdfContainer.value) {
    baseWidth.value = pdfContainer.value.clientWidth
  } else {
    baseWidth.value = window.innerWidth - 32
  }
}

const computedWidth = computed(() => baseWidth.value * scale.value)

const zoomIn = () => {
  if (scale.value < 2.5) {
    isLoading.value = true
    scale.value = parseFloat((scale.value + 0.2).toFixed(1))
  }
}

const zoomOut = () => {
  if (scale.value > 1.0) {
    isLoading.value = true
    scale.value = parseFloat((scale.value - 0.2).toFixed(1))
  }
}

const handleDocumentLoad = (pdf) => {
  totalPages.value = pdf.numPages
}

const handleDocumentRendered = () => {
  isLoading.value = false
}

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    isLoading.value = true
    currentPage.value--
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    isLoading.value = true
    currentPage.value++
  }
}

const isLastPage = computed(() => currentPage.value === totalPages.value)

onMounted(() => {
  pdfUrl.value = pdfFile

  nextTick(() => {
    updateWidth()
  })

  window.addEventListener('resize', updateWidth)
  window.addEventListener('orientationchange', () => {
    setTimeout(updateWidth, 200)
  })
})
</script>

<template>
  <div class="flex justify-center items-center min-h-screen h-auto">
    <div class="shadow-2xl min-h-screen h-auto w-full max-w-md flex flex-col">
      <div class="w-full bg-secondary pt-20 px-5 pb-24 flex-1 h-full">
        <div class="detail-container">
          <!-- Header -->
          <div class="cert-header">
            <p class="cert-label">NIB Sertifikat</p>
          </div>

          <!-- PDF Viewer -->
          <div v-if="pdfUrl" class="pdf-section">
            <!-- Navigasi Halaman dan Fitur Zoom -->
            <div class="controls-wrapper">
              <div class="page-nav">
                <button class="nav-btn" :disabled="currentPage === 1" @click="goToPrevPage">
                  ‹ Prev
                </button>
                <span class="page-info">Hal {{ currentPage }} / {{ totalPages }}</span>
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
                <button class="zoom-btn" :disabled="scale <= 1.0" @click="zoomOut">➖</button>
                <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
                <button class="zoom-btn" :disabled="scale >= 2.5" @click="zoomIn">➕</button>
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
                  <qrcode-vue :value="`https://jejak-tanahku.id/1`" :size="30" level="H" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
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

.page-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

.pdf-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
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
</style>
