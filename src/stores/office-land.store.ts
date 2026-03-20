import { defineStore } from "pinia";
import { ref } from "vue";
import { useApiPrivate } from "@/composables/useApi";
import type { OfficeLand, Meta } from "@/types";

export const useOfficeLandStore = defineStore(
    "office-land",
    () => {
        const offices = ref<OfficeLand[]>([])
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

        const getAll = async (meta: Meta = {page : 1, limit : 10, search : ""}) => {
            try {
                startLoading("FETCH");
                const { data } = await useApiPrivate().get(`/land-office?page=${meta.page}&limit=${meta.limit}&search=${meta.search}`);
                offices.value = data.data ?? []
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

        return {
            offices,
            getAll,
            isLoading,
        };
    },
);
