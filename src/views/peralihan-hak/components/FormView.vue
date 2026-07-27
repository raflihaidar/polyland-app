<script setup lang="ts">
import { computed } from "vue";
import {
  docTypeToLabel,
  statusColor,
  statusLabel,
  type ApplicationDetailResponse,
} from "@/types";
import { formatDate, formatRupiah } from "@/utils/formatter";
import { getFileUrl } from "@/utils/file";

const props = defineProps<{
  detailData: ApplicationDetailResponse | any;
}>();

const emit = defineEmits<{
  (e: "reject"): void;
  (e: "next-payment"): void;
  (e: "edit"): void;
  (e: "generate-certificate"): void;
}>();

const sharedDocs = computed(
  () => props.detailData?.document?.filter((d: any) => !d.person_id) ?? [],
);
</script>

<template>
  <div class="space-y-6">
    <!-- Action bar (tergantung status permohonan) -->
    <section class="flex items-center justify-end gap-x-3">
      <UButton
        v-if="detailData?.status === 'VERIFIKASI_BERKAS'"
        label="Tolak Permohonan"
        @click="emit('reject')"
        color="primary"
      />

      <UButton
        v-if="detailData?.status === 'VERIFIKASI_BERKAS'"
        label="Lanjut ke Pembayaran"
        @click="emit('next-payment')"
        color="warning"
        variant="outline"
      />

      <UButton
        v-if="detailData?.status === 'VERIFIKASI_BERKAS'"
        label="Edit"
        @click="emit('edit')"
        color="warning"
        icon="lucide:edit"
      />

      <UButton
        v-if="detailData?.status === 'VERIFIKASI_PEMBAYARAN'"
        label="Terbitkan Sertifikat"
        @click="emit('generate-certificate')"
        color="primary"
      />
    </section>

    <!-- Status Banner -->
    <div class="border border-default rounded-xl overflow-hidden">
      <div class="bg-elevated/50 px-6 py-4 border-b border-default">
        <p class="font-semibold text-sm flex items-center gap-2">
          <UIcon name="i-lucide-info" class="size-4 text-primary" />
          Informasi Permohonan
        </p>
      </div>
      <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-5">
        <div class="col-span-2 md:col-span-1 flex flex-col gap-1">
          <span class="text-xs text-muted">Status</span>
          <UBadge
            :color="statusColor[detailData.status] ?? 'neutral'"
            variant="subtle"
            :label="statusLabel[detailData.status] ?? detailData.status"
            class="w-fit"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted">Nomor Berkas</span>
          <span class="text-sm font-semibold font-mono">{{
            detailData.file_number
          }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted">Jenis Sertifikat</span>
          <span class="text-sm font-medium">{{ detailData.type }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted">Tanggal Dibuat</span>
          <span class="text-sm">{{ formatDate(detailData.createdAt) }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted">Total Biaya</span>
          <span class="text-sm font-semibold text-primary">{{
            formatRupiah(detailData.total_fee)
          }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted">Biaya per m²</span>
          <span class="text-sm">{{
            formatRupiah(detailData.land_price_per_m2)
          }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted">Biaya Pendaftaran</span>
          <span class="text-sm">{{
            formatRupiah(detailData.registration_fee)
          }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted">Kantor Pertanahan</span>
          <span class="text-sm">{{ detailData.landOffice?.name }}</span>
        </div>
      </div>
    </div>

    <!-- Data Pemilik Baru -->
    <div class="border border-default rounded-xl overflow-hidden">
      <div class="bg-elevated/50 px-6 py-4 border-b border-default">
        <p class="font-semibold text-sm flex items-center gap-2">
          <UIcon name="i-lucide-users" class="size-4 text-primary" />
          Data Pemilik Baru
        </p>
      </div>
      <div class="p-6 space-y-4">
        <div
          v-for="(ownerEntry, idx) in detailData.owners"
          :key="ownerEntry.person.id"
          class="border border-default rounded-lg overflow-hidden"
        >
          <div
            class="bg-elevated/30 px-4 py-2.5 border-b border-default flex items-center justify-between"
          >
            <span class="text-sm font-medium text-muted"
              >Pemilik ke-{{ Number(idx) + 1 }}</span
            >
            <UBadge
              color="neutral"
              variant="outline"
              :label="`Bagian: ${(Number(ownerEntry.share) * 100).toFixed(0)}%`"
            />
          </div>
          <div class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nama Lengkap">
                <UInput
                  :value="ownerEntry.person.name"
                  readonly
                  class="w-full"
                />
              </UFormField>
              <UFormField label="NIK">
                <UInput
                  :value="ownerEntry.person.nik"
                  readonly
                  class="w-full"
                />
              </UFormField>
              <UFormField label="No. Telepon">
                <UInput
                  :value="ownerEntry.person.phone"
                  readonly
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Email">
                <UInput
                  :value="ownerEntry.person.email"
                  readonly
                  class="w-full"
                />
              </UFormField>
            </div>
            <div
              v-if="ownerEntry.person.document?.length"
              class="border-t border-default pt-4"
            >
              <p
                class="text-xs font-medium text-muted mb-3 flex items-center gap-1.5"
              >
                <UIcon name="i-lucide-paperclip" class="size-3.5" />
                Dokumen Pemilik {{ Number(idx) + 1 }}
              </p>
              <div class="grid grid-cols-2 gap-3">
                <a
                  v-for="doc in ownerEntry.person.document"
                  :key="doc.id"
                  :href="getFileUrl(doc.fileUrl)"
                  target="_blank"
                  class="flex items-center gap-3 p-3 border border-default rounded-lg hover:bg-elevated/50 transition-colors group"
                >
                  <div
                    class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                  >
                    <UIcon
                      name="i-lucide-file-text"
                      class="size-4 text-primary"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-medium truncate">
                      {{ docTypeToLabel[doc.type] ?? doc.type }}
                    </p>
                    <p class="text-xs text-muted truncate">
                      {{ doc.fileName }}
                    </p>
                  </div>
                  <UIcon
                    name="i-lucide-external-link"
                    class="size-3.5 text-muted group-hover:text-primary transition-colors shrink-0"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border border-default rounded-xl overflow-hidden">
      <div class="bg-elevated/50 px-6 py-4 border-b border-default">
        <p class="font-semibold text-sm flex items-center gap-2">
          <UIcon name="i-lucide-users" class="size-4 text-primary" />
          Data Penjual
        </p>
      </div>
      <div class="p-6 space-y-4">
        <div
          v-for="(sellerEntry, idx) in detailData.sellers"
          :key="sellerEntry.person.id"
          class="border border-default rounded-lg overflow-hidden"
        >
          <div
            class="bg-elevated/30 px-4 py-2.5 border-b border-default flex items-center justify-between"
          >
            <span class="text-sm font-medium text-muted"
              >Pemilik ke-{{ Number(idx) + 1 }}</span
            >
          </div>
          <div class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nama Lengkap">
                <UInput
                  :value="sellerEntry.person.name"
                  readonly
                  class="w-full"
                />
              </UFormField>
              <UFormField label="NIK">
                <UInput
                  :value="sellerEntry.person.nik"
                  readonly
                  class="w-full"
                />
              </UFormField>
              <UFormField label="No. Telepon">
                <UInput
                  :value="sellerEntry.person.phone"
                  readonly
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Email">
                <UInput
                  :value="sellerEntry.person.email"
                  readonly
                  class="w-full"
                />
              </UFormField>
            </div>
            <div
              v-if="sellerEntry.person.document?.length"
              class="border-t border-default pt-4"
            >
              <p
                class="text-xs font-medium text-muted mb-3 flex items-center gap-1.5"
              >
                <UIcon name="i-lucide-paperclip" class="size-3.5" />
                Dokumen Pemilik {{ Number(idx) + 1 }}
              </p>
              <div class="grid grid-cols-2 gap-3">
                <a
                  v-for="doc in sellerEntry.person.document"
                  :key="doc.id"
                  :href="getFileUrl(doc.fileUrl)"
                  target="_blank"
                  class="flex items-center gap-3 p-3 border border-default rounded-lg hover:bg-elevated/50 transition-colors group"
                >
                  <div
                    class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                  >
                    <UIcon
                      name="i-lucide-file-text"
                      class="size-4 text-primary"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-medium truncate">
                      {{ docTypeToLabel[doc.type] ?? doc.type }}
                    </p>
                    <p class="text-xs text-muted truncate">
                      {{ doc.fileName }}
                    </p>
                  </div>
                  <UIcon
                    name="i-lucide-external-link"
                    class="size-3.5 text-muted group-hover:text-primary transition-colors shrink-0"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Tanah & Sertifikat -->
    <div class="border border-default rounded-xl overflow-hidden">
      <div class="bg-elevated/50 px-6 py-4 border-b border-default">
        <p class="font-semibold text-sm flex items-center gap-2">
          <UIcon name="i-lucide-file-badge" class="size-4 text-primary" />
          Data Tanah &amp; Sertifikat
        </p>
      </div>
      <div class="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <UFormField label="NIB">
          <UInput :value="detailData.nib" readonly class="w-full" />
        </UFormField>
        <UFormField label="Kode Sertifikat">
          <UInput :value="detailData.cert_code" readonly class="w-full" />
        </UFormField>
        <UFormField label="Jenis">
          <UInput :value="detailData.type" readonly class="w-full" />
        </UFormField>
        <UFormField label="Luas Tanah">
          <UInput :value="detailData.land?.area_size" readonly class="w-full" />
        </UFormField>
        <UFormField label="Alamat" class="col-span-2">
          <UInput
            :value="detailData.land?.street_address"
            readonly
            class="w-full"
          />
        </UFormField>
        <UFormField label="RT">
          <UInput :value="detailData.land?.rt" readonly class="w-full" />
        </UFormField>
        <UFormField label="RW">
          <UInput :value="detailData.land?.rw" readonly class="w-full" />
        </UFormField>
        <UFormField label="Kelurahan">
          <UInput
            :value="detailData.land?.village?.name"
            readonly
            class="w-full"
          />
        </UFormField>
        <UFormField label="Kecamatan">
          <UInput
            :value="detailData.land?.district?.name"
            readonly
            class="w-full"
          />
        </UFormField>
        <UFormField label="Kabupaten / Kota">
          <UInput
            :value="detailData.land?.regency?.name"
            readonly
            class="w-full"
          />
        </UFormField>
        <UFormField label="Provinsi">
          <UInput
            :value="detailData.land?.province?.name"
            readonly
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Dokumen Pendukung -->
    <div
      v-if="sharedDocs.length"
      class="border border-default rounded-xl overflow-hidden"
    >
      <div class="bg-elevated/50 px-6 py-4 border-b border-default">
        <p class="font-semibold text-sm flex items-center gap-2">
          <UIcon name="i-lucide-paperclip" class="size-4 text-primary" />
          Dokumen Pendukung
        </p>
      </div>
      <div class="p-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        <a
          v-for="doc in sharedDocs"
          :key="doc.id"
          :href="getFileUrl(doc.fileUrl)"
          target="_blank"
          class="flex items-center gap-3 p-3 border border-default rounded-lg hover:bg-elevated/50 transition-colors group"
        >
          <div
            class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
          >
            <UIcon name="i-lucide-file-text" class="size-4 text-primary" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium truncate">
              {{ docTypeToLabel[doc.type] ?? doc.type }}
            </p>
            <p class="text-xs text-muted truncate">{{ doc.fileName }}</p>
          </div>
          <UIcon
            name="i-lucide-external-link"
            class="size-3.5 text-muted group-hover:text-primary transition-colors shrink-0"
          />
        </a>
      </div>
    </div>
  </div>
</template>
