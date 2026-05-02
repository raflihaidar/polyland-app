import { defineStore } from "pinia";
import { ref } from "vue";
import { useApiPrivate } from "@/composables/useApi";
import type { Certificate, Meta } from "@/types";

export const useCertificateStore = defineStore("certificate", () => {
  const certificates = ref<Certificate[]>([]);
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

  const getAll = async (meta: Meta = { page: 1, limit: 10, search: "" }) => {
    try {
      startLoading("FETCH");
      const { data } = await useApiPrivate().get(
        `/certificate?page=${meta.page}&limit=${meta.limit}&search=${meta.search}`,
      );
      certificates.value = data.data ?? [];
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
      stopLoading("FETCH");
    }
  };

  const getDetailCertificate = async (id: string) => {
    try {
      startLoading("FETCH_DETAIL");
      const { data } = await useApiPrivate().get(`/certificate/${id}`);
      certificates.value = data.data ?? [];
      return {
        status: data.status,
        message: data.message,
        data: data.data,
      };
    } catch (err: any) {
      return {
        status: err.response.data.status || "error",
        message:
          err.response.data.message ||
          "Terjadi kesalahan saat login, silahkan coba lagi",
      };
    } finally {
      stopLoading("FETCH_DETAIL");
    }
  };

  return {
    loadArr,
    certificates,
    getAll,
    getDetailCertificate,
    isLoading,
  };
});
