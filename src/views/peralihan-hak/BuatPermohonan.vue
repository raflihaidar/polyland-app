<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useAuthStore } from "@/stores/auth.store";
import { useApiPrivate } from "@/composables/useApi";
import { useRoute, useRouter } from "vue-router";
import type {
  ApplicationDetailResponse,
  CertificateData,
  Owner,
} from "@/types";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const isLoading = ref(false);
const editMode = ref(false);
const api = useApiPrivate();

const isViewMode = computed(
  () => !!route.params?.id && !route.path.includes("create"),
);
const detailData = ref<any>(null);
const certificateList = ref<CertificateData[]>([]);

type OwnerForm = Owner & {
  isSearching: boolean;
  result: Owner[];
  query: string;
  mode: "search" | "manual";
};

const form = reactive<{
  certificate: CertificateData | null;
  land_office_id: string;
  owners: OwnerForm[];
  files: Record<string, File | null>;
}>({
  certificate: null,
  land_office_id: authStore.user?.land_office_id!,
  owners: [],
  files: {
    cert_file: null,
    akta_jual_beli: null,
    fc_sppt: null,
    fc_pbb: null,
    ssb: null,
    ktp_penjual: null,
  },
});

const fileLabels: Record<string, string> = {
  cert_file: "Sertifikat Tanah",
  akta_jual_beli: "Akta Jual Beli",
  fc_sppt: "Fotokopi SPPT",
  fc_pbb: "Fotokopi PBB",
  ssb: "SSB",
  ktp_penjual: "KTP Penjual",
};

const docTypeToLabel: Record<string, string> = {
  SERTIFIKAT_TANAH: "Sertifikat Tanah",
  AKTA_JUAL_BELI: "Akta Jual Beli",
  SPPT: "Fotokopi SPPT",
  PBB: "Fotokopi PBB",
  SSB: "SSB",
  KTP_PENJUAL: "KTP Penjual",
  KTP_PEMBELI: "KTP Pembeli",
  KK_PEMBELI: "KK Pembeli",
};

const statusColor: Record<string, string> = {
  VERIFIKASI_BERKAS: "info",
  DISETUJUI: "success",
  DITOLAK: "error",
  SELESAI: "success",
  MENUNGGU_PEMBAYARAN: "warning",
};

const statusLabel: Record<string, string> = {
  DIPROSES: "Sedang Diproses",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
  SELESAI: "Selesai",
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
};

const sharedDocs = computed(
  () => detailData.value?.document?.filter((d: any) => !d.person_id) ?? [],
);

// ─── API Calls ─────────────────────────────────────────────────────
const getApplicationDetail = async () => {
  try {
    isLoading.value = true;
    const { data } = await api.get<ApplicationDetailResponse>(
      `/ownership-transfer/detail/${route.params?.id}`,
    );
    detailData.value = data.data;
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat data",
      description: error?.response?.data?.message ?? "Terjadi kesalahan",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

// ─── Populate form from detailData (Edit Mode) ─────────────────────
const populateFormFromDetail = () => {
  if (!detailData.value) return;

  const d = detailData.value;

  // Reconstruct certificate object from detail fields
  form.certificate = {
    id: d.certificate_id ?? "",
    type: d.type ?? "",
    nib: d.nib ?? "",
    code: d.cert_code ?? "",
    status: d.status ?? "",
    land: {
      id: d.land?.id ?? "",
      area_size: d.land?.area_size ?? "",
      street_address: d.land?.street_address ?? "",
      rt: d.land?.rt ?? "",
      rw: d.land?.rw ?? "",
      village: d.land?.village ?? { name: "" },
      district: d.land?.district ?? { name: "" },
      regency: d.land?.regency ?? { name: "" },
      province: d.land?.province ?? { name: "" },
    },
  };

  form.land_office_id = d.landOffice?.id ?? authStore.user?.land_office_id!;

  // Populate owners from detailData.owners
  form.owners = (d.owners ?? []).map((ownerEntry: any) => ({
    isSearching: false,
    mode: "search" as const,
    result: [],
    query: ownerEntry.person?.name ?? "",
    person: {
      id: ownerEntry.person?.id ?? "",
      name: ownerEntry.person?.name ?? "",
      nik: ownerEntry.person?.nik ?? "",
      phone: ownerEntry.person?.phone ?? "",
      email: ownerEntry.person?.email ?? "",
      ktp_pembeli: null,
      kk_pembeli: null,
    },
    share: String(Math.round(Number(ownerEntry.share) * 100)),
  }));

  // Reset files (user must re-upload if they want to change)
  form.files = {
    cert_file: null,
    akta_jual_beli: null,
    fc_sppt: null,
    fc_pbb: null,
    ssb: null,
    ktp_penjual: null,
  };
};

// ─── Create Mode Logic ─────────────────────────────────────────────
let certSearchTimeout: ReturnType<typeof setTimeout> | null = null;

const searchCertificate = async (query: string) => {
  if (!query || query.length < 3) {
    certificateList.value = [];
    return;
  }
  isLoading.value = true;
  if (certSearchTimeout) clearTimeout(certSearchTimeout);
  certSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get(`/certificate/search?q=${query}`);
      certificateList.value = data.data ?? [];
    } catch {
      certificateList.value = [];
    } finally {
      isLoading.value = false;
    }
  }, 400);
};

const selectCertificate = (
  certificate: (typeof certificateList.value)[0] | null,
) => {
  form.certificate = certificate ?? null;
  certificateList.value = [];
};

const searchOwner = async (index: number, query: string) => {
  if (!query || query.length < 3 || !form.owners[index]) return;
  form.owners[index].isSearching = true;
  try {
    const { data } = await api.get(`/person/search?q=${query}`);
    form.owners[index].result = data.data ?? [];
  } catch {
    if (form.owners[index]) form.owners[index].result = [];
  } finally {
    form.owners[index].isSearching = false;
  }
};

const selectOwner = (index: number, person: any) => {
  if (!form.owners[index]) return;
  form.owners[index].person = {
    ...person,
    ktp_pembeli: null,
    kk_pembeli: null,
  };
  form.owners[index].result = [];
};

const addOwner = () => {
  form.owners.push({
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
    share: "",
  });
};

const removeOwner = (index: number) => {
  if (form.owners.length > 1) form.owners.splice(index, 1);
};

const handleFileChange = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  form.files[key] = target.files?.[0] ?? null;
};

const handleOwnerFileChange = (
  index: number,
  key: "ktp_pembeli" | "kk_pembeli",
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  form.owners[index]!.person[key] = target.files?.[0] ?? null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const handleChangeEditMode = () => {
  populateFormFromDetail();
  editMode.value = true;
};

const handleCancelEdit = () => {
  editMode.value = false;
};

const getFileUrl = (url: string) =>
  `${import.meta.env.VITE_API_BASE_URL}/uploads/${url}`;

const buildFormData = () => {
  const formData = new FormData();

  if (form.certificate) {
    formData.append("certificate_id", form.certificate.id);
    formData.append("cert_type", form.certificate.type);
    formData.append("nib", form.certificate.nib);
    formData.append("cert_code", form.certificate.code);
    formData.append("land_id", form.certificate.land.id);
    formData.append("land_office_id", form.land_office_id);
  }

  for (const [key, file] of Object.entries(form.files)) {
    if (file) formData.append(key, file);
  }

  form.owners.forEach((owner, index) => {
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

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const formData = buildFormData();

    const { data } = await api.post("/ownership-transfer/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (data.status === "success") {
      toast.add({
        title: "Permohonan Berhasil Dibuat",
        description: data.message,
        color: "success",
      });
      router.push("/admin/peralihan-hak/list-permohonan");
    } else {
      toast.add({
        title: "Gagal Membuat Permohonan",
        description: data.message,
        color: "error",
      });
    }
  } catch {
    toast.add({
      title: "Terjadi Kesalahan",
      description: "Gagal mengirim permohonan. Coba lagi.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const handleUpdate = async () => {
  try {
    isLoading.value = true;
    const formData = buildFormData();

    const { data } = await api.put(
      `/ownership-transfer/${route.params?.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    if (data.status === "success") {
      toast.add({
        title: "Permohonan Berhasil Diperbarui",
        description: data.message,
        color: "success",
      });
      editMode.value = false;
      await getApplicationDetail();
    } else {
      toast.add({
        title: "Gagal Memperbarui Permohonan",
        description: data.message,
        color: "error",
      });
    }
  } catch {
    toast.add({
      title: "Terjadi Kesalahan",
      description: "Gagal memperbarui permohonan. Coba lagi.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateStatus = async (status: any) => {
  try {
    isLoading.value = true;

    const { data } = await api.put(
      `/ownership-transfer/status?fileNumber=${detailData.value.file_number}`,
      {
        status,
      },
    );

    if (data.status === "success") {
      toast.add({
        title: "Status permohonan Berhasil diupdate",
        description: data.message,
        color: "success",
      });

      await getApplicationDetail();
    }
  } catch (error) {
    toast.add({
      title: "Terjadi Kesalahan",
      description: "Gagal updat status permohonan. Coba lagi.",
      color: "error",
    });
  }
};

onMounted(async () => {
  if (isViewMode.value) {
    await getApplicationDetail();
  } else {
    addOwner();
  }
});
</script>

<template>
  <UDashboardPanel id="peralihan-hak-form">
    <template #header>
      <UDashboardNavbar
        :title="
          editMode
            ? 'Edit Permohonan Peralihan Hak'
            : isViewMode
              ? 'Detail Permohonan Peralihan Hak'
              : 'Buat Permohonan Peralihan Hak'
        "
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        v-if="isLoading && isViewMode && !editMode"
        class="flex items-center justify-center py-32"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 text-primary animate-spin"
        />
      </div>

      <div v-else class="w-full px-8 space-y-6">
        <!-- ── Top action bar ───────────────────────────────────── -->
        <section class="flex items-center justify-between">
          <UButton
            v-if="!editMode"
            label="Kembali"
            icon="i-lucide-arrow-left"
            color="neutral"
            to="/admin/peralihan-hak/list-permohonan"
            variant="ghost"
          />
          <UButton
            v-else
            label="Batal Edit"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            @click="handleCancelEdit"
          />

          <div class="flex gap-x-3 items-center" v-if="isViewMode && !editMode">
            <UButton
              v-if="detailData?.status === 'VERIFIKASI_BERKAS'"
              label="Tolak Permohonan"
              @click="handleUpdateStatus('DITOLAK')"
              color="primary"
            />
            <UButton
              v-if="detailData?.status === 'VERIFIKASI_BERKAS'"
              label="Lanjut ke Pembayaran"
              @click="handleUpdateStatus('MENUNGGU_PEMBAYARAN')"
              color="warning"
              variant="outline"
            />
            <UButton
              v-if="detailData?.status === 'PENANDATANGANAN'"
              label="Selesai"
              color="success"
            />
            <UButton
              v-if="detailData?.status === 'PENANDATANGANAN'"
              label="Tandai Selesai"
              color="success"
            />
            <UButton
              v-if="detailData?.status === 'MENUNGGU_PEMBAYARAN'"
              label="Konfirmasi Pembayaran"
              color="warning"
            />
            <UButton
              v-if="detailData?.status === 'VERIFIKASI_BERKAS'"
              label="Edit"
              @click="handleChangeEditMode"
              color="warning"
              icon="lucide:edit"
            />
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- VIEW MODE                                               -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <template v-if="isViewMode && detailData && !editMode">
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
                <span class="text-sm">{{
                  formatDate(detailData.createdAt)
                }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted">Total Biaya</span>
                <span class="text-sm font-semibold text-primary">{{
                  formatCurrency(detailData.total_fee)
                }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted">Biaya per m²</span>
                <span class="text-sm">{{
                  formatCurrency(detailData.land_price_per_m2)
                }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted">Biaya Pendaftaran</span>
                <span class="text-sm">{{
                  formatCurrency(detailData.registration_fee)
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
                <UInput
                  :value="detailData.land?.area_size"
                  readonly
                  class="w-full"
                />
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
                  <UIcon
                    name="i-lucide-file-text"
                    class="size-4 text-primary"
                  />
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
        </template>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- CREATE MODE  &  EDIT MODE (shared form template)       -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <template v-else-if="!isViewMode || editMode">
          <!-- Section: Data Pemilik Baru -->
          <div class="border border-default rounded-xl overflow-hidden">
            <div
              class="bg-elevated/50 px-6 py-4 border-b border-default flex items-center justify-between"
            >
              <div>
                <p class="font-semibold text-sm flex items-center gap-2">
                  <UIcon name="i-lucide-users" class="size-4 text-primary" />
                  Data Pemilik Baru
                </p>
                <p class="text-xs text-muted mt-0.5">
                  Tambahkan pemilik jika kepemilikan bersama.
                </p>
              </div>
              <UButton
                label="Tambah Pemilik"
                icon="i-lucide-plus"
                size="sm"
                color="neutral"
                variant="outline"
                @click="addOwner"
              />
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
                    <UButton
                      icon="i-lucide-trash-2"
                      size="xs"
                      color="error"
                      variant="ghost"
                      :disabled="form.owners.length === 1"
                      @click="removeOwner(index)"
                    />
                  </div>
                </div>

                <div class="p-4 space-y-4">
                  <!-- Search mode -->
                  <div
                    v-if="owner.mode === 'search'"
                    class="grid grid-cols-2 gap-4"
                  >
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
                      <UInput
                        :value="owner.person.nik"
                        class="w-full"
                        readonly
                      />
                    </UFormField>
                    <UFormField label="Email" class="w-full">
                      <UInput
                        :value="owner.person.email"
                        class="w-full"
                        readonly
                      />
                    </UFormField>
                    <UFormField label="No. Telepon" class="w-full">
                      <UInput
                        :value="owner.person.phone"
                        class="w-full"
                        readonly
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
                        v-if="
                          detailData?.owners?.[index]?.person?.document?.length
                        "
                        class="grid grid-cols-2 gap-3 mb-3"
                      >
                        <a
                          v-for="doc in detailData.owners[index].person
                            .document"
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
                        Upload file baru hanya jika ingin mengganti dokumen yang
                        sudah ada.
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
                          @change="
                            handleOwnerFileChange(index, 'kk_pembeli', $event)
                          "
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
                  label-key="nib"
                  :items="certificateList"
                  class="w-full"
                  placeholder="Ketik NIB atau kode sertifikat..."
                  :loading="isLoading"
                  @update:searchTerm="searchCertificate"
                  @update:modelValue="selectCertificate"
                  @clear="() => selectCertificate(null)"
                  clear
                />
              </UFormField>

              <div v-if="form.certificate?.id" class="grid grid-cols-3 gap-4">
                <UFormField label="Jenis Sertifikat">
                  <UInput
                    :value="form.certificate.type"
                    class="w-full"
                    readonly
                  />
                </UFormField>
                <UFormField label="NIB">
                  <UInput
                    :value="form.certificate.nib"
                    class="w-full"
                    readonly
                  />
                </UFormField>
                <UFormField label="Status">
                  <UInput
                    :value="form.certificate.status"
                    class="w-full"
                    readonly
                  />
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
                  <UInput
                    :value="form.certificate.land.rt"
                    class="w-full"
                    readonly
                  />
                </UFormField>
                <UFormField label="RW">
                  <UInput
                    :value="form.certificate.land.rw"
                    class="w-full"
                    readonly
                  />
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
                <UIcon
                  name="i-lucide-info"
                  class="size-4 text-muted shrink-0"
                />
                <p class="text-sm text-muted">
                  Cari dan pilih sertifikat untuk mengisi data tanah secara
                  otomatis.
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
                  Upload file baru hanya jika ingin mengganti dokumen yang sudah
                  ada. Format: JPG, PNG, PDF. Maks. 5MB per file.
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
                  <UIcon
                    name="i-lucide-file-text"
                    class="size-4 text-primary"
                  />
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
              @click="handleCancelEdit"
            />

            <UButton
              v-if="!editMode"
              label="Buat Permohonan"
              icon="i-lucide-send"
              color="primary"
              :loading="isLoading"
              class="min-w-44"
              @click="handleSubmit"
            />
            <UButton
              v-else
              label="Simpan Perubahan"
              icon="i-lucide-save"
              color="warning"
              :loading="isLoading"
              class="min-w-44"
              @click="handleUpdate"
            />
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
