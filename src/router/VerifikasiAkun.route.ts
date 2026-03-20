export const verifikasiAkunRoutes = [
  {
    path: "/verifikasi-akun",
    name: "verifikasi-akun",
    component: () => import("../views/verifikasi-akun/VerifikasiAkun.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/verifikasi-akun/konfirmasi",
    name: "konfirmasi-verifikasi-akun",
    component: () => import("../views/verifikasi-akun/Confirmation.vue"),
    meta: { requiresAuth: true },
  }
];
