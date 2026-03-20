export const peralihanHakRoutes = [
  {
    path: "/peralihan-hak",
    name: "peralihan-hak",
    component: () => import("../views/peralihan-hak/PeralihanHak.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/peralihan-hak/form",
    name: "form-peralihan-hak",
    component: () => import("../views/peralihan-hak/FormPermohonan.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/peralihan-hak/konfirmasi",
    name: "konfirmasi-peralihan-hak",
    component: () => import("../views/peralihan-hak/Confirmation.vue"),
    meta: { requiresAuth: true },
  }
];
