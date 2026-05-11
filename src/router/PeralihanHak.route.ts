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
];
