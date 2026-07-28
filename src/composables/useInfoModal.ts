import { useOverlay } from "@nuxt/ui/runtime/composables/useOverlay.js";
import InfoDialog from "@/components/shared/InfoDialog.vue";

export type InfoDialogType = "info" | "success" | "warning" | "error";

export interface InfoDialogOptions {
  title: string;
  description?: string;
  okLabel?: string;
  type?: InfoDialogType;
}

export const useInfoDialog = () => {
  const overlay = useOverlay();

  return (options: InfoDialogOptions): Promise<boolean> => {
    const modal = overlay.create(InfoDialog, {
      destroyOnClose: true,
      props: options,
    });

    return modal.open();
  };
};
