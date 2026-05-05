import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

import { guestRoutes } from "./Guest.route";
import { aktaRoutes } from "./Akta.route";
import { cariBerkasRoutes } from "./CariBerkas.route";
import { profilRoutes } from "./Profil.route";
import { sertifikatRoutes } from "./Sertifikat.route";
import { verifikasiAkunRoutes } from "./VerifikasiAkun.route";
import { antrianOnlineRoutes } from "./AntrianOnline.route";
import { storeToRefs } from "pinia";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
    meta: { requiresAuth: true },
  },
  ...guestRoutes,
  ...aktaRoutes,
  ...cariBerkasRoutes,
  ...profilRoutes,
  ...sertifikatRoutes,
  ...verifikasiAkunRoutes,
  ...antrianOnlineRoutes,
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeResolve(async (to, from, next) => {
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);

  try {
    if (to.meta.requiresAuth && !isAuthenticated.value) {
      await authStore.attempt();
    }
  } catch (error) {
    await authStore.logout();

    return next({
      name: "login",
      query: { session: "expired" },
    });
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

  if (!to.meta.requiresAuth && isAuthenticated.value) {
    return next({ name: "home" });
  }

  return next();
});
