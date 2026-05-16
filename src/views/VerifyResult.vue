<script setup lang="ts">
import { useApiPrivate } from "@/composables/useApi";
import { provide, ref, onMounted } from "vue";
import { useRoute } from "vue-router";

provide("head-title", "Verifikasi Sertifikat");

const route = useRoute();
const tokenId = route.params.tokenId as string;
const api = useApiPrivate();
const ipfsGatewayUrl = import.meta.env.VITE_PINATA_GATEWAY;

interface CertificateData {
  isVerified: boolean;
  certificate: {
    id: string;
    code: string;
    nib: string;
    type: string;
    status: string;
    token_id: number;
    tx_hash: string | null;
    hash: string | null;
    cid: string | null;
    createdAt: string;
    land: {
      area_size: number;
      street_address: string;
      village: string;
      district: string;
      regency: string;
      province: string;
    };
    owners: {
      name: string;
      nik: string;
      share: string;
    }[];
    notes: string[];
  };
}

const data = ref<CertificateData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const certificateTypeLabel: Record<string, string> = {
  SHM: "Hak Milik",
  SHGU: "Hak Guna Usaha",
  SHGB: "Hak Guna Bangunan",
};

const statusColor: Record<string, string> = {
  AKTIF: "success",
  NONAKTIF: "error",
  DALAM_PROSES: "warning",
};

onMounted(async () => {
  if (!tokenId) {
    error.value = "Token ID tidak ditemukan pada URL.";
    loading.value = false;
    return;
  }

  try {
    const res = await api.get(`/certificate/verify/${tokenId}`);
    data.value = res.data.data;
  } catch (err: any) {
    error.value =
      err?.data?.message || "Sertifikat tidak valid atau telah dicabut.";
  } finally {
    loading.value = false;
  }
});

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const formatArea = (val: string | number) => {
  const num = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("id-ID").format(num) + " m²";
};
</script>

<template>
  <div class="page-root">
    <!-- Subtle background decoration -->
    <div class="bg-decoration" aria-hidden="true">
      <div class="bg-blob blob-1" />
      <div class="bg-blob blob-2" />
    </div>

    <div class="content-wrap">
      <!-- ── Loading ───────────────────────────────── -->
      <div v-if="loading" class="state-center">
        <div class="spinner" />
        <p class="state-hint">Memverifikasi sertifikat di blockchain…</p>
      </div>

      <!-- ── Error ─────────────────────────────────── -->
      <div v-else-if="error" class="state-center">
        <div class="state-icon icon-error">
          <UIcon name="i-heroicons-x-mark-20-solid" class="icon-svg" />
        </div>
        <h2 class="state-title error-title">Verifikasi Gagal</h2>
        <p class="state-desc">{{ error }}</p>
        <UButton
          to="/scan"
          variant="outline"
          color="red"
          size="sm"
          icon="i-heroicons-arrow-left"
          label="Scan Ulang"
        />
      </div>

      <!-- ── Result ────────────────────────────────── -->
      <template v-else-if="data">
        <!-- Verified badge -->
        <div class="verified-header animate-fade-up">
          <div class="verified-icon-wrap">
            <UIcon
              name="i-heroicons-shield-check-20-solid"
              class="verified-icon"
            />
          </div>
          <div class="verified-text">
            <h1 class="verified-title">Sertifikat Terverifikasi</h1>
            <p class="verified-sub">
              Data valid di blockchain · Token #{{ data.certificate.token_id }}
            </p>
          </div>
          <UBadge
            :color="(statusColor[data.certificate.status] as any) ?? 'neutral'"
            variant="subtle"
            size="lg"
            class="status-badge"
          >
            {{ data.certificate.status }}
          </UBadge>
        </div>

        <!-- Card: Info Sertifikat -->
        <div class="card animate-fade-up" style="animation-delay: 0.1s">
          <div class="card-header">
            <div class="card-header-dot dot-blue" />
            <UIcon
              name="i-heroicons-document-text"
              class="card-icon text-blue-500"
            />
            <span class="card-title">Info Sertifikat</span>
          </div>
          <dl class="info-grid">
            <div class="info-item">
              <dt class="info-label">Nomor Sertifikat</dt>
              <dd class="info-value mono">{{ data.certificate.code }}</dd>
            </div>
            <div class="info-item">
              <dt class="info-label">NIB</dt>
              <dd class="info-value mono">{{ data.certificate.nib }}</dd>
            </div>
            <div class="info-item">
              <dt class="info-label">Jenis Hak</dt>
              <dd class="info-value">
                {{
                  certificateTypeLabel[data.certificate.type] ??
                  data.certificate.type
                }}
              </dd>
            </div>
            <div class="info-item">
              <dt class="info-label">Tanggal Terbit</dt>
              <dd class="info-value">
                {{ formatDate(data.certificate.createdAt) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Card: Data Tanah -->
        <div class="card animate-fade-up" style="animation-delay: 0.2s">
          <div class="card-header">
            <div class="card-header-dot dot-teal" />
            <UIcon name="i-heroicons-map-pin" class="card-icon text-teal-600" />
            <span class="card-title">Data Tanah</span>
          </div>
          <dl class="info-grid">
            <div class="info-item col-span-2">
              <dt class="info-label">Alamat</dt>
              <dd class="info-value">
                {{ data.certificate.land.street_address }}
              </dd>
            </div>
            <div class="info-item">
              <dt class="info-label">Kelurahan</dt>
              <dd class="info-value capitalize">
                {{ data.certificate.land.village }}
              </dd>
            </div>
            <div class="info-item">
              <dt class="info-label">Kecamatan</dt>
              <dd class="info-value capitalize">
                {{ data.certificate.land.district }}
              </dd>
            </div>
            <div class="info-item">
              <dt class="info-label">Kabupaten/Kota</dt>
              <dd class="info-value capitalize">
                {{ data.certificate.land.regency }}
              </dd>
            </div>
            <div class="info-item">
              <dt class="info-label">Provinsi</dt>
              <dd class="info-value capitalize">
                {{ data.certificate.land.province }}
              </dd>
            </div>
            <div class="info-item col-span-2">
              <dt class="info-label">Luas Tanah</dt>
              <dd class="info-value area">
                {{ formatArea(data.certificate.land.area_size) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Card: Pemilik -->
        <div class="card animate-fade-up" style="animation-delay: 0.3s">
          <div class="card-header">
            <div class="card-header-dot dot-violet" />
            <UIcon
              name="i-heroicons-user-group"
              class="card-icon text-violet-600"
            />
            <span class="card-title">Pemilik</span>
          </div>
          <div class="owner-list">
            <div
              v-for="(owner, i) in data.certificate.owners"
              :key="i"
              class="owner-row"
            >
              <div class="owner-left">
                <div class="owner-num">{{ i + 1 }}</div>
                <div>
                  <p class="owner-name">{{ owner.name }}</p>
                  <p class="owner-nik">NIK: {{ owner.nik }}</p>
                </div>
              </div>
              <UBadge color="violet" variant="subtle" class="owner-pct">
                {{ (Number(owner.share) * 100).toFixed(0) }}%
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Card: Catatan -->
        <div
          v-if="data.certificate.notes.length > 0"
          class="card animate-fade-up"
          style="animation-delay: 0.4s"
        >
          <div class="card-header">
            <div class="card-header-dot dot-amber" />
            <UIcon
              name="i-heroicons-clipboard-document-list"
              class="card-icon text-amber-600"
            />
            <span class="card-title">Catatan</span>
          </div>
          <ol class="notes-list">
            <li
              v-for="(note, i) in data.certificate.notes"
              :key="i"
              class="note-item"
            >
              <span class="note-num">{{ i + 1 }}.</span>
              <span class="note-text">{{ note }}</span>
            </li>
          </ol>
        </div>

        <!-- Card: Blockchain Info -->
        <div class="card animate-fade-up" style="animation-delay: 0.5s">
          <div class="card-header">
            <div class="card-header-dot dot-cyan" />
            <UIcon
              name="i-heroicons-cube-transparent"
              class="card-icon text-cyan-600"
            />
            <span class="card-title">Info Blockchain</span>
          </div>
          <dl class="space-y-3 text-sm">
            <div class="info-item">
              <dt class="info-label">Token ID</dt>
              <dd class="info-value mono text-red-700">
                #{{ data.certificate.token_id }}
              </dd>
            </div>
            <div v-if="data.certificate.tx_hash" class="info-item">
              <dt class="info-label">Transaction Hash</dt>
              <a
                class="info-value mono small break-all underline"
                :href="`https://amoy.polygonscan.com/tx/${data.certificate.tx_hash}`"
              >
                {{ data.certificate.tx_hash }}
              </a>
            </div>
            <!-- <div v-if="data.certificate.hash" class="info-item">
              <dt class="info-label">Document Hash (SHA-256)</dt>
              <dd class="info-value mono small break-all">
                {{ data.certificate.hash }}
              </dd>
            </div> -->
            <div v-if="data.certificate.cid" class="info-item">
              <dt class="info-label">IPFS CID</dt>
              <a
                class="info-value mono small break-all underline"
                :href="`${ipfsGatewayUrl}/ipfs/${data.certificate.cid}`"
              >
                {{ data.certificate.cid }}
              </a>
            </div>
          </dl>
        </div>

        <!-- Back button -->
        <div
          class="back-btn-wrap animate-fade-up"
          style="animation-delay: 0.6s"
        >
          <UButton
            to="/scan-qr"
            variant="outline"
            color="neutral"
            icon="i-heroicons-qr-code"
            label="Scan QR Lainnya"
            size="md"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ── Root ─────────────────────────────── */
.page-root {
  background: #f7f7f8;
  color: #1a1a2e;
  position: relative;
}

/* ── Background decoration ────────────── */
.bg-decoration {
  pointer-events: none;
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
}

.blob-1 {
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 350px;
  background: radial-gradient(ellipse, #c70000, transparent 70%);
}

.blob-2 {
  bottom: 0;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(ellipse, #c70000, transparent 70%);
  opacity: 0.06;
}

/* ── Content ──────────────────────────── */
.content-wrap {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
  padding: 2.5rem 1rem 3rem;
}

/* ── Loading / Error state ────────────── */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.25rem;
  text-align: center;
}

.spinner {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid rgba(199, 0, 0, 0.15);
  border-top-color: #c70000;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.state-hint {
  font-size: 0.85rem;
  color: #888;
}

.state-icon {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-error {
  background: #fef2f2;
  border: 1.5px solid #fca5a5;
}

.icon-svg {
  font-size: 2rem;
  color: #dc2626;
}

.state-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.error-title {
  color: #dc2626;
}

.state-desc {
  font-size: 0.875rem;
  color: #6b7280;
  max-width: 320px;
}

/* ── Verified header ──────────────────── */
.verified-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  text-align: center;
}

.verified-icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #fef2f2;
  border: 1.5px solid rgba(199, 0, 0, 0.25);
  box-shadow: 0 0 28px rgba(199, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.verified-icon {
  font-size: 2.25rem;
  color: #c70000;
}

.verified-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.verified-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

.status-badge {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 1rem;
}

/* ── Card ─────────────────────────────── */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.card-header-dot {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
}

.dot-blue {
  background: #3b82f6;
}
.dot-teal {
  background: #14b8a6;
}
.dot-violet {
  background: #8b5cf6;
}
.dot-amber {
  background: #f59e0b;
}
.dot-cyan {
  background: #06b6d4;
}

.card-icon {
  font-size: 1.1rem;
}

.card-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #374151;
}

/* ── Info grid ────────────────────────── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
  padding: 1rem 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.col-span-2 {
  grid-column: span 2;
}

.info-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  font-weight: 500;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

.info-value.mono {
  font-family: "Courier New", monospace;
}
.info-value.small {
  font-size: 0.75rem;
  color: #6b7280;
}
.info-value.area {
  font-size: 1rem;
  font-weight: 700;
  color: #c70000;
}

/* ── Owner list ───────────────────────── */
.owner-list {
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.owner-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 0.75rem 1rem;
}

.owner-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.owner-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ede9fe;
  border: 1px solid #ddd6fe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #7c3aed;
  flex-shrink: 0;
}

.owner-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.owner-nik {
  font-size: 0.72rem;
  color: #9ca3af;
  font-family: "Courier New", monospace;
  margin: 0;
}

.owner-pct {
  font-family: "Courier New", monospace;
  font-size: 0.75rem;
}

/* ── Notes ────────────────────────────── */
.notes-list {
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
}

.note-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.note-num {
  color: #f59e0b;
  font-weight: 700;
  font-family: monospace;
  flex-shrink: 0;
}

.note-text {
  line-height: 1.5;
}

/* ── Back button ──────────────────────── */
.back-btn-wrap {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

/* ── Animation ────────────────────────── */
.animate-fade-up {
  animation: fadeUp 0.5s ease both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Blockchain section spacing ───────── */
.space-y-3 > * + * {
  margin-top: 0.75rem;
}
.space-y-3 {
  padding: 1rem 1.25rem;
}
</style>
