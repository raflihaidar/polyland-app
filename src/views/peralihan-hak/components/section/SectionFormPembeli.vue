<script setup lang="ts">
import { ref } from "vue";
import { useApiPrivate } from "@/composables/useApi";
import { docTypeToLabel, type OwnerForm } from "@/types";
import { getFileUrl } from "@/utils/file";

const props = defineProps<{
  editMode: boolean;
  detailData?: any;
}>();

const owners = defineModel<OwnerForm[]>("owners", { required: true });

const api = useApiPrivate();

const manualShareIndexes = ref<Set<number>>(new Set());

const recalculateShares = () => {
  const total = owners.value.length;
  if (total === 0) return;

  const manualIndexes = [...manualShareIndexes.value].filter((i) => i < total);
  const lockedSum = manualIndexes.reduce(
    (sum, i) => sum + (Number(owners.value[i]?.share) || 0),
    0,
  );

  const autoIndexes = owners.value
    .map((_, i) => i)
    .filter((i) => !manualIndexes.includes(i));

  if (autoIndexes.length === 0) return;

  const remaining = Math.max(100 - lockedSum, 0);
  const equalShare = remaining / autoIndexes.length;

  autoIndexes.forEach((ownerIndex, idx) => {
    if (idx === autoIndexes.length - 1) {
      const sumOthers = equalShare * (autoIndexes.length - 1);
      owners.value[ownerIndex]!.share = (remaining - sumOthers).toFixed(2);
    } else {
      owners.value[ownerIndex]!.share = equalShare.toFixed(2);
    }
  });
};

const handleShareInput = (index: number, value: string | number) => {
  if (!owners.value[index]) return;
  owners.value[index].share = String(value);
  manualShareIndexes.value.add(index);
  recalculateShares();
};

const resetShareToAuto = (index: number) => {
  manualShareIndexes.value.delete(index);
  recalculateShares();
};

const addOwner = () => {
  owners.value.push({
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
      marital_status: "belum_menikah",
      kk_pembeli: null,
      ktp_pembeli: null,
      surat_nikah_pembeli: null,
      npwp_pembeli: null,
    },
    share: "0",
  });
  recalculateShares();
};

if (owners.value.length === 0) {
  addOwner();
}

const searchOwner = async (index: number, query: string) => {
  if (!query || query.length < 3 || !owners.value[index]) return;
  owners.value[index].isSearching = true;
  try {
    const { data } = await api.get(`/person/search?q=${query}`);
    owners.value[index].result = data.data ?? [];
  } catch {
    if (owners.value[index]) owners.value[index].result = [];
  } finally {
    owners.value[index].isSearching = false;
  }
};

const selectOwner = (index: number, person: any) => {
  if (!owners.value[index]) return;
  owners.value[index].person = {
    ...person,
    marital_status:
      owners.value[index].person.marital_status ?? "belum_menikah",
    ktp_pembeli: null,
    kk_pembeli: null,
    surat_nikah: null,
  };
  owners.value[index].result = [];
};

const handleOwnerFileChange = (
  index: number,
  key: "ktp_pembeli" | "kk_pembeli" | "surat_nikah_pembeli" | "npwp_pembeli",
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  owners.value[index]!.person[key] = target.files?.[0] ?? null;

  console.log("owner data : ", owners.value);
};

const removeOwner = (index: number) => {
  if (owners.value.length <= 1) return;
  owners.value.splice(index, 1);

  // Geser ulang index manual setelah splice, karena posisi baris berubah
  const updated = new Set<number>();
  manualShareIndexes.value.forEach((i) => {
    if (i < index) updated.add(i);
    else if (i > index) updated.add(i - 1);
    // i === index dibuang karena barisnya terhapus
  });
  manualShareIndexes.value = updated;

  recalculateShares();
};
</script>

<template>
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
        v-for="(owner, index) in owners"
        :key="index"
        class="border border-default rounded-lg overflow-hidden"
      >
        <div
          class="bg-elevated/30 px-4 py-2.5 border-b border-default flex items-center justify-between"
        >
          <span class="text-sm font-medium text-muted">Calon Pemilik Baru</span>
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
              v-if="index !== 0"
              icon="i-lucide-trash-2"
              size="sm"
              color="error"
              variant="subtle"
              @click="removeOwner(index)"
            />
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
              <div class="flex items-center gap-2">
                <UInput
                  :model-value="owner.share"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Contoh: 50"
                  class="w-full"
                  @update:model-value="handleShareInput(index, $event)"
                />
                <UButton
                  v-if="manualShareIndexes.has(index)"
                  icon="i-lucide-rotate-ccw"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  title="Kembalikan ke pembagian otomatis"
                  @click="resetShareToAuto(index)"
                />
              </div>
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
              <div class="flex items-center gap-2">
                <UInput
                  :model-value="owner.share"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Contoh: 50"
                  class="w-full"
                  @update:model-value="handleShareInput(index, $event)"
                />
                <UButton
                  v-if="manualShareIndexes.has(index)"
                  icon="i-lucide-rotate-ccw"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  title="Kembalikan ke pembagian otomatis"
                  @click="resetShareToAuto(index)"
                />
              </div>
            </UFormField>
          </div>

          <!-- Marital status -->
          <div class="border-t border-default pt-4">
            <p
              class="text-xs font-medium text-muted mb-3 flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-heart" class="size-3.5" />
              Status Pernikahan Pemilik {{ index + 1 }}
            </p>
            <div class="flex items-center gap-2 mb-3">
              <UButton
                label="Belum Menikah"
                size="sm"
                :color="
                  owner.person.marital_status === 'belum_menikah'
                    ? 'primary'
                    : 'neutral'
                "
                :variant="
                  owner.person.marital_status === 'belum_menikah'
                    ? 'solid'
                    : 'outline'
                "
                @click="owner.person.marital_status = 'belum_menikah'"
              />
              <UButton
                label="Menikah"
                size="sm"
                :color="
                  owner.person.marital_status === 'menikah'
                    ? 'primary'
                    : 'neutral'
                "
                :variant="
                  owner.person.marital_status === 'menikah'
                    ? 'solid'
                    : 'outline'
                "
                @click="owner.person.marital_status = 'menikah'"
              />
            </div>
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

            <div
              class="grid gap-4"
              :class="
                owner.person.marital_status === 'menikah'
                  ? 'grid-cols-4'
                  : 'grid-cols-3'
              "
            >
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">
                  Kartu Tanda Penduduk
                  <span v-if="!editMode" class="text-red-500">*</span>
                  <span v-else class="text-muted text-xs"
                    >(opsional, untuk mengganti)</span
                  >
                </label>
                <UInput
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  @change="handleOwnerFileChange(index, 'ktp_pembeli', $event)"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">
                  Kartu Keluarga
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

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">
                  NPWP
                  <span v-if="!editMode" class="text-red-500">*</span>
                  <span v-else class="text-muted text-xs"
                    >(opsional, untuk mengganti)</span
                  >
                </label>
                <UInput
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  @change="handleOwnerFileChange(index, 'npwp_pembeli', $event)"
                />
              </div>

              <div
                v-if="owner.person.marital_status === 'menikah'"
                class="flex flex-col gap-1.5"
              >
                <label class="text-sm font-medium">
                  Surat Nikah
                  <span v-if="!editMode" class="text-red-500">*</span>
                  <span v-else class="text-muted text-xs"
                    >(opsional, untuk mengganti)</span
                  >
                </label>
                <UInput
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  @change="
                    handleOwnerFileChange(index, 'surat_nikah_pembeli', $event)
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
