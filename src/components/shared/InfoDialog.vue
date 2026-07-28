<script lang="ts" setup>
import { computed } from "vue";

type InfoDialogType = "info" | "success" | "warning" | "error";

interface InfoDialogProps {
  title?: string;
  description?: string;
  okLabel?: string;
  type?: InfoDialogType;
}

const props = withDefaults(defineProps<InfoDialogProps>(), {
  okLabel: "OK",
  type: "info",
});

const emits = defineEmits<{
  close: [value: boolean];
}>();

const iconMap: Record<InfoDialogType, string> = {
  info: "i-lucide-info",
  success: "i-lucide-circle-check",
  warning: "i-lucide-triangle-alert",
  error: "i-lucide-circle-x",
};

const colorMap: Record<InfoDialogType, string> = {
  info: "primary",
  success: "success",
  warning: "warning",
  error: "error",
};

const icon = computed(() => iconMap[props.type]);
const color = computed(() => colorMap[props.type]);
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #header="{ close }">
      <div class="flex flex-col items-center gap-2">
        <UIcon :name="icon" class="size-16" :class="`text-${color}-500`" />
        <div class="flex flex-col text-center">
          <h3 class="font-semibold">{{ title }}</h3>
          <p v-if="description" class="text-sm text-muted">{{ description }}</p>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        :label="okLabel"
        block
        :color="color"
        @click="emits('close', true)"
      />
    </template>
  </UModal>
</template>
