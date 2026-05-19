export const peralihanHakRoutes = [
  {
    path: "peralihan-hak/dashboard",
    name: "peralihan-hak.dashboard",
    component: () => import("@/views/peralihan-hak/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "peralihan-hak/list-permohonan",
    name: "peralihan-hak.list-permohonan",
    component: () => import("@/views/peralihan-hak/PermohonanList.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "peralihan-hak/create",
    name: "peralihan-hak.create",
    component: () => import("@/views/peralihan-hak/BuatPermohonan.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "peralihan-hak/permohonan/:id",
    name: "peralihan-hak.detail",
    component: () => import("@/views/peralihan-hak/BuatPermohonan.vue"),
    meta: { requiresAuth: true },
  },
];
