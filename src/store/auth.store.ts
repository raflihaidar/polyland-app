import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {POLYGON_AMOY} from "../lib/chains"

export const useAuthStore = defineStore('auth', () => {
    const address = ref<string | null>(null)
    const chainId = ref<string | null>(null)
    const loadArr = ref<string[]>([])
    const error = ref<string | null>(null)

    const isMetaMaskSupported = computed(() => typeof (window as any).ethereum !== "undefined")

    const isAuthenticated = computed({
        get(){
            return address.value
        },
        set(newValue : string){
            address.value = newValue
        }
    })

    const isLoading = (key : string) :boolean => loadArr.value.includes(key)

    async function connectMetaMask() {
        error.value = null;
      
        try {
          if (!isMetaMaskSupported) {
            error.value = "MetaMask belum terinstall.";
            return;
          }
      
          // Request wallet
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
      
          address.value = accounts[0];
      
          // Ambil chain ID
          const currentChain = await window.ethereum.request({
            method: "eth_chainId",
          });

          chainId.value = currentChain;
      
          if (currentChain !== POLYGON_AMOY.chainId) {
            error.value = "Jaringan salah. Silakan pindah ke Polygon Amoy.";
          }
        } catch (err: any) {
          console.log(err)
          error.value = err.message;
        }
      }
      
      async function attempt() {
        loadArr.value.push('AUTH_CHECK')
        if (!isMetaMaskSupported || !isAuthenticated) {
            loadArr.value.splice(loadArr.value.indexOf('AUTH_CHECK'), 1);
            return
        }
              
        try {
          // Cek apakah MetaMask masih memberi izin
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
      
          if (accounts.length > 0) {
            address.value = accounts[0];
          } else {
            localStorage.removeItem("wallet");
          }
        } catch (e) {
          console.log("Auto login error:", e);
        } finally {
          loadArr.value.splice(loadArr.value.indexOf('AUTH_CHECK'), 1);
        }
      }

    return {
        chainId,
        address,
        isAuthenticated,
        isMetaMaskSupported,
        isLoading,
        connectMetaMask,
        attempt
    }
}, 
{
    persist: {
        pick: ['address', 'chainId'],
    },
})