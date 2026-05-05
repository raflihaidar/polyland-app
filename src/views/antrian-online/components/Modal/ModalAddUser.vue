<script setup lang="ts">
import { ref } from "vue";

const form = ref({
  nik: "",
  nama: "",
  handphone: "",
  tempatLahir: "",
  tanggalLahir: null,
});

const personList = ref([
  {
    id: 1,
    label: "Rafli",
    nik: 1234123,
  },
]);
</script>

<template>
  <UModal title="Tambah Pengguna">
    <UButton icon="ri:user-add-fill" />
    <template #body>
      <UForm class="grid grid-cols-1 gap-y-3">
        <UFormField label="NIK">
          <USelectMenu
            v-model="form.nik"
            value-key="id"
            :items="personList"
            class="w-full"
            placeholder="Pilih Kantor Pertanahan"
            size="xl"
          >
            <template #empty>
              <UButton
                icon="ri:add-circle-line"
                label="Tambah Manual"
              ></UButton>
            </template>
          </USelectMenu>
        </UFormField>
      </UForm>
    </template>
  </UModal>
</template>
