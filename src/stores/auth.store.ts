import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useApi, useApiPrivate } from "../composables/useApi";
import type { PersonCreate, User } from "../types/domain/person.type";
import { signLoginMessage } from "../lib/signMessage";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<User | null>(null);
    const address = ref<`0x${string}` | null>(null);
    const chainId = ref<string | null>(null);
    const loadArr = ref<string[]>([]);
    const privileges = ref<Record<string, boolean>>({});

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
      set(newValue: User) {
        user.value = newValue;
      },
    });

    const canAccess = (module: string, action: string): boolean => {
      return privileges.value[`${module}.${action}`] ?? false;
    };

    const isLoading = (key: string): boolean => loadArr.value.includes(key);

    const fetchPrivileges = async () => {
      const { data } = await useApiPrivate().get("/privilege/my-privileges");

      for (const section of data.data) {
        for (const mod of section.modules) {
          for (const [action, allowed] of Object.entries(mod.privileges)) {
            privileges.value[`${mod.module_slug}.${action}`] =
              allowed as boolean;
          }
        }
      }
    };

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
      try {
        const { data } = await useApiPrivate().post("/auth/logout", {});
        if (data) {
          user.value = null;
          privileges.value = {};
        }
      } catch (error) {
        throw error;
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
      try {
        const { data } = await useApi().post("/auth/wallet/nonce", {
          walletAddress,
        });
        return {
          message: data.message,
          nonce: data.nonce,
        };
      } catch (error: any) {
        return {
          message: error.response.data?.message,
          data: null,
        };
      }
    };

    const verifyWalletLogin = async (
      walletAddress: string,
      signature: string,
    ) => {
      try {
        const { data } = await useApi().post("/auth/wallet/verify", {
          walletAddress,
          signature,
        });

        return {
          status: "success",
          message: data.message,
          data: data.valid,
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.response.data?.message,
          data: null,
        };
      }
    };

    const connectMetaMask = async (provider: any) => {
      try {
        startLoading("CONNECT_WALLET");

        if (!provider) {
          throw new Error("MetaMask provider tidak ditemukan");
        }

        // 1. SOLUSI UTAMA: Paksa MetaMask memunculkan pop-up pilihan akun untuk sinkronisasi
        await provider.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });

        // 2. Ambil alamat akun yang baru saja dipilih/diizinkan oleh user
        const addresses = (await provider.request({
          method: "eth_accounts",
        })) as string[];

        address.value = addresses?.[0]! as `0x${string}`;

        if (!address.value) {
          throw new Error("Wallet tidak terhubung");
        }

        // 3. Ambil nonce dari backend menggunakan alamat yang valid & aktif
        const { message, nonce } = await requestWalletNonce(address.value);

        if (!nonce) {
          return {
            status: "error",
            message,
          };
        }

        // 4. PERBAIKAN: Kirim walletAddress ke fungsi sign agar viem mereferensikan akun yang tepat
        const signature = await signLoginMessage(message, address.value);

        // 5. Kirim data ke backend untuk diverifikasi
        const { status, message: verifyMessage } = await verifyWalletLogin(
          address.value,
          signature,
        );

        return {
          status,
          message: verifyMessage,
        };
      } catch (err: any) {
        console.log(err);
        return {
          status: "error",
          message: err.message || "Gagal login dengan Metamask",
        };
      } finally {
        stopLoading("CONNECT_WALLET");
      }
    };

    return {
      user,
      chainId,
      address,
      privileges,
      isAuthenticated,
      isMetaMaskSupported,
      canAccess,
      isLoading,
      connectMetaMask,
      attempt,
      login,
      register,
      logout,
      refresh,
      fetchPrivileges,
    };
  },
  {
    persist: {
      pick: ["address", "chainId"],
    },
  },
);
