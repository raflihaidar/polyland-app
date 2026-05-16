<script setup lang="ts">
import { provide, ref, shallowRef } from "vue";
import * as z from "zod";
import { CalendarDate } from "@internationalized/date";
import { Gender } from "../../types";

provide("head-title", "Verifikasi Akun");

const schema = z.object({
  fullName: z
    .string({ message: "Nama lengkap wajib diisi" })
    .min(1, "Nama lengkap tidak boleh kosong"),

  nik: z
    .string({ message: "NIK wajib diisi" })
    .trim()
    .min(16, "NIK harus 16 digit")
    .max(16, "NIK harus 16 digit"),

  phone: z
    .string({ message: "Nomor HP wajib diisi" })
    .trim()
    .min(10, "Nomor HP tidak valid"),

  birthPlace: z
    .string({ message: "Tempat lahir wajib diisi" })
    .trim()
    .min(1, "Tempat lahir tidak boleh kosong"),

  birthDate: z.date({ message: "Tanggal lahir wajib diisi" }),

  gender: z.enum([Gender.lakiLaki, Gender.perempuan], {
    message: "Jenis kelamin wajib dipilih",
  }),

  publicKey: z.string({ message: "Wallet belum terhubung" }),
  wallet_address: z.string({ message: "Wallet belum terhubung" }),

  address: z
    .string({ message: "Alamat wajib diisi" })
    .min(5, "Alamat terlalu pendek"),
});

export type VerifikasiSchema = z.output<typeof schema>;

const form = ref<Partial<VerifikasiSchema>>({
  fullName: "",
  nik: "",
  phone: "",
  birthPlace: "",
  birthDate: new Date(),
  gender: Gender.lakiLaki,
  address: "",
  publicKey: "",
});

const modelValue = shallowRef(new CalendarDate(2022, 1, 10));

provide("verifikasi-form", form);
provide("verifikasi-schema", schema);
provide("verifikasi-model-date", modelValue);
</script>

<template>
  <div class="w-full">
    <RouterView />
  </div>
</template>
