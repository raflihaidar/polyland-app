<template>
  <UCard>
    <div class="flex flex-col items-center border-b-2 border-slate-200 pb-3">
      <p>Nomor Antrian Kamu</p>
      <h3 class="font-bold text-4xl">A001</h3>
    </div>

    <div class="mt-3 flex flex-col gap-y-5">
      <p class="font-medium text-lg">Informasi Lengkap</p>

      <section>
        <p class="font-medium">Kantor Pertanahan</p>
        <p class="tex-sm">Kantor Pertanahan Kabupaten Bogor</p>
      </section>

      <section>
        <p class="font-medium">Lokasi Kerja</p>
        <p class="tex-sm">Jalan Siliwangi</p>
      </section>

      <section>
        <p class="font-medium">Loket Group</p>
        <p class="tex-sm">Loket Peralihan Hak</p>
      </section>

      <section>
        <p class="font-medium">Tanggal Kunjungan</p>
        <p class="text-sm">07 Mei 2026</p>
      </section>
    </div>

    <template #footer>
      <p class="text-sm">
        Terimakasih telah menggunakan Layanan Antrian Online Kementrian ATR/BPN
      </p>
    </template>
  </UCard>
</template>
