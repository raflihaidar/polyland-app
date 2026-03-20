import { defineStore } from "pinia";
import { ref } from "vue";
import { useApiPrivate } from "../composables/useApi";
import type { VerificationAccountCreate } from "../types/domain/account.type";

export const useAccountStore = defineStore(
  "account",
  () => {
    const isAccountVerified = ref('')
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

    const checkAccount = async () => {
      try {
        startLoading("CHECK_ACCOUNT");
        const { data } = await useApiPrivate().get("/verification-account/check-account");
        isAccountVerified.value = data.data
        return {
          status: data.data,
          message: data.message,
        };
      } catch (err: any) {
        return {
          status: err.response.data.status || "error",
          message:
            err.response.data.message ||
            "Terjadi kesalahan saat pengecekan status akun, silahkan coba lagi",
        };
      } finally {
        stopLoading("CHECK_ACCOUNT");
      }
    }

    const submitVerification = async (payload: VerificationAccountCreate) => {
      try {
        startLoading("SUBMIT_VERIFICATION");
        const { data } = await useApiPrivate().post("/verification-account/submit", payload);
        return {
          status: data.status,
          message: data.message,
        };
      } catch (err: any) {
        return {
          status: err.response.data.status || "error",
          message:
            err.response.data.message ||
            "Terjadi kesalahan saat login, silahkan coba lagi",
        };
      } finally {
        stopLoading("SUBMIT_VERIFICATION");
      }
    };

    return {
      isAccountVerified,
      isLoading,
      checkAccount,
      submitVerification,
    };
  },
);
