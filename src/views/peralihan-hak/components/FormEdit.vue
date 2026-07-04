<script setup lang="ts">
import { computed, ref } from "vue";
import { useApiPrivate } from "@/composables/useApi";
import {
  fileLabels,
  docTypeToLabel,
  type ApplicationDetailResponse,
  type CertificateData,
  type OwnerForm,
} from "@/types";
import { getFileUrl } from "@/utils/file";

export interface OwnershipTransferFormModel {
  certificate: CertificateData | null;
  land_office_id: string;
  owners: OwnerForm[];
  files: Record<string, File | null>;
}

const props = defineProps<{
  editMode: boolean;
  detailData?: ApplicationDetailResponse | any;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", formData: FormData): void;
  (e: "save", formData: FormData): void;
  (e: "cancel"): void;
}>();

const form = defineModel<OwnershipTransferFormModel>("form", {
  required: true,
});

const api = useApiPrivate();

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
  certSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get(`/certificate/search?q=${query}`);
      certificateList.value = data.data ?? [];
    } catch (error) {
      console.log(error);
    } finally {
      isCertSearching.value = false;
    }
  }, 400);
};

const selectCertificate = (
  certificate: (typeof certificateList.value)[0] | null,
) => {
  form.value.certificate = certificate ?? null;
  certificateList.value = [];
};

// ─── Pemilik ────────────────────────────────────────────────────────
const searchOwner = async (index: number, query: string) => {
  if (!query || query.length < 3 || !form.value.owners[index]) return;
  form.value.owners[index].isSearching = true;
  try {
    const { data } = await api.get(`/person/search?q=${query}`);
    form.value.owners[index].result = data.data ?? [];
  } catch {
    if (form.value.owners[index]) form.value.owners[index].result = [];
  } finally {
    form.value.owners[index].isSearching = false;
  }
};

const selectOwner = (index: number, person: any) => {
  if (!form.value.owners[index]) return;
  form.value.owners[index].person = {
    ...person,
    ktp_pembeli: null,
    kk_pembeli: null,
  };
  form.value.owners[index].result = [];
};

const addOwner = () => {
  form.value.owners.push({
    isSearching: false,
    mode: "search",
    result: [],
    query: "",
    person: {
      id: "",
      name: "",
      nik: "",
      phone: "",
      email: "",
      kk_pembeli: null,
      ktp_pembeli: null,
    },
    share: "100",
  });
};

// const removeOwner = (index: number) => {
//   if (form.value.owners.length > 1) form.value.owners.splice(index, 1);
// };

// Pastikan selalu ada minimal 1 baris pemilik (khususnya saat mode create)
if (form.value.owners.length === 0) {
  addOwner();
}

// ─── File ───────────────────────────────────────────────────────────
const handleFileChange = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  form.value.files[key] = target.files?.[0] ?? null;
};

const handleOwnerFileChange = (
  index: number,
  key: "ktp_pembeli" | "kk_pembeli",
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  form.value.owners[index]!.person[key] = target.files?.[0] ?? null;
};

// ─── Submit ─────────────────────────────────────────────────────────
const buildFormData = () => {
  const formData = new FormData();

  if (form.value.certificate) {
    formData.append("certificate_id", form.value.certificate.id);
    formData.append("cert_type", form.value.certificate.type);
    formData.append("nib", form.value.certificate.nib);
    formData.append("cert_code", form.value.certificate.code);
    formData.append("land_id", form.value.certificate.land.id);
    formData.append("land_office_id", form.value.land_office_id);
  }

  for (const [key, file] of Object.entries(form.value.files)) {
    if (file) formData.append(key, file);
  }

  form.value.owners.forEach((owner, index) => {
    if (owner.mode === "search") {
      formData.append(`owners[${index}][person_id]`, owner.person.id);
    } else {
      formData.append(`owners[${index}][name]`, owner.person.name);
      formData.append(`owners[${index}][nik]`, owner.person.nik!);
      formData.append(`owners[${index}][phone]`, owner.person.phone!);
      formData.append(`owners[${index}][email]`, owner.person.email!);
    }
    formData.append(
      `owners[${index}][share]`,
      (Number(owner.share) / 100).toFixed(4),
    );
    if (owner.person.ktp_pembeli) {
      formData.append("ktp_pembeli", owner.person.ktp_pembeli as File);
      formData.append("ktp_pembeli_person_ids", owner.person.id);
    }

    if (owner.person.kk_pembeli) {
      formData.append("kk_pembeli", owner.person.kk_pembeli as File);
      formData.append("kk_pembeli_person_ids", owner.person.id);
    }
  });

  return formData;
};

const handleSubmitClick = () => {
  const formData = buildFormData();
  emit(props.editMode ? "save" : "submit", formData);
};

const sharedDocs = computed(
  () => props.detailData?.document?.filter((d: any) => !d.person_id) ?? [],
);
</script>

<template>
  <div class="space-y-6">
    <div class="border border-default rounded-xl overflow-hidden">
      <div
        class="bg-elevated/50 px-6 py-4 border-b border-default flex items-center justify-between"
      >
        <div>
          <p class="font-semibold text-sm flex items-center gap-2">
            <UIcon name="i-lucide-users" class="size-4 text-primary" />
            Data Pemilik Baru
          </p>
          <!-- <p class="text-xs text-muted mt-0.5">
            Tambahkan pemilik jika kepemilikan bersama.
          </p> -->
        </div>
        <!-- <UButton
          label="Tambah Pemilik"
          icon="i-lucide-plus"
          size="sm"
          color="neutral"
          variant="outline"
          @click="addOwner"
        /> -->
      </div>

      <div class="p-6 space-y-4">
        <div
          v-for="(owner, index) in form.owners"
          :key="index"
          class="border border-default rounded-lg overflow-hidden"
        >
          <div
            class="bg-elevated/30 px-4 py-2.5 border-b border-default flex items-center justify-between"
          >
            <span class="text-sm font-medium text-muted"
              >Pemilik ke-{{ index + 1 }}</span
            >
            <div class="flex items-center gap-2">
              <UButton
                label="Cari Data"
                :color="owner.mode === 'search' ? 'primary' : 'neutral'"
                :variant="owner.mode === 'search' ? 'solid' : 'outline'"
                @click="owner.mode = 'search'"
              />
              <UButton
                label="Input Manual"
                :color="owner.mode === 'manual' ? 'primary' : 'neutral'"
                :variant="owner.mode === 'manual' ? 'solid' : 'outline'"
                @click="owner.mode = 'manual'"
              />
              <!-- <UButton
                icon="i-lucide-trash-2"
                size="xs"
                color="error"
                variant="ghost"
                :disabled="form.owners.length === 1"
                @click="removeOwner(index)"
              /> -->
            </div>
          </div>

          <div class="p-4 space-y-4">
            <!-- Search mode -->
            <div v-if="owner.mode === 'search'" class="grid grid-cols-2 gap-4">
              <UFormField
                label="Cari Pemilik (Nama / NIK)"
                required
                class="col-span-2"
              >
                <USelectMenu
                  v-model="owner.query"
                  by="id"
                  label-key="name"
                  :items="owner.result"
                  class="w-full"
                  placeholder="Cari Nama/NIK..."
                  :loading="owner.isSearching"
                  @update:searchTerm="searchOwner(index, $event)"
                  @update:modelValue="selectOwner(index, $event)"
                  @clear="
                    () => {
                      owner.query = '';
                    }
                  "
                  clear
                />
              </UFormField>
              <UFormField label="NIK" class="w-full">
                <UInput :value="owner.person.nik" class="w-full" readonly />
              </UFormField>
              <UFormField label="Email" class="w-full">
                <UInput :value="owner.person.email" class="w-full" readonly />
              </UFormField>
              <UFormField label="No. Telepon" class="w-full">
                <UInput :value="owner.person.phone" class="w-full" readonly />
              </UFormField>
              <UFormField label="Persentase Kepemilikan(%)">
                <UInput
                  v-model="owner.share"
                  type="number"
                  disabled
                  min="0"
                  max="100"
                  placeholder="Contoh: 50"
                  class="w-full"
                />
              </UFormField>
            </div>

            <!-- Manual mode -->
            <div v-else class="grid grid-cols-2 gap-4">
              <UFormField label="Nama Lengkap" required>
                <UInput
                  v-model="owner.person.name"
                  placeholder="Nama sesuai KTP"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="NIK" required>
                <UInput
                  v-model="owner.person.nik"
                  placeholder="16 digit NIK"
                  maxlength="16"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Email">
                <UInput
                  v-model="owner.person.email"
                  placeholder="email@contoh.com"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="No. Telepon">
                <UInput
                  v-model="owner.person.phone"
                  placeholder="08xxxxxxxxxx"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Persentase (%)">
                <UInput
                  v-model="owner.share"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Contoh: 50"
                  class="w-full"
                />
              </UFormField>
            </div>

            <!-- Owner documents -->
            <div class="border-t border-default pt-4">
              <p
                class="text-xs font-medium text-muted mb-3 flex items-center gap-1.5"
              >
                <UIcon name="i-lucide-paperclip" class="size-3.5" />
                Dokumen Pemilik {{ index + 1 }}
              </p>

              <!-- Edit mode: show existing docs + re-upload option -->
              <template v-if="editMode">
                <div
                  v-if="detailData?.owners?.[index]?.person?.document?.length"
                  class="grid grid-cols-2 gap-3 mb-3"
                >
                  <a
                    v-for="doc in detailData.owners[index].person.document"
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
                <p class="text-xs text-muted mb-2">
                  Upload file baru hanya jika ingin mengganti dokumen yang sudah
                  ada.
                </p>
              </template>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium">
                    KTP Pembeli
                    <span v-if="!editMode" class="text-red-500">*</span>
                    <span v-else class="text-muted text-xs"
                      >(opsional, untuk mengganti)</span
                    >
                  </label>
                  <UInput
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    @change="
                      handleOwnerFileChange(index, 'ktp_pembeli', $event)
                    "
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium">
                    KK Pembeli
                    <span v-if="!editMode" class="text-red-500">*</span>
                    <span v-else class="text-muted text-xs"
                      >(opsional, untuk mengganti)</span
                    >
                  </label>
                  <UInput
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    @change="handleOwnerFileChange(index, 'kk_pembeli', $event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Data Tanah & Sertifikat -->
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
          <USelectMenu
            v-model="form.certificate"
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
        </UFormField>

        <div v-if="form.certificate?.id" class="grid grid-cols-3 gap-4">
          <UFormField label="Jenis Sertifikat">
            <UInput :value="form.certificate.type" class="w-full" readonly />
          </UFormField>
          <UFormField label="NIB">
            <UInput :value="form.certificate.nib" class="w-full" readonly />
          </UFormField>
          <UFormField label="Status">
            <UInput :value="form.certificate.status" class="w-full" readonly />
          </UFormField>
          <UFormField label="Luas Tanah">
            <UInput
              :value="form.certificate.land.area_size"
              class="w-full"
              readonly
            />
          </UFormField>
          <UFormField label="Alamat" class="col-span-2">
            <UInput
              :value="form.certificate.land.street_address"
              class="w-full"
              readonly
            />
          </UFormField>
          <UFormField label="RT">
            <UInput :value="form.certificate.land.rt" class="w-full" readonly />
          </UFormField>
          <UFormField label="RW">
            <UInput :value="form.certificate.land.rw" class="w-full" readonly />
          </UFormField>
          <UFormField label="Kelurahan">
            <UInput
              :value="form.certificate.land.village.name"
              class="w-full"
              readonly
            />
          </UFormField>
          <UFormField label="Kecamatan">
            <UInput
              :value="form.certificate.land.district.name"
              class="w-full"
              readonly
            />
          </UFormField>
          <UFormField label="Kabupaten / Kota">
            <UInput
              :value="form.certificate.land.regency.name"
              class="w-full"
              readonly
            />
          </UFormField>
          <UFormField label="Provinsi">
            <UInput
              :value="form.certificate.land.province.name"
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
            Cari dan pilih sertifikat untuk mengisi data tanah secara otomatis.
          </p>
        </div>
      </div>
    </div>

    <!-- Section: Dokumen Pendukung -->
    <div class="border border-default rounded-xl overflow-hidden">
      <div class="bg-elevated/50 px-6 py-4 border-b border-default">
        <p class="font-semibold text-sm flex items-center gap-2">
          <UIcon name="i-lucide-paperclip" class="size-4 text-primary" />
          Dokumen Pendukung
        </p>
        <p class="text-xs text-muted mt-0.5">
          <template v-if="editMode">
            Upload file baru hanya jika ingin mengganti dokumen yang sudah ada.
            Format: JPG, PNG, PDF. Maks. 5MB per file.
          </template>
          <template v-else>
            Format: JPG, PNG, PDF. Maks. 5MB per file.
          </template>
        </p>
      </div>

      <!-- Edit mode: show existing shared docs -->
      <div
        v-if="editMode && sharedDocs.length"
        class="px-6 pt-5 grid grid-cols-2 md:grid-cols-3 gap-3"
      >
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

      <div class="p-6 grid grid-cols-3 gap-4">
        <div
          v-for="(label, key) in fileLabels"
          :key="key"
          class="flex flex-col gap-1.5"
        >
          <label class="text-sm font-medium">
            {{ label }}
            <span v-if="!editMode" class="text-red-500">*</span>
            <span v-else class="text-muted text-xs">(opsional)</span>
          </label>
          <UInput
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            @change="handleFileChange(key, $event)"
          />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-end gap-3 pt-2 pb-6">
      <UButton
        v-if="!editMode"
        label="Batal"
        color="neutral"
        variant="outline"
        to="/admin/peralihan-hak"
      />
      <UButton
        v-else
        label="Batal"
        color="neutral"
        variant="outline"
        @click="emit('cancel')"
      />

      <UButton
        v-if="!editMode"
        label="Buat Permohonan"
        icon="i-lucide-send"
        color="primary"
        :loading="isLoading"
        class="min-w-44"
        @click="handleSubmitClick"
      />
      <UButton
        v-else
        label="Simpan Perubahan"
        icon="i-lucide-save"
        color="warning"
        :loading="isLoading"
        class="min-w-44"
        @click="handleSubmitClick"
      />
    </div>
  </div>
</template>
