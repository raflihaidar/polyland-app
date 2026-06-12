<script lang="ts" setup>
interface ConfirmDialogProps {
  title?: string;
  description?: string;
}

defineProps<ConfirmDialogProps>();

const emits = defineEmits<{
  close: [value: boolean];
}>();
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="emits('close', false)"
      />
      <UButton label="Confirm" color="primary" @click="emits('close', true)" />
    </template>
  </UModal>
</template>
