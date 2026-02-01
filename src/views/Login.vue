<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "../store/auth.store"
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const error = ref<string | null>(null);

const store = useAuthStore()
const { isAuthenticated, isMetaMaskSupported } = storeToRefs(store)

const router = useRouter()

const connect = async (): Promise<void> => {
  await store.connectMetaMask()

  if (isAuthenticated) router.push('/')
}

onMounted(() => {
  store.attempt();
});
</script>


<template>
  <div class="m-0 flex place-items-center justify-center min-h-screen">
    <div>
      <section v-if="store.isLoading('AUTH_CHECK')">Loading...</section>
      <section v-else>
        <h1 class="text-5xl font-bold mb-10">Login Polyland</h1>

        <div v-if="!isAuthenticated">
          <button v-if="isMetaMaskSupported" @click="connect"
            class="rounded-lg border border-transparent px-5 py-2 text-base font-medium bg-[#1a1a1a] text-white cursor-pointer transition duration-200 hover:border-[#646cff] w-full">
            Connect MetaMask
          </button>


          <p v-else class="text-3xl font-semibold">
            Install Metamask extension
          </p>

          <p v-if="error" class="text-red-500 mt-4 text-sm">{{ error }}</p>
        </div>
      </section>
    </div>
  </div>
</template>
