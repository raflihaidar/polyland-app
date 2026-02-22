import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

import { guestRoutes } from "./guest.route";
import { authRoutes } from "./auth.route";
import { storeToRefs } from "pinia";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: { requiresAuth: true },
  },
  ...guestRoutes,
  ...authRoutes,
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
      name: "Login",
      query: { session: "expired" },
    });
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
  }

  if (!to.meta.requiresAuth && isAuthenticated.value) {
    return next({ name: "Dashboard" });
  }

  return next();
});
