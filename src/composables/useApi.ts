import { storeToRefs } from "pinia";
import { axiosInstance, axiosPrivateInstance } from "../lib/axios";
import { useAuthStore } from "../stores/auth.store";
import { useRouter } from "vue-router";

export function useApiPrivate() {
  const store = useAuthStore();
  const { user } = storeToRefs(store);
  const router = useRouter();

  axiosPrivateInstance.interceptors.request.use(
    (config) => {
      config.withCredentials = true;
      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosPrivateInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await store.refresh();
          axiosPrivateInstance(originalRequest);
        } catch (error: unknown) {
          user.value = null;
          router.push("/login");
          return Promise.reject(error);
        }
      }
    },
  );

  return axiosPrivateInstance;
}

export const useApi = () => {
  return axiosInstance;
};
