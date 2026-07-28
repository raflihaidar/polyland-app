<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  ApplicationDetailResponse,
  CertificateData,
  OwnerForm,
} from "@/types";
import { fileLabels } from "@/types";
import SectionFormPembeli from "./section/SectionFormPembeli.vue";
import SectionFormPenjual from "./section/SectionFormPenjual.vue";
import SectionFormSertifikatTanah from "./section/SectionFormSertifikatTanah.vue";
import SectionFormDokumen from "./section/SectionFormDokumen.vue";
import type { TimelineItem } from "@nuxt/ui";

const items = ref<TimelineItem[]>([
  {
    title: "Data Pemilik Baru",
    value: 0,
    description: "Lengkapi data pemilik baru.",
    icon: "i-lucide-user",
  },
  {
    title: "Data Pemilik Lama",
    value: 1,
    description: "Lengkapi data pemilik lama.",
    icon: "i-lucide-user-check",
  },
  {
    title: "Sertifikat Tanah",
    value: 2,
    description: "Cari dan pilih sertifikat tanah.",
    icon: "i-lucide-file-badge",
  },
  {
    title: "Dokumen Pendukung",
    value: 3,
    description: "Upload dokumen pendukung.",
    icon: "i-lucide-paperclip",
  },
]);

const step = ref(0);
const totalSteps = items.value.length;

const isFirstStep = computed(() => step.value === 0);
const isLastStep = computed(() => step.value === totalSteps - 1);

export interface OwnershipTransferFormModel {
  certificate: CertificateData | null;
  land_office_id: string;
  owners: OwnerForm[];
  sellers: OwnerForm[];
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

const isPersonRowValid = (
  row: OwnerForm,
  docKeys: [string, string],
  requireDocs: boolean,
) => {
  const person = row.person as any;

  const identityValid =
    row.mode === "search"
      ? !!person?.id
      : !!(person?.name && person?.nik && person?.phone && person?.email);

  if (!identityValid) return false;

  if (!requireDocs) return true;

  const [ktpKey, kkKey] = docKeys;
  return !!person?.[ktpKey] && !!person?.[kkKey];
};

const isPembeliValid = computed(() => {
  const owners = form.value.owners;
  if (!owners || owners.length === 0) return false;
  return owners.every((o) =>
    isPersonRowValid(o, ["ktp_pembeli", "kk_pembeli"], !props.editMode),
  );
});

const isPenjualValid = computed(() => {
  const sellers = form.value.sellers;
  if (!sellers || sellers.length === 0) return false;
  return sellers.every((s) =>
    isPersonRowValid(s, ["ktp_penjual", "kk_penjual"], !props.editMode),
  );
});

const isSertifikatValid = computed(() => !!form.value.certificate?.id);

const isDokumenValid = computed(() => {
  if (props.editMode) return true; // dokumen opsional saat edit
  return Object.keys(fileLabels).every((key) => !!form.value.files?.[key]);
});

const stepValidity = computed(() => [
  isPembeliValid.value,
  isPenjualValid.value,
  isSertifikatValid.value,
  isDokumenValid.value,
]);

const isCurrentStepValid = computed(() => stepValidity.value[step.value]);

const maxStepReached = computed(() => {
  const firstInvalid = stepValidity.value.findIndex((valid) => !valid);
  return firstInvalid === -1 ? totalSteps - 1 : firstInvalid;
});

const goNext = () => {
  if (!isLastStep.value && isCurrentStepValid.value) step.value++;
};

const goPrev = () => {
  if (!isFirstStep.value) step.value--;
};

const onSelectTimeline = (_e: Event, item: TimelineItem) => {
  const target = item.value as number;
  if (target <= maxStepReached.value) {
    step.value = target;
  }
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

  // ─── Owners (Pembeli) ────────────────────────────────────────────
  form.value.owners.forEach((owner, index) => {
    const person = owner.person as any;

    formData.append(`owners[${index}][mode]`, owner.mode);

    if (owner.mode === "search") {
      formData.append(`owners[${index}][person_id]`, person.id);
    } else {
      formData.append(`owners[${index}][name]`, person.name);
      formData.append(`owners[${index}][nik]`, person.nik!);
      formData.append(`owners[${index}][phone]`, person.phone!);
      formData.append(`owners[${index}][email]`, person.email!);
    }

    formData.append(
      `owners[${index}][share]`,
      (Number(owner.share) / 100).toFixed(4),
    );

    formData.append(
      `owners[${index}][marital_status]`,
      person.marital_status ?? "belum_menikah",
    );

    if (person.ktp_pembeli) {
      formData.append("ktp_pembeli", person.ktp_pembeli as File);
      formData.append("ktp_pembeli_owner_indexes", String(index));
    }
    if (person.kk_pembeli) {
      formData.append("kk_pembeli", person.kk_pembeli as File);
      formData.append("kk_pembeli_owner_indexes", String(index));
    }
    if (person.npwp_pembeli) {
      formData.append("npwp_pembeli", person.npwp_pembeli as File);
      formData.append("npwp_pembeli_owner_indexes", String(index));
    }
    if (person.surat_nikah_pembeli) {
      formData.append(
        "surat_nikah_pembeli",
        person.surat_nikah_pembeli as File,
      );
      formData.append("surat_nikah_pembeli_owner_indexes", String(index));
    }
  });

  // ─── Sellers (Penjual) ───────────────────────────────────────────
  form.value.sellers.forEach((seller, index) => {
    const person = seller.person as any;

    formData.append(`sellers[${index}][mode]`, seller.mode);

    if (seller.mode === "search") {
      formData.append(`sellers[${index}][person_id]`, person.id);
    } else {
      formData.append(`sellers[${index}][name]`, person.name);
      formData.append(`sellers[${index}][nik]`, person.nik!);
      formData.append(`sellers[${index}][phone]`, person.phone!);
      formData.append(`sellers[${index}][email]`, person.email!);
    }

    formData.append(
      `sellers[${index}][share]`,
      (Number(seller.share) / 100).toFixed(4),
    );

    formData.append(
      `sellers[${index}][marital_status]`,
      person.marital_status ?? "belum_menikah",
    );

    if (person.ktp_penjual) {
      formData.append("ktp_penjual", person.ktp_penjual as File);
      formData.append("ktp_penjual_seller_indexes", String(index));
    }
    if (person.kk_penjual) {
      formData.append("kk_penjual", person.kk_penjual as File);
      formData.append("kk_penjual_seller_indexes", String(index));
    }
    if (person.npwp_penjual) {
      formData.append("npwp_penjual", person.npwp_penjual as File);
      formData.append("npwp_penjual_seller_indexes", String(index));
    }
    if (person.surat_nikah_penjual) {
      formData.append(
        "surat_nikah_penjual",
        person.surat_nikah_penjual as File,
      );
      formData.append("surat_nikah_penjual_seller_indexes", String(index));
    }
    if (person.sppt_pbb) {
      formData.append("sppt_pbb", person.sppt_pbb as File);
      formData.append("sppt_pbb_seller_indexes", String(index));
    }
  });

  return formData;
};

const handleSubmitClick = () => {
  if (!isCurrentStepValid.value) return;
  const formData = buildFormData();
  if (props.editMode) {
    emit("save", formData);
  } else {
    emit("submit", formData);
  }
};
</script>

<template>
  <UTimeline
    v-model="step"
    orientation="horizontal"
    :items="items"
    @select="onSelectTimeline"
    class="w-full cursor-pointer"
  />

  <div class="space-y-6 mt-6">
    <SectionFormPembeli
      v-show="step === 0"
      v-model:owners="form.owners"
      :edit-mode="editMode"
      :detail-data="detailData"
    />

    <SectionFormPenjual
      v-show="step === 1"
      v-model:sellers="form.sellers"
      :edit-mode="editMode"
      :detail-data="detailData"
    />

    <SectionFormSertifikatTanah
      v-show="step === 2"
      v-model:certificate="form.certificate"
    />

    <SectionFormDokumen
      v-show="step === 3"
      v-model:files="form.files"
      :edit-mode="editMode"
      :detail-data="detailData"
    />

    <!-- Navigation Buttons -->
    <div class="flex items-center justify-between gap-3 pt-2 pb-6">
      <div>
        <UButton
          v-if="!isFirstStep"
          label="Sebelumnya"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          @click="goPrev"
        />
      </div>

      <div class="flex items-center gap-3">
        <UButton
          v-if="!isLastStep"
          label="Selanjutnya"
          trailing-icon="i-lucide-arrow-right"
          color="primary"
          :disabled="!isCurrentStepValid"
          @click="goNext"
        />
        <UButton
          v-else-if="!editMode"
          label="Buat Permohonan"
          icon="i-lucide-send"
          color="primary"
          :loading="isLoading"
          :disabled="!isCurrentStepValid"
          @click="handleSubmitClick"
        />
        <UButton
          v-else
          label="Simpan Perubahan"
          icon="i-lucide-save"
          color="warning"
          :loading="isLoading"
          :disabled="!isCurrentStepValid"
          @click="handleSubmitClick"
        />
      </div>
    </div>
  </div>
</template>
