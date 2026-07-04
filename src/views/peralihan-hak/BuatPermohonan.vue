<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useAuthStore } from "@/stores/auth.store";
import { useApiPrivate } from "@/composables/useApi";
import { useRoute, useRouter } from "vue-router";
import type { ApplicationDetailResponse } from "@/types";
import { useConfirmDialog } from "@/composables/useConfirmModal";
import FormView from "./components/FormView.vue";
import FormEdit, { type OwnershipTransferFormModel } from "./components/FormEdit.vue";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const confirm = useConfirmDialog();
const api = useApiPrivate();

const detailData = ref<any>(null);
const notes = ref<string[]>([]);
const isLoading = ref(false);
const editMode = ref(false);

const form = reactive<OwnershipTransferFormModel>({
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

const isViewMode = computed(
  () => !!route.params?.id && !route.path.includes("create"),
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

// ─── Populate form dari detailData (masuk Edit Mode) ───────────────
const populateFormFromDetail = () => {
  if (!detailData.value) return;

  const d = detailData.value;

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

  // Reset files (user harus upload ulang jika ingin mengganti)
  form.files = {
    cert_file: null,
    akta_jual_beli: null,
    fc_sppt: null,
    fc_pbb: null,
    ssb: null,
    ktp_penjual: null,
  };
};

const handleChangeEditMode = () => {
  populateFormFromDetail();
  editMode.value = true;
};

const handleCancelEdit = () => {
  editMode.value = false;
};

// ─── Submit dari FormEdit (FormData sudah dibangun di komponen anak) ─
const handleSubmit = async (formData: FormData) => {
  try {
    isLoading.value = true;
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

const handleUpdate = async (formData: FormData) => {
  try {
    isLoading.value = true;
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
    const isRejected = status === "DITOLAK";

    const isConfirmed = await confirm({
      title: isRejected ? "Tolak Permohonan" : "Lanjut ke Tahap Berikutnya",
      description: isRejected
        ? "Apakah Anda yakin ingin menolak permohonan ini?"
        : "Apakah Anda yakin ingin melanjutkan permohonan ini ke tahap berikutnya?",
    });

    if (!isConfirmed) return;

    isLoading.value = true;

    const { data } = await api.put(
      `/ownership-transfer/status?fileNumber=${detailData.value.file_number}`,
      { status },
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
      description: "Gagal update status permohonan. Coba lagi.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const handleGenerateCertificate = async () => {
  try {
    const isConfirmed = await confirm({
      title: "Penerbitan Sertifikat",
      description:
        "Apakah Anda yakin ingin memulai proses penerbitan sertifikat untuk permohonan ini?",
    });

    if (!isConfirmed) return;

    isLoading.value = true;

    const { data } = await api.post(
      `/ownership-transfer/enqueue-certificate/${detailData.value.id}`,
      { notes: [...notes.value] },
    );

    if (data.status === "success") {
      toast.add({
        title: "Proses Berhasil Dimulai",
        description:
          data?.message ?? "Permohonan penerbitan sertifikat sedang diproses.",
        color: "success",
      });

      await getApplicationDetail();
    }
  } catch (error) {
    toast.add({
      title: "Terjadi Kesalahan",
      description: "Gagal memproses penerbitan sertifikat. Silakan coba lagi.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (isViewMode.value) {
    await getApplicationDetail();
  }
});
</script>

<template>
  <div
    v-if="isLoading && isViewMode && !editMode"
    class="flex items-center justify-center py-32"
  >
    <UIcon name="i-lucide-loader-2" class="size-8 text-primary animate-spin" />
  </div>

  <div v-else class="w-full px-5 space-y-6">
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
    </section>

    <FormView
      v-if="isViewMode && detailData && !editMode"
      :detail-data="detailData"
      @reject="handleUpdateStatus('DITOLAK')"
      @next-payment="handleUpdateStatus('MENUNGGU_PEMBAYARAN')"
      @edit="handleChangeEditMode"
      @generate-certificate="handleGenerateCertificate"
    />

    <FormEdit
      v-else-if="!isViewMode || editMode"
      v-model:form="form"
      :edit-mode="editMode"
      :detail-data="detailData"
      :is-loading="isLoading"
      @submit="handleSubmit"
      @save="handleUpdate"
      @cancel="handleCancelEdit"
    />
  </div>
</template>
