export const cariBerkasRoutes = [
  {
    path: "/cari-berkas",
    name: "cari-berkas",
    component: () => import("../views/cari-berkas/CariBerkas.vue"),
    meta: {
      requiresAuth: true,
      title: "Cari Berkas",
      privilege: { module: "peralihan-hak", action: ["read"] },
    },
  },
  {
    path: "/cari-berkas/hasil",
    name: "hasil cari berkas",
    component: () => import("../views/cari-berkas/Hasil.vue"),
    meta: {
      requiresAuth: true,
      title: "Detail Berkas",
      privilege: "peralihan-hak",
    },
  },
  {
    path: "/cari-berkas/pembayaran/:orderId",
    name: "pembayaran permohonan",
    component: () => import("../views/cari-berkas/Pembayaran.vue"),
    meta: {
      requiresAuth: true,
      title: "Detail Pembayaran",
      privilege: "peralihan-hak",
    },
  },
    {
    path: "/cari-berkas/pembayaran/:orderId/result",
    name: "hasil pembayaran",
    component: () => import("../views/cari-berkas/HasilPembayaran.vue"),
    meta: {
      requiresAuth: true,
      title: "Hasil Pembayaran",
      privilege: "peralihan-hak",
    },
  },
];
