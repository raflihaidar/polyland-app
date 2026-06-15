<script setup lang="ts">
import { useApiPrivate } from "@/composables/useApi";
import { useReferenceStore } from "@/stores/reference.store";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useDebounceFn } from "@vueuse/core";
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const toast = useToast();
const route = useRoute();
const router = useRouter();
const referenceStore = useReferenceStore();

const editMode = ref(false);
const loading = ref(false);
const saving = ref(false);

const detailData = ref<any>(null);

// Form state for edit mode
const form = ref({
  name: "",
  nik: "",
  email: "",
  phone: "",
  gender: "",
  address: "",
  nip: "",
  roles: [] as { id: number; name: string }[],
  landOffice: null as any,
});

const genderOptions = [
  { label: "Laki-laki", value: "LAKI_LAKI" },
  { label: "Perempuan", value: "PEREMPUAN" },
];

const genderLabel = computed(() => {
  if (!detailData.value) return "-";
  return detailData.value.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan";
});

const roleNames = computed<string[]>(() => {
  if (!detailData.value?.roles) return [];
  return detailData.value.roles.map((r: any) => r.role.name);
});

const isOfficer = computed<boolean>(() => {
  if (!detailData.value?.roles) return false;
  const currData = detailData.value.roles.some((r: any) =>
    [1, 2, 3].includes(r.role.id),
  );
  const formData = form.value.roles.some((r: any) => [1, 2, 3].includes(r.id));
  return currData || formData;
});

const getUserDetail = async () => {
  try {
    loading.value = true;
    const { data } = await useApiPrivate().get(
      `/person/detail/${route.params?.id}`,
    );
    detailData.value = data.data;
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat data",
      description: error?.response?.data?.message ?? "Terjadi kesalahan",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const handleEnterEdit = () => {
  if (!detailData.value) return;
  form.value = {
    name: detailData.value.name ?? "",
    nik: detailData.value.nik ?? "",
    email: detailData.value.email ?? "",
    phone: detailData.value.phone ?? "",
    gender: detailData.value.gender ?? "",
    address: detailData.value.address ?? "",
    landOffice: detailData.value.landOffice ?? null,
    nip: detailData.value.nip ?? "",
    roles: detailData.value.roles.map((r: any) => ({
      id: r.role.id,
      name: r.role.name,
    })),
  };
  editMode.value = true;
};

const getAllRole = useDebounceFn(async () => {
  await referenceStore.getAllRole();
}, 300);

const getAllLandOffice = useDebounceFn(async () => {
  await referenceStore.getAllLandOffice();
}, 300);

const handleCancelEdit = () => {
  editMode.value = false;
};
const handleSave = async () => {
  try {
    saving.value = true;

    const payload = {
      name: form.value.name,
      nik: form.value.nik,
      email: form.value.email,
      phone: form.value.phone,
      gender: form.value.gender,
      address: form.value.address,
      nip: form.value.nip,
      landOfficeId: form.value.landOffice?.id ?? null,
      roles: form.value.roles.map((r) => r.id),
    };

    const response = await useApiPrivate().put(
      `/person/${route.params?.id}`,
      payload,
    );
    toast.add({
      title: "Berhasil",
      description:
        response.data?.message ?? "Data pengguna berhasil diperbarui",
      color: "success",
    });
    await getUserDetail();
    editMode.value = false;
  } catch (error: any) {
    toast.add({
      title: "Gagal menyimpan",
      description: error?.response?.data?.message ?? "Terjadi kesalahan",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  getUserDetail();
});
</script>

<template>
  <div class="w-full px-5 space-y-6 overflow-hidden">
    <!-- Top Bar -->
    <section class="flex items-center justify-between mb-6">
      <UButton
        v-if="!editMode"
        label="Kembali"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.back()"
      />
      <UButton
        v-else
        label="Batal Edit"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        @click="handleCancelEdit"
      />

      <div class="flex items-center gap-2">
        <UButton
          v-if="!editMode"
          label="Edit Pengguna"
          icon="i-lucide-pencil"
          color="warning"
          @click="handleEnterEdit"
          :disabled="loading || !detailData"
        />
        <template v-else>
          <UButton
            label="Simpan"
            icon="i-lucide-save"
            color="primary"
            :loading="saving"
            @click="handleSave"
          />
        </template>
      </div>
    </section>

    <!-- Page Title -->
    <section class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ editMode ? "Edit Pengguna" : "Detail Pengguna" }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{
          editMode
            ? "Ubah informasi pengguna di bawah ini"
            : "Informasi lengkap data pengguna"
        }}
      </p>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <UIcon
        name="i-lucide-loader-circle"
        class="animate-spin text-3xl text-primary-500"
      />
    </div>

    <!-- Content -->
    <div
      v-else-if="detailData"
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      style="height: calc(100vh - 250px)"
    >
      <!-- LEFT: User Information -->
      <div class="lg:col-span-2 space-y-6 overflow-y-scroll scrollbar-none p-2">
        <!-- Personal Info Card -->
        <UCard>
          <template #header>
            <p class="font-semibold text-lg flex items-center gap-2">
              <UIcon name="i-lucide-users" class="size-5 text-primary" />
              Informasi Pribadi
            </p>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- Nama -->
            <UFormField label="Nama Lengkap" name="name" class="sm:col-span-2">
              <UInput
                v-if="editMode"
                v-model="form.name"
                placeholder="Masukkan nama lengkap"
                class="w-full"
              />
              <p
                v-else
                class="text-sm font-medium text-gray-900 dark:text-white mt-1"
              >
                {{ detailData.name || "-" }}
              </p>
            </UFormField>

            <!-- NIK -->
            <UFormField label="NIK" name="nik">
              <UInput
                v-if="editMode"
                v-model="form.nik"
                placeholder="Masukkan NIK"
                class="w-full"
              />
              <p
                v-else
                class="text-sm font-medium text-gray-900 dark:text-white mt-1 font-mono"
              >
                {{ detailData.nik || "-" }}
              </p>
            </UFormField>

            <!-- NIP -->
            <UFormField label="NIP" name="nip" v-if="isOfficer">
              <UInput
                v-if="editMode"
                v-model="form.nip"
                placeholder="Masukkan NIP"
                class="w-full"
              />
              <p
                v-else
                class="text-sm font-medium text-gray-900 dark:text-white mt-1 font-mono"
              >
                {{ detailData.nip || "-" }}
              </p>
            </UFormField>

            <!-- Gender -->
            <UFormField label="Jenis Kelamin" name="gender">
              <USelect
                v-if="editMode"
                v-model="form.gender"
                :items="genderOptions"
                value-key="value"
                label-key="label"
                placeholder="Pilih jenis kelamin"
                class="w-full"
              />
              <p
                v-else
                class="text-sm font-medium text-gray-900 dark:text-white mt-1"
              >
                {{ genderLabel }}
              </p>
            </UFormField>

            <!-- Email -->
            <UFormField label="Email" name="email">
              <UInput
                v-if="editMode"
                v-model="form.email"
                type="email"
                placeholder="Masukkan email"
                class="w-full"
              />
              <p
                v-else
                class="text-sm font-medium text-gray-900 dark:text-white mt-1"
              >
                {{ detailData.email || "-" }}
              </p>
            </UFormField>

            <!-- Phone -->
            <UFormField label="Nomor Telepon" name="phone">
              <UInput
                v-if="editMode"
                v-model="form.phone"
                placeholder="Masukkan nomor telepon"
                class="w-full"
              />
              <p
                v-else
                class="text-sm font-medium text-gray-900 dark:text-white mt-1"
              >
                {{ detailData.phone || "-" }}
              </p>
            </UFormField>

            <!-- Address -->
            <UFormField label="Alamat" name="address" class="sm:col-span-2">
              <UTextarea
                v-if="editMode"
                v-model="form.address"
                placeholder="Masukkan alamat lengkap"
                :rows="3"
                class="w-full"
              />
              <p
                v-else
                class="text-sm font-medium text-gray-900 dark:text-white mt-1"
              >
                {{ detailData.address || "-" }}
              </p>
            </UFormField>
          </div>
        </UCard>

        <!-- Roles Card -->
        <UCard>
          <template #header>
            <p class="font-semibold text-lg flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" class="size-5 text-primary" />
              Peran & Akses
            </p>
          </template>

          <UFormField label="Role Pengguna" name="roles">
            <!-- Edit Mode -->
            <div v-if="editMode" class="space-y-3 mt-1">
              <!-- Selected badges -->
              <div v-if="form.roles.length" class="flex flex-wrap gap-2 mb-3">
                <UBadge
                  v-for="(role, i) in form.roles"
                  :key="i"
                  :label="role.name"
                  color="primary"
                  variant="subtle"
                  class="capitalize"
                >
                  <template #trailing>
                    <UButton
                      icon="i-lucide-x"
                      size="2xs"
                      color="primary"
                      variant="link"
                      class="ml-1 -mr-1"
                      @click="form.roles.splice(i, 1)"
                    />
                  </template>
                </UBadge>
              </div>
              <p v-else class="text-sm text-gray-400">Belum ada role dipilih</p>
              <USelectMenu
                arrow
                multiple
                :items="referenceStore.roles"
                :loading="referenceStore.isLoading('GET_ALL_ROLE')"
                @update:open="getAllRole"
                v-model="form.roles"
                placeholder="Pilih role pengguna..."
                label-key="name"
                class="w-full"
              />
            </div>

            <!-- View Mode -->
            <div v-else class="flex flex-wrap gap-2 mt-1">
              <template v-if="roleNames.length">
                <UBadge
                  v-for="(role, i) in roleNames"
                  :key="i"
                  :label="role"
                  color="primary"
                  variant="subtle"
                  class="capitalize"
                />
              </template>
              <span v-else class="text-sm text-gray-400">Tidak ada role</span>
            </div>
          </UFormField>
        </UCard>

        <!-- Land Office Card -->
        <UCard v-if="isOfficer">
          <template #header>
            <p class="font-semibold text-lg flex items-center gap-2">
              <UIcon name="i-lucide-building-2" class="size-5 text-primary" />
              Kantor Pertanahan
            </p>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- Nama Kantor -->
            <UFormField label="Nama Kantor" class="sm:col-span-2">
              <USelectMenu
                v-if="editMode"
                :items="referenceStore.landOffices"
                :loading="referenceStore.isLoading('GET_ALL_LAND_OFFICE')"
                @update:open="getAllLandOffice()"
                v-model="form.landOffice"
                placeholder="Pilih kantor pertanahan..."
                label-key="name"
                class="w-full"
              />
              <p
                v-else
                class="text-sm font-medium text-gray-900 dark:text-white mt-1"
              >
                {{ detailData.landOffice?.name || "-" }}
              </p>
            </UFormField>

            <UFormField label="Kode Kantor">
              <p
                class="text-sm font-medium text-gray-900 dark:text-white mt-1 font-mono"
              >
                {{
                  form.landOffice?.code || detailData.landOffice?.code || "-"
                }}
              </p>
            </UFormField>

            <UFormField label="Telepon Kantor">
              <p class="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {{
                  form.landOffice?.phone || detailData.landOffice?.phone || "-"
                }}
              </p>
            </UFormField>

            <UFormField label="Provinsi">
              <p class="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {{
                  form.landOffice?.province ||
                  detailData.landOffice?.province ||
                  "-"
                }}
              </p>
            </UFormField>

            <UFormField label="Kota/Kabupaten">
              <p class="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {{
                  form.landOffice?.regency ||
                  detailData.landOffice?.regency ||
                  "-"
                }}
              </p>
            </UFormField>

            <UFormField label="Alamat Kantor" class="sm:col-span-2">
              <p class="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {{
                  form.landOffice?.address ||
                  detailData.landOffice?.address ||
                  "-"
                }}
              </p>
            </UFormField>
          </div>
        </UCard>
      </div>

      <!-- RIGHT: Profile Photo -->
      <div class="lg:col-span-1">
        <UCard class="sticky top-6">
          <template #header>
            <p class="font-semibold text-lg flex items-center gap-2">
              <UIcon name="i-lucide-image" class="size-5 text-primary" />
              Foto Pengguna
            </p>
          </template>

          <div class="flex flex-col items-center gap-4">
            <!-- Avatar / Photo -->
            <div class="relative">
              <UAvatar
                :alt="detailData.name"
                size="3xl"
                class="ring-4 ring-primary-100 dark:ring-primary-900"
                icon="i-lucide-user"
              />
              <UButton
                v-if="editMode"
                icon="i-lucide-camera"
                size="xs"
                color="primary"
                class="absolute bottom-0 right-0"
                :ui="{ base: 'rounded-full' }"
              />
            </div>

            <!-- User Summary -->
            <div class="text-center space-y-1 w-full">
              <p
                class="font-semibold text-gray-900 dark:text-white text-base leading-tight"
              >
                {{ detailData.name }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ detailData.email }}
              </p>
              <div class="flex justify-center flex-wrap gap-1 mt-2">
                <UBadge
                  v-for="(role, i) in roleNames"
                  :key="i"
                  :label="role"
                  color="primary"
                  variant="soft"
                  size="sm"
                  class="capitalize"
                />
              </div>
            </div>

            <UDivider class="w-full" />

            <!-- Quick Info -->
            <div class="w-full space-y-3">
              <div
                v-if="isOfficer"
                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <UIcon name="i-lucide-id-card" class="shrink-0 text-gray-400" />
                <span class="font-mono text-xs truncate">{{
                  detailData.nip || "-"
                }}</span>
              </div>
              <div
                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <UIcon name="i-lucide-phone" class="shrink-0 text-gray-400" />
                <span>{{ detailData.phone || "-" }}</span>
              </div>
              <div
                v-if="isOfficer"
                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <UIcon
                  name="i-lucide-building-2"
                  class="shrink-0 text-gray-400"
                />
                <span class="truncate">{{
                  detailData.landOffice?.code || "-"
                }}</span>
              </div>
              <div
                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <UIcon
                  name="i-lucide-venus-and-mars"
                  class="shrink-0 text-gray-400"
                />
                <span>{{ genderLabel }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-24 gap-3 text-center"
    >
      <UIcon
        name="i-lucide-user-x"
        class="text-4xl text-gray-300 dark:text-gray-600"
      />
      <p class="text-gray-500 dark:text-gray-400 text-sm">
        Data pengguna tidak ditemukan
      </p>
      <UButton
        label="Kembali"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.back()"
      />
    </div>
  </div>
</template>
