import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useApi, useApiPrivate } from "@/composables/useApi";
import type { PersonCreate, User } from "@/types";
import { walletClient } from "../lib/walletClient";
import { signLoginMessage } from "../lib/signMessage";
import type { ApplicationCreate, ApplicationData } from "@/types";

export const useApplicationStore = defineStore(
  "application",
  () => {
    const applicationList = ref<User | null>(null);
    const detailBerkas = ref<ApplicationData | null>(null)
    const loadArr = ref<string[]>([]);

    const startLoading = (key: string) => {
      if (!loadArr.value.includes(key)) {
        loadArr.value.push(key);
      }
    };

    const stopLoading = (key: string) => {
      loadArr.value = loadArr.value.filter((i) => i !== key);
    };

    const isLoading = (key: string): boolean => loadArr.value.includes(key);

    const submitApplication = async (payload: FormData) => {
      try {
        startLoading("SUBMIT");
        const { data } = await useApiPrivate().post("/ownership-transfer/submit", payload);
        return {
          status: data.status,
          message: data.message,
          data : data.fileNumber
        };
      } catch (err: any) {
        return {
          status: err.response.data.status || "error",
          message:
            err.response.data.message ||
            "Terjadi kesalahan saat mengirim permohonan, silahkan coba lagi",
        };
      } finally {
        stopLoading("SUBMIT");
      }
    };

    const searchApplication = async (fileNumber : string) => {
      try {
        startLoading("SEARCH");
        const { data } = await useApiPrivate().get(`/ownership-transfer?fileNumber=${fileNumber}`);
        detailBerkas.value = data.data
        return {
          status: data.status,
          message: data.message,
        };
      } catch (err: any) {
        return {
          status: err.response.data.status || "error",
          message:
            err.response.data.message ||
            "Terjadi kesalahan saat mengirim permohonan, silahkan coba lagi",
          data : null
        };
      } finally {
        stopLoading("SEARCH");
      }
    }

    return {
      applicationList,
      detailBerkas,
      isLoading,
      searchApplication,
      submitApplication
    };
  }
);
