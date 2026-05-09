import { defineStore } from "pinia";
import { ref } from "vue";
import { useApiPrivate } from "@/composables/useApi";
// import type { Certificate, Meta } from "@/types";

export const useOnlineQueueStore = defineStore("online-queue", () => {
  const loket = ref<any[]>([]);
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

  const getLoketByOfficeId = async (officeId: string) => {
    try {
      startLoading("FETCH");
      const { data } = await useApiPrivate().get(
        `/loket?office_id=${officeId}`,
      );
      loket.value = data.data ?? [];
      return {
        status: data.status,
        message: data.message,
      };
    } catch (err: any) {
      return {
        status: err.response.data.status || "error",
        message:
          err.response.data.message ||
          "Terjadi kesalahan saat mengambil data, silahkan coba lagi",
      };
    } finally {
      stopLoading("FETCH");
    }
  };

  const createQueue = async (loketId: string, date: Date) => {
    try {
      startLoading("CREATE_QUEUE");
      const { data } = await useApiPrivate().post(`/queue/${loketId}`, {
        date,
      });

      return {
        status: data.status,
        message: data.message,
        data: data.data,
      };
    } catch (error: any) {
      return {
        status: error.response.data.status,
        message: error.response.data.message,
      };
    } finally {
      stopLoading("CREATE_QUEUE");
    }
  };

  return {
    loadArr,
    loket,
    getLoketByOfficeId,
    createQueue,
    isLoading,
  };
});
