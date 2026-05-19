import { defineStore } from "pinia";
import { ref } from "vue";

export const useIPFSStore = defineStore("ipfs", () => {
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

  const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

  const getMetadata = async (cid: string) => {
    try {
      startLoading("FETCH_METADATA");

      const res = await fetch(`${PINATA_GATEWAY}/ipfs/${cid}/metadata.json`);

      if (!res.ok) {
        throw new Error("Gagal fetch metadata");
      }

      const data = await res.json();

      return data;
    } catch (error) {
      console.log(error);
    } finally {
      stopLoading("FETCH_METADATA");
    }
  };

  const getEncryptedFile = async (cid: string, code: string) => {
    try {
      startLoading("FETCH_FILE");

      const res = await fetch(`${PINATA_GATEWAY}/ipfs/${cid}/${code}.pdf`);

      if (!res.ok) {
        throw new Error("Gagal fetch file");
      }

      const buffer = await res.arrayBuffer();

      return buffer;
    } catch (error) {
      console.log(error);
    } finally {
      stopLoading("FETCH_FILE");
    }
  };
  return {
    isLoading,
    getMetadata,
    getEncryptedFile,
  };
});
