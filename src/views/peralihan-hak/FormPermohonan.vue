<script setup lang="ts">
import MobileLayout from "../../layouts/Mobile.vue";
import { z } from "zod";
import { ref, reactive, computed, watch, provide } from "vue";
import type { FormSubmitEvent, StepperItem } from "@nuxt/ui";
import { useApplicationStore } from "../../stores/application.store";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useRoute, useRouter } from "vue-router";

provide("head-title", "Form Permohonan Peralihan Hak");

const toast = useToast();
const store = useApplicationStore();
const router = useRouter();
const route = useRoute();

const land_office_id = route.query?.officeId;
const currentStep = ref(0);
const formRef = ref();

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const fileSchema = z
  .any()
  .refine((file) => file, "File wajib diupload")
  .refine((file) => !file || file.size <= MAX_FILE_SIZE, "Max file 10MB");

const schema = z.object({
  land_office_id: z.string(),
  street_address: z.string().min(1, "Alamat wajib diisi"),
  rt: z.number().min(1, "RT wajib diisi"),
  rw: z.number().min(1, "RW wajib diisi"),
  ward: z.string().min(1, "Kelurahan wajib diisi"),
  subdistrict: z.string().min(1, "Kecamatan wajib diisi"),
  regency: z.string().min(1, "Kabupaten wajib diisi"),
  province: z.string().min(1, "Provinsi wajib diisi"),
  cert_number: z.string().min(1, "Nomor sertifikat wajib diisi"),
  cert_type: z.string().min(1, "Jenis sertifikat wajib dipilih"),
  area_size: z.number().min(1, "Luas tanah wajib diisi"),

  cert_file: fileSchema,
  ktp_penjual: fileSchema,
  kk_pembeli: fileSchema,
  ktp_pembeli: fileSchema,
  akta_jual_beli: fileSchema,
  fc_sppt: fileSchema,
  fc_pbb: fileSchema,
  ssb: fileSchema,
});

type Schema = z.infer<typeof schema>;

const form = reactive<Schema>({
  land_office_id: land_office_id as string,
  street_address: "",
  rt: 0,
  rw: 0,
  ward: "",
  subdistrict: "",
  regency: "",
  province: "",
  cert_type: "",
  cert_number: "",
  area_size: 0,

  cert_file: null,
  ktp_penjual: null,
  kk_pembeli: null,
  ktp_pembeli: null,
  akta_jual_beli: null,
  fc_sppt: null,
  fc_pbb: null,
  ssb: null,
});

const stepSchemas = [
  schema.pick({
    street_address: true,
    rt: true,
    rw: true,
    ward: true,
    subdistrict: true,
    regency: true,
    province: true,
    cert_number: true,
    cert_type: true,
  }),
  schema.pick({
    cert_file: true,
    ktp_penjual: true,
    kk_pembeli: true,
    ktp_pembeli: true,
    akta_jual_beli: true,
    fc_sppt: true,
    fc_pbb: true,
  }),
];

const stepValidity = ref([false, false]);

const validateStep = (index: number) => {
  const result = stepSchemas[index]?.safeParse(form);
  stepValidity.value[index] = result?.success || true ;
};

watch(
  form,
  () => {
    validateStep(0);
    validateStep(1);
  },
  { deep: true },
);

const items = computed<StepperItem[]>(() => [
  {
    title: "Data Tanah",
    icon: stepValidity.value[0]
      ? "i-lucide-check-circle"
      : "i-lucide-alert-circle",
    color: stepValidity.value[0] ? "primary" : "red",
  },
  {
    title: "Dokumen",
    disabled: !stepValidity.value[0],
    icon: stepValidity.value[1]
      ? "i-lucide-check-circle"
      : "i-lucide-alert-circle",
    color: stepValidity.value[1] ? "primary" : "red",
  },
  {
    title: "Review",
    disabled: !stepValidity.value[1],
    icon: "i-lucide-check",
  },
]);

const handleStepChange = (step: number) => {
  // Tidak boleh ke step 2 kalau step 1 belum valid
  if (step === 1 && !stepValidity.value[0]) return;

  // Tidak boleh ke step 3 kalau step 2 belum valid
  if (step === 2 && !stepValidity.value[1]) return;

  currentStep.value = step;
};

const nextStep = async () => {
  const result = stepSchemas[currentStep.value]?.safeParse(form);

  if (!result?.success) {
    await formRef.value.validate();
    return;
  }

  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const formData = new FormData();

  Object.entries(event.data).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      formData.append(key, value[0]);
    } else {
      formData.append(key, value as any);
    }
  });

  const { status, message, data } = await store.submitApplication(formData);

  if (status === "error") {
    toast.add({
      title: "Verifikasi gagal",
      description: message,
      color: "error",
    });
  } else {
    router.push({
      name: "konfirmasi-peralihan-hak",
      query: { fileNumber: data },
    });
  }
};
</script>

<template>
  <MobileLayout>
    <div class="space-y-6 pb-20">
      <!-- STEPPER -->
      <UStepper
        :model-value="currentStep"
        :items="items"
        @update:model-value="handleStepChange"
      />

      <UForm
        ref="formRef"
        :schema="schema"
        :state="form"
        @submit="onSubmit"
        class="space-y-4"
      >
        <!-- ================= STEP 1 ================= -->
        <div v-if="currentStep === 0" class="space-y-4">
          <UFormField name="street_address" label="Alamat lengkap">
            <UTextarea v-model="form.street_address" class="w-full" />
          </UFormField>

          <div class="flex gap-2">
            <UFormField name="rt" label="RT">
              <UInputNumber v-model="form.rt" class="w-full" />
            </UFormField>
            <UFormField name="rw" label="RW">
              <UInputNumber v-model="form.rw" class="w-full" />
            </UFormField>
          </div>

          <UFormField name="ward" label="Kelurahan">
            <UInput v-model="form.ward" class="w-full" />
          </UFormField>

          <UFormField name="subdistrict" label="Kecamatan">
            <UInput v-model="form.subdistrict" class="w-full" />
          </UFormField>

          <UFormField name="regency" label="Kabupaten">
            <UInput v-model="form.regency" class="w-full" />
          </UFormField>

          <UFormField name="province" label="Provinsi">
            <UInput v-model="form.province" class="w-full" />
          </UFormField>

          <UFormField name="area_size" label="Luas Tanah (m2)">
            <UInputNumber v-model="form.area_size" />
          </UFormField>

          <div class="flex gap-2">
            <UFormField
              name="cert_number"
              label="Nomor Sertifikat"
              class="w-[60%]"
            >
              <UInput v-model="form.cert_number" />
            </UFormField>

            <UFormField
              name="cert_type"
              label="Jenis Sertifikat"
              class="w-[40%]"
            >
              <USelect
                class="w-full"
                v-model="form.cert_type"
                :items="['SHM', 'SHGB', 'SHGU']"
              />
            </UFormField>
          </div>

          <UButton
            block
            type="button"
            :disabled="!stepValidity[0]"
            @click="nextStep"
          >
            Lanjut
          </UButton>
        </div>

        <!-- ================= STEP 2 ================= -->
        <div v-if="currentStep === 1" class="space-y-4">
          <UFormField name="cert_file" label="Sertifikat">
            <UFileUpload v-model="form.cert_file" />
          </UFormField>

          <UFormField name="ktp_penjual" label="KTP Penjual">
            <UFileUpload v-model="form.ktp_penjual" />
          </UFormField>

          <UFormField name="kk_pembeli" label="KK Pembeli">
            <UFileUpload v-model="form.kk_pembeli" />
          </UFormField>

          <UFormField name="ktp_pembeli" label="KTP Pembeli">
            <UFileUpload v-model="form.ktp_pembeli" />
          </UFormField>

          <UFormField name="akta_jual_beli" label="Akta Jual Beli">
            <UFileUpload v-model="form.akta_jual_beli" />
          </UFormField>

          <UFormField name="fc_sppt" label="SPPT">
            <UFileUpload v-model="form.fc_sppt" />
          </UFormField>

          <UFormField name="fc_pbb" label="PBB">
            <UFileUpload v-model="form.fc_pbb" />
          </UFormField>

          <UFormField name="ssb" label="SSB">
            <UFileUpload v-model="form.ssb" />
          </UFormField>

          <div class="flex gap-2">
            <UButton block variant="outline" @click="prevStep">
              Kembali
            </UButton>

            <UButton
              block
              type="button"
              :disabled="!stepValidity[1]"
              @click="nextStep"
            >
              Lanjut
            </UButton>
          </div>
        </div>

        <!-- ================= STEP 3 ================= -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div class="bg-gray-100 p-4 rounded">
            <p><strong>Alamat:</strong> {{ form.street_address }}</p>
            <p><strong>Kelurahan:</strong> {{ form.ward }}</p>
            <p><strong>Kecamatan:</strong> {{ form.subdistrict }}</p>
            <p><strong>Kabupaten:</strong> {{ form.regency }}</p>
            <p><strong>Provinsi:</strong> {{ form.province }}</p>
            <p><strong>Jenis:</strong> {{ form.cert_type }}</p>
          </div>

          <div class="flex gap-2">
            <UButton block variant="outline" @click="prevStep">
              Kembali
            </UButton>

            <UButton block type="submit" :loading="store.isLoading('SUBMIT')">
              Submit Permohonan
            </UButton>
          </div>
        </div>
      </UForm>
    </div>
  </MobileLayout>
</template>
