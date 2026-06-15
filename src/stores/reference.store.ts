import { defineStore } from "pinia";
import { ref } from "vue";
import { useApiPrivate } from "@/composables/useApi";
import type { LandOffice, Role } from "@/types";

export const useReferenceStore = defineStore("referenceData", () => {
  const roles = ref<Role[] | null>(null);
  const landOffices = ref<LandOffice | null>(null);
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

  const getAllRole = async (
    search: string = "",
    page: number = 1,
    limit: number = 10000,
  ) => {
    try {
      startLoading("GET_ALL_ROLE");
      const { data } = await useApiPrivate().get(
        `/reference/role?page=${page}&limit=${limit}&search=${search}`,
      );
      roles.value = data.data.roles;
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
          "Terjadi kesalahan saat mendapatkan data role, silahkan coba lagi",
        data: null,
      };
    } finally {
      stopLoading("GET_ALL_ROLE");
    }
  };

  const getAllLandOffice = async (
    search: string = "",
    page: number = 1,
    limit: number = 10000,
  ) => {
    try {
      startLoading("GET_ALL_LAND_OFFICE");
      const { data } = await useApiPrivate().get(
        `/land-office?page=${page}&limit=${limit}&search=${search}`,
      );
      landOffices.value = data.data;
      return {
        status: data.status,
        message: data.message,
      };
    } catch (err: any) {
      return {
        status: err.response.data.status || "error",
        message:
          err.response.data.message ||
          "Terjadi kesalahan saat mendapatkan data kantor pertanahan, silahkan coba lagi",
        data: null,
      };
    } finally {
      stopLoading("GET_ALL_LAND_OFFICE");
    }
  };

  return {
    roles,
    landOffices,
    isLoading,
    getAllRole,
    getAllLandOffice,
  };
});
