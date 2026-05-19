<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { inject, useTemplateRef, shallowRef } from "vue";
import { useAccountStore } from "../../../stores/account.store";
import { Gender } from "../../../types";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useRouter } from "vue-router";
import type { VerifikasiSchema } from "../VerifikasiAkun.vue";
import type { Ref, ShallowRef } from "vue";
import type { CalendarDate } from "@internationalized/date";
import type { ZodTypeAny } from "zod";

const toast = useToast();
const router = useRouter();
const store = useAccountStore();

const form = inject<Ref<Partial<VerifikasiSchema>>>("verifikasi-form")!;
const schema = inject<ZodTypeAny>("verifikasi-schema")!;
const modelValue = inject<ShallowRef<CalendarDate>>("verifikasi-model-date")!;

const inputDate = useTemplateRef("inputDate");

const submit = () => {
  router.push({ name: "verifasi-akun.wallet-sign" });
};
</script>

<template>
  <div class="w-full">
    <UAlert
      title="Informasi"
      description="Silahkan isi data diri sesuai dengan KTP"
      variant="solid"
      class="mb-4"
    />
    <UForm :schema="schema" :state="form" class="space-y-4">
      <UFormField name="fullName" label="Nama Lengkap">
        <UInput
          v-model="form.fullName"
          placeholder="Masukkan Nama Lengkap"
          class="w-full"
        />
      </UFormField>

      <UFormField name="nik" label="NIK">
        <UInput v-model="form.nik" placeholder="16 Digit NIK" class="w-full" />
      </UFormField>

      <UFormField name="phone" label="No HP">
        <UInput
          v-model="form.phone"
          placeholder="Masukkan Nomor HP"
          class="w-full"
        />
      </UFormField>

      <UFormField name="birthPlace" label="Tempat Lahir">
        <UInput
          v-model="form.birthPlace"
          placeholder="Tempat Lahir"
          class="w-full"
        />
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
              { label: 'Perempuan', value: Gender.perempuan },
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
        @click="submit"
        type="submit"
        label="Lanjut ke Wallet Sign"
        block
        class="mt-5"
      />
    </UForm>
  </div>
</template>
