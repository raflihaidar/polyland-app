export const authRoutes = [
  {
    path: "/peralihan-hak",
    name: "Peralihan Hak",
    component: () => import("../views/peralihan-hak/PeralihanHak.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/peralihan-hak/form",
    name: "Form Peralihan Hak",
    component: () => import("../views/peralihan-hak/FormPermohonan.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/verifikasi-akun",
    name: "Verifikasi Akun",
    component: () => import("../views/VerifikasiAkun.vue"),
    meta: { requiresAuth: true },
  },
];
