import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "../store/auth.store";

import { guestRoutes } from "./guest.route";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: { requiresAuth: true },
  },
  ...guestRoutes,
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const store = useAuthStore();
  if (!store.isAuthenticated && to.meta.requiresAuth) {
    return { name: "Login" };
  }
});
