<script setup lang="ts">
import { computed } from "vue";
import { fileLabels, docTypeToLabel } from "@/types";
import { getFileUrl } from "@/utils/file";

const props = defineProps<{
  editMode: boolean;
  detailData?: any;
}>();

const files = defineModel<Record<string, File | null>>("files", {
  required: true,
});

const handleFileChange = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  files.value[key] = target.files?.[0] ?? null;
};

const sharedDocs = computed(
  () => props.detailData?.document?.filter((d: any) => !d.person_id) ?? [],
);
</script>

<template>
  <div class="border border-default rounded-xl overflow-hidden">
    <div class="bg-elevated/50 px-6 py-4 border-b border-default">
      <p class="font-semibold text-sm flex items-center gap-2">
        <UIcon name="i-lucide-paperclip" class="size-4 text-primary" />
        Dokumen Pendukung
      </p>
      <p class="text-xs text-muted mt-0.5">
        <template v-if="editMode">
          Upload file baru hanya jika ingin mengganti dokumen yang sudah ada.
          Format: JPG, PNG, PDF. Maks. 5MB per file.
        </template>
        <template v-else> Format: JPG, PNG, PDF. Maks. 5MB per file. </template>
      </p>
    </div>

    <!-- Edit mode: show existing shared docs -->
    <div
      v-if="editMode && sharedDocs.length"
      class="px-6 pt-5 grid grid-cols-2 md:grid-cols-3 gap-3"
    >
      <a
        v-for="doc in sharedDocs"
        :key="doc.id"
        :href="getFileUrl(doc.fileUrl)"
        target="_blank"
        class="flex items-center gap-3 p-3 border border-default rounded-lg hover:bg-elevated/50 transition-colors group"
      >
        <div
          class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
        >
          <UIcon name="i-lucide-file-text" class="size-4 text-primary" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium truncate">
            {{ docTypeToLabel[doc.type] ?? doc.type }}
          </p>
          <p class="text-xs text-muted truncate">{{ doc.fileName }}</p>
        </div>
        <UIcon
          name="i-lucide-external-link"
          class="size-3.5 text-muted group-hover:text-primary transition-colors shrink-0"
        />
      </a>
    </div>

    <div class="p-6 grid grid-cols-3 gap-4">
      <div
        v-for="(label, key) in fileLabels"
        :key="key"
        class="flex flex-col gap-1.5"
      >
        <label class="text-sm font-medium">
          {{ label }}
          <span v-if="!editMode" class="text-red-500">*</span>
          <span v-else class="text-muted text-xs">(opsional)</span>
        </label>
        <UInput
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          @change="handleFileChange(key, $event)"
        />
      </div>
    </div>
  </div>
</template>
