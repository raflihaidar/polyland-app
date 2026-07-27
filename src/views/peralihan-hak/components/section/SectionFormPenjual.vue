<script setup lang="ts">
import { useApiPrivate } from "@/composables/useApi";
import { docTypeToLabel, type OwnerForm } from "@/types";
import { getFileUrl } from "@/utils/file";

const props = defineProps<{
  editMode: boolean;
  detailData?: any;
}>();

const sellers = defineModel<OwnerForm[]>("sellers", { required: true });

const api = useApiPrivate();

const addSeller = () => {
  sellers.value.push({
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
      kk_penjual: null,
      ktp_penjual: null,
      surat_nikah_penjual: null,
      npwp_penjual: null,
    } as any,
    marital_status: "belum_menikah",
    share: "0",
  } as any);
};

if (sellers.value.length === 0) {
  addSeller();
}

const searchSeller = async (index: number, query: string) => {
  if (!query || query.length < 3 || !sellers.value[index]) return;
  sellers.value[index].isSearching = true;
  try {
    const { data } = await api.get(`/person/search?q=${query}`);
    sellers.value[index].result = data.data ?? [];
  } catch {
    if (sellers.value[index]) sellers.value[index].result = [];
  } finally {
    sellers.value[index].isSearching = false;
  }
};

const selectSeller = (index: number, person: any) => {
  if (!sellers.value[index]) return;
  sellers.value[index].person = {
    ...person,
    marital_status:
      sellers.value[index].person.marital_status ?? "belum_menikah",
    ktp_penjual: null,
    kk_penjual: null,
    surat_nikah: null,
  };
  sellers.value[index].result = [];
};

const handleSellerFileChange = (
  index: number,
  key: "ktp_penjual" | "kk_penjual" | "surat_nikah_penjual" | "npwp_penjual",
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  (sellers.value[index]!.person as any)[key] = target.files?.[0] ?? null;
};

const removeSeller = (index: number) => {
  if (sellers.value.length <= 1) return;
  sellers.value.splice(index, 1);
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
          Data Penjual
        </p>
      </div>
      <UButton
        label="Tambah Penjual"
        icon="i-lucide-plus"
        size="sm"
        color="neutral"
        variant="outline"
        @click="addSeller"
      />
    </div>

    <div class="p-6 space-y-4">
      <div
        v-for="(seller, index) in sellers"
        :key="index"
        class="border border-default rounded-lg overflow-hidden"
      >
        <div
          class="bg-elevated/30 px-4 py-2.5 border-b border-default flex items-center justify-between"
        >
          <span class="text-sm font-medium text-muted"
            >Penjual ke-{{ index + 1 }}</span
          >
          <div class="flex items-center gap-2">
            <UButton
              label="Cari Data"
              :color="seller.mode === 'search' ? 'primary' : 'neutral'"
              :variant="seller.mode === 'search' ? 'solid' : 'outline'"
              @click="seller.mode = 'search'"
            />
            <UButton
              label="Input Manual"
              :color="seller.mode === 'manual' ? 'primary' : 'neutral'"
              :variant="seller.mode === 'manual' ? 'solid' : 'outline'"
              @click="seller.mode = 'manual'"
            />
            <UButton
              icon="i-lucide-trash-2"
              size="xs"
              color="error"
              variant="ghost"
              :disabled="sellers.length === 1"
              @click="removeSeller(index)"
            />
          </div>
        </div>

        <div class="p-4 space-y-4">
          <div v-if="seller.mode === 'search'" class="grid grid-cols-1 gap-4">
            <UFormField label="Cari Penjual (Nama / NIK)" required>
              <USelectMenu
                v-model="seller.query"
                by="id"
                label-key="name"
                :items="seller.result"
                class="w-full"
                placeholder="Cari Nama/NIK..."
                :loading="seller.isSearching"
                @update:searchTerm="searchSeller(index, $event)"
                @update:modelValue="selectSeller(index, $event)"
                @clear="
                  () => {
                    seller.query = '';
                  }
                "
                clear
              />
            </UFormField>
          </div>

          <div v-else class="grid grid-cols-1 gap-4">
            <UFormField label="Nama Lengkap" required>
              <UInput
                v-model="seller.person.name"
                placeholder="Nama sesuai KTP"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Marital status -->
          <div class="border-t border-default pt-4">
            <p
              class="text-xs font-medium text-muted mb-3 flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-heart" class="size-3.5" />
              Status Pernikahan Penjual {{ index + 1 }}
            </p>
            <div class="flex items-center gap-2 mb-3">
              <UButton
                label="Belum Menikah"
                size="sm"
                :color="
                  (seller as any).person.marital_status === 'belum_menikah'
                    ? 'primary'
                    : 'neutral'
                "
                :variant="
                  (seller as any).person.marital_status === 'belum_menikah'
                    ? 'solid'
                    : 'outline'
                "
                @click="(seller as any).person.marital_status = 'belum_menikah'"
              />
              <UButton
                label="Menikah"
                size="sm"
                :color="
                  (seller as any).person.marital_status === 'menikah'
                    ? 'primary'
                    : 'neutral'
                "
                :variant="
                  (seller as any).person.marital_status === 'menikah'
                    ? 'solid'
                    : 'outline'
                "
                @click="(seller as any).person.marital_status = 'menikah'"
              />
            </div>
          </div>

          <!-- Seller documents -->
          <div class="border-t border-default pt-4">
            <p
              class="text-xs font-medium text-muted mb-3 flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-paperclip" class="size-3.5" />
              Dokumen Penjual {{ index + 1 }}
            </p>

            <template v-if="editMode">
              <div
                v-if="detailData?.sellers?.[index]?.person?.document?.length"
                class="grid grid-cols-2 gap-3 mb-5"
              >
                <a
                  v-for="doc in detailData.sellers[index].person.document"
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
                (seller as any).person.marital_status === 'menikah'
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
                  @change="handleSellerFileChange(index, 'ktp_penjual', $event)"
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
                  @change="handleSellerFileChange(index, 'kk_penjual', $event)"
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
                  @change="
                    handleSellerFileChange(index, 'npwp_penjual', $event)
                  "
                />
              </div>
              <div
                v-if="(seller as any).marital_status === 'menikah'"
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
                    handleSellerFileChange(index, 'surat_nikah_penjual', $event)
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
