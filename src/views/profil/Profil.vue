<script setup lang="ts">
import { useApiPrivate } from "@/composables/useApi";
import { ref, provide } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";


provide("head-title", "Profil");
const toast = useToast();
const isLoading = ref<boolean>(false)
const router = useRouter()
const modalInfo = ref<{status : boolean, message : string}>({
  status : false,
  message : ''
})

const logout = async () => {
  try {
    isLoading.value = true
    const response = await useApiPrivate().get('/auth/logout')

    if(response.data.status === 'success') router.push('/login')
  } catch (error) {
    console.log(error)
    toast.add({
        title: 'Logout Gagal, silahkan coba lagi',
        color: "error",
      });
  }finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section>
    <div class="">
      <img src="" alt="">
    </div>
    <!-- <div>
      <h3 class="font-medium">Tentang</h3>
    </div> -->
    <div class="bg-white p-5 rounded-2xl mt-5">
      <h3 class="font-medium">Akun</h3>
      <ul>
        <li class="py-3 border-b border-slate-300 cursor-pointer">
          Akun dan Keamanan
        </li>
        <li class="py-3 border-b border-slate-300 cursor-pointer" @click="logout">
          <span class="text-red-500">
          Keluar
          </span>
        </li>
      </ul>
    </div>
  </section>

  <!-- <UModal v-model:open="modalInfo.status">
    <template #content>
      <Placeholder class="h-48 m-4" />
    </template>
  </UModal> -->
</template>
