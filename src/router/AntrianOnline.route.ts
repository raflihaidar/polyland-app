export const antrianOnlineRoutes = [
  {
    path: "/antrian-online",
    name: "antrian-online",
    component: () => import("../views/antrian-online/AntrianDaring.vue"),
    meta: { requiresAuth: true },
  },
  // {
  //   path: "/peralihan-hak/form",
  //   name: "form-peralihan-hak",
  //   component: () => import("../views/peralihan-hak/FormPermohonan.vue"),
  //   meta: { requiresAuth: true },
  // },
  // {
  //   path: "/peralihan-hak/konfirmasi",
  //   name: "konfirmasi-peralihan-hak",
  //   component: () => import("../views/peralihan-hak/Confirmation.vue"),
  //   meta: { requiresAuth: true },
  // },
];
