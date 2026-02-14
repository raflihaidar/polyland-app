import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useApi, useApiPrivate } from "../composables/useApi";
import type { PersonCreate } from "../types/domain/person.type";
import { walletClient } from "../lib/walletClient";
import { signLoginMessage } from "../lib/signMessage";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<any | null>(null);
    const address = ref<string | null>(null);
    const chainId = ref<string | null>(null);
    const loadArr = ref<string[]>([]);

    const isMetaMaskSupported = computed(
      () => typeof (window as any).ethereum !== "undefined",
    );

    const startLoading = (key: string) => {
      if (!loadArr.value.includes(key)) {
        loadArr.value.push(key);
      }
    };

    const stopLoading = (key: string) => {
      loadArr.value = loadArr.value.filter((i) => i !== key);
    };

    const isAuthenticated = computed({
      get() {
        return user.value !== null;
      },
      set(newValue: string) {
        user.value = newValue;
      },
    });

    const isLoading = (key: string): boolean => loadArr.value.includes(key);

    const login = async (payload: { email: string; password: string }) => {
      try {
        startLoading("LOGIN");
        const { data } = await useApi().post("/auth/login", payload);
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
        stopLoading("LOGIN");
      }
    };

    const register = async (payload: PersonCreate) => {
      try {
        startLoading("REGISTER");
        const { data } = await useApi().post("/auth/register", payload);
        return {
          status: data.status,
          message: data.message,
        };
      } catch (err: any) {
        return {
          status: err.response.data.status || "error",
          message:
            err.response.data.message ||
            "Terjadi kesalahan saat register, silahkan coba lagi",
        };
      } finally {
        stopLoading("REGISTER");
      }
    };

    const logout = async () => {
      const { data } = await useApi().get("/auth/logout", {});
      if (data) {
        user.value = null;
      }
    };

    const attempt = async () => {
      try {
        const { data } = await useApiPrivate().get("/auth/me");
        user.value = data.data;
      } catch (err: any) {
        user.value = null;
        throw err;
      }
    };

    const refresh = async () => {
      try {
        const { data } = await useApiPrivate().get("/auth/refresh");
        user.value = data.data;
      } catch (err: any) {
        user.value = null;
        throw err;
      }
    };

    const requestWalletNonce = async (walletAddress: string) => {
      const { data } = await useApi().post("/auth/wallet/nonce", {
        walletAddress,
      });
      return {
        message: data.message,
      };
    };

    const verifyWalletLogin = async (
      walletAddress: string,
      signature: string,
    ) => {
      const { data } = await useApi().post("/auth/wallet/verify", {
        walletAddress,
        signature,
      });

      return data;
    };

    const connectMetaMask = async () => {
      try {
        startLoading("CONNECT_WALLET");
        const addresses = await walletClient.requestAddresses();
        const walletAddress = addresses[0];

        if (!walletAddress) {
          throw new Error("Wallet not connected");
        }

        const { message } = await requestWalletNonce(walletAddress);

        const signature = await signLoginMessage(message);

        const { data } = await verifyWalletLogin(walletAddress, signature);

        return {
          status: data.success,
          message: data.message,
        };
      } catch (err: any) {
        console.log(err);
        // return {
        //   status: err.response.data.status || "error",
        //   message:
        //     err.response.data.message ||
        //     "Terjadi kesalahan saat terhubung ke wallet, silahkan coba lagi",
        // };
      } finally {
        stopLoading("CONNECT_WALLET");
      }
    };

    return {
      user,
      chainId,
      address,
      isAuthenticated,
      isMetaMaskSupported,
      isLoading,
      connectMetaMask,
      attempt,
      login,
      register,
      logout,
      refresh,
    };
  },
  {
    persist: {
      pick: ["address", "chainId"],
    },
  },
);
