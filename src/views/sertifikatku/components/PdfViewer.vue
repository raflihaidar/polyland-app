<script setup lang="ts">
import { VPdfViewer } from "@vue-pdf-viewer/viewer";

defineProps<{
  pdfUrl: string;
}>();
</script>

<template>
  <VPdfViewer
    :toolbar-options="{
      sidebarEnable: false,
      themeSwitchable: false,
      newFileOpenable: false,
      downloadable: true,
      printable: false,
      fullscreen: false,
      searchable: false,
      commentPanelEnabled: false,
      rotatable: false,
      navigatable: false,
    }"
    :src="pdfUrl"
  />
</template>
