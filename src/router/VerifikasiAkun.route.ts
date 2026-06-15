export const verifikasiAkunRoutes = [
  {
    path: "/verifikasi-akun",
    name: "verifikasi-akun",
    component: () => import("../views/verifikasi-akun/VerifikasiAkun.vue"),
    children: [
      {
        path: "",
        name: "verifikasi-akun.form",
        component: () =>
          import("@/views/verifikasi-akun/components/FormPage.vue"),
        meta: {
          requiresAuth: true,
          privilege: { module: "verifikasi-akun", action: ["read", "create"] },
        },
      },
      {
        path: "wallet-sign",
        name: "verifasi-akun.wallet-sign",
        component: () =>
          import("@/views/verifikasi-akun/components/WalletSign.vue"),
        meta: {
          requiresAuth: true,
          privilege: { module: "verifikasi-akun", action: ["read", "create"] },
        },
      },
    ],
    meta: { requiresAuth: true, title: "Verifikasi Akun" },
  },
  {
    path: "/verifikasi-akun/konfirmasi",
    name: "konfirmasi-verifikasi-akun",
    component: () => import("../views/verifikasi-akun/Confirmation.vue"),
    meta: { requiresAuth: true, title: "Konfirmasi Akun" },
  },
];
