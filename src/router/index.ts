import { createRouter, createWebHistory } from "vue-router";
import { storeToRefs } from "pinia";

import { useAuthStore } from "@/stores/auth.store";

import { guestRoutes } from "./Guest.route";
import { cariBerkasRoutes } from "./CariBerkas.route";
import { profilRoutes } from "./Profil.route";
import { sertifikatRoutes } from "./Sertifikat.route";
import { verifikasiAkunRoutes } from "./VerifikasiAkun.route";
import { antrianOnlineRoutes, adminAntrianOnline } from "./AntrianOnline.route";
import { peralihanHakRoutes } from "./PeralihanHak.route";
import { hakAksesRoutes } from "./HakAkses.route";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/Mobile.vue"),
    meta: {
      publicOnly: true,
    },
    children: [
      {
        path: "",
        name: "public.home",
        component: () => import("@/views/Home.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "scan-qr",
        name: "public.scan-qr",
        component: () => import("@/views/ScanQR.vue"),
        meta: { requiresAuth: false, title: "Scan QR" },
      },
      {
        path: "verify/certificate/:tokenId",
        name: "public.verify-certificate",
        component: () => import("@/views/VerifyResult.vue"),
        meta: { requiresAuth: false },
      },
      ...cariBerkasRoutes,
      ...profilRoutes,
      ...sertifikatRoutes,
      ...verifikasiAkunRoutes,
      ...antrianOnlineRoutes,
    ],
  },

  {
    path: "/",
    component: () => import("@/layouts/Mobile.vue"),
    children: [...guestRoutes],
  },

  {
    path: "/admin",
    component: () => import("@/layouts/Default.vue"),
    redirect: {
      name: "admin.dashboard",
    },
    meta: {
      requiresAuth: true,
      title: "Dashboard",
      roles: [
        "admin aplikasi",
        "kepala kanwil",
        "admin kanwil",
        "kepala kantah",
        "admin kantah",
      ],
    },

    children: [
      {
        path: "dashboard",
        name: "admin.dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: { requiresAuth: true },
      },
      ...adminAntrianOnline,
      ...peralihanHakRoutes,
      ...hakAksesRoutes,
    ],
  },
  {
    path: "/forbidden",
    name: "forbidden",
    component: () => import("@/views/errors/Forbidden.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/errors/NotFound.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeResolve(async (to, from, next) => {
  const authStore = useAuthStore();

  const { isAuthenticated, user } = storeToRefs(authStore);

  try {
    // =====================================
    // CHECK SESSION
    // =====================================
    if (to.meta.requiresAuth && !isAuthenticated.value) {
      await authStore.attempt();
    }
  } catch (error) {
    await authStore.logout();

    return next({
      name: "login",
      query: {
        session: "expired",
      },
    });
  }

  // =====================================
  // NOT AUTHENTICATED
  // =====================================
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next({
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    });
  }

  // =====================================
  // ROLE CHECKING
  // =====================================
  if (to.meta.roles) {
    const allowedRoles = to.meta.roles as string[];

    const userRoles = user.value?.roles || [];

    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return next({
        name: "public.home",
      });
    }
  }

  // =====================================
  // PRIVILEGE CHECKING
  // =====================================

  if (to.meta.privilege && isAuthenticated.value) {
    // fetch privilege sekali saja, kalau sudah ada skip
    if (Object.keys(authStore.privileges).length === 0) {
      await authStore.fetchPrivileges();
    }

    const privilege = to.meta.privilege as
      | string
      | { module: string; action: string | string[] };

    const module = typeof privilege === "string" ? privilege : privilege.module;
    const action = typeof privilege === "string" ? "read" : privilege.action;

    const hasAccess = Array.isArray(action)
      ? action.some((a) => authStore.canAccess(module, a))
      : authStore.canAccess(module, action);

    if (!hasAccess) return next({ name: "forbidden" });
  }

  // =====================================
  // PREVENT LOGIN ACCESS
  // =====================================
  if (
    isAuthenticated.value &&
    (to.name === "login" || to.name === "register")
  ) {
    const adminRoles = ["admin kantah", "kepala kantah"];

    const userRoles = user.value?.roles || [];
    const isAdmin = userRoles.some((role) => adminRoles.includes(role));

    if (isAdmin) {
      return next({
        name: "admin.dashboard",
      });
    }

    return next({
      name: "public.home",
    });
  }

  // =====================================
  // PREVENT ADMIN ACCESS PUBLIC ROUTES
  // =====================================

  if (to.meta.publicOnly) {
    const ADMIN_ROLES = ["admin kantah", "kepala kantah"];
    const userRoles = user.value?.roles || [];

    const isAdmin = userRoles.some((role) => ADMIN_ROLES.includes(role));

    if (isAdmin) {
      return next({
        name: "admin.dashboard",
      });
    }
  }

  next();
});
