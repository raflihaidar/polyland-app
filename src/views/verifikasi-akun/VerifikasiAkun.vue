<script setup lang="ts">
import mobileLayout from "../../layouts/mobile.vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { provide, ref, useTemplateRef, shallowRef } from "vue";
import * as z from "zod";
import { useAccountStore } from "../../stores/account.store";
import { CalendarDate } from '@internationalized/date'
import { Gender } from "../../types";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useRouter } from "vue-router";

provide("head-title", "Verifikasi Akun");

const toast = useToast()
const router = useRouter()
const store = useAccountStore()
const schema = z.object({
  fullName: z.string({
    message: "Nama lengkap wajib diisi"
  }).min(1, "Nama lengkap tidak boleh kosong"),

  nik: z.string({
    message: "NIK wajib diisi"
  })
    .trim()
    .min(16, "NIK harus 16 digit")
    .max(16, "NIK harus 16 digit"),

  phone: z.string({
    message: "Nomor HP wajib diisi"
  })
    .trim()
    .min(10, "Nomor HP tidak valid"),

  birthPlace: z.string({
    message: "Tempat lahir wajib diisi"
  })
    .trim()
    .min(1, "Tempat lahir tidak boleh kosong"),

  birthDate: z.date({
    message: "Tanggal lahir wajib diisi",
  }),

  gender: z.enum(
    [Gender.lakiLaki, Gender.perempuan],
    {
      message: "Jenis kelamin wajib dipilih",
    }
  ),

  address: z.string({
    message: "Alamat wajib diisi"
  }).min(5, "Alamat terlalu pendek")
});
type Schema = z.output<typeof schema>;
const inputDate = useTemplateRef('inputDate')
const modelValue = shallowRef(new CalendarDate(2022, 1, 10))
const form = ref<Partial<Schema>>({
    fullName: "",
    nik: "",
    phone: "",
    birthPlace: "",
    birthDate: new Date(),
    gender: Gender.lakiLaki,
    address: ""
});

const submit = async (event: FormSubmitEvent<Schema>): Promise<void> => {
    const { status, message } = await store.submitVerification(event.data);

    if(status === 'error') {
      toast.add({
        title : 'Verifikasi aagal',
        description : message,
        color : 'error'
      })
    }else{
      router.push('/verifikasi-akun/konfirmasi')
    }
};

</script>

<template>
  <mobileLayout>
    <div class="w-full">
        <UAlert title="Informasi" description="Silahkan isi data diri sesuai dengan KTP" variant="solid" class="mb-4"/>
        <UForm
          :schema="schema"
          :state="form"
          class="space-y-4"
          @submit="submit"
        >
          <UFormField name="fullName" label="Nama Lengkap">
            <UInput v-model="form.fullName" placeholder="Masukkan Nama Lengkap" class="w-full"/>
          </UFormField>
    
          <UFormField name="nik" label="NIK">
            <UInput v-model="form.nik" placeholder="16 Digit NIK"  class="w-full" />
          </UFormField>
    
          <UFormField name="phone" label="No HP">
            <UInput v-model="form.phone" placeholder="Masukkan Nomor HP"  class="w-full" />
          </UFormField>
    
          <UFormField name="birthPlace" label="Tempat Lahir">
            <UInput v-model="form.birthPlace" placeholder="Tempat Lahir"  class="w-full" />
          </UFormField>

          <section class="flex items-center gap-x-5">
                    <UFormField name="birthDate" label="Tanggal Lahir">
                      <UInputDate ref="inputDate" v-model="modelValue" class="w-full">
                      <template #trailing>
                          <UPopover :reference="inputDate?.inputsRef[3]?.$el">
                              <UButton
                                  color="neutral"
                                  variant="link"
                                  size="sm"
                                  icon="i-lucide-calendar"
                                  aria-label="Select a date"
                                  class="px-0"
                                  />
              
                              <template #content>
                                  <UCalendar v-model="modelValue" class="p-2" />
                              </template>
                          </UPopover>
                      </template>
                      </UInputDate>
                    </UFormField>
              
                    <UFormField name="gender" label="Jenis Kelamin">
                      <USelect
                        v-model="form.gender"
                        value-key="value"
                        :items="[
                          { label: 'Laki-Laki', value: Gender.lakiLaki },
                          { label: 'Perempuan', value: Gender.perempuan }
                        ]"
                        class="w-full"
                      />
                    </UFormField>
          </section>
    
          <UFormField name="address" label="Alamat Lengkap">
            <UTextarea
              v-model="form.address"
              placeholder="Masukkan alamat lengkap"
              class="w-full"
            />
          </UFormField>
    
          <UButton
            type="submit"
            label="Kirim Verifikasi"
            :loading="store.isLoading('SUBMIT_VERIFICATION')"
            block
            class="mt-5"
          />
        </UForm>
    </div>
  </mobileLayout>
</template>
