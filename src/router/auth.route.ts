export const authRoutes = [
  {
    path: "/aktaku",
    name: "aktaku",
    component: () => import("../views/aktaku/Aktaku.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sertifikatku",
    name: "sertifikatku",
    component: () => import("../views/sertifikatku/Sertifikatku.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/scan-qr",
    name: "scan-qr",
    component: () => import("../views/ScanQR.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profil",
    name: "profil",
    component: () => import("../views/profil/Profil.vue"),
    meta: { requiresAuth: true },
  },
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
    path: "/cari-berkas",
    name: "cari-berkas",
    component: () => import("../views/cari-berkas/CariBerkas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/cari-berkas/hasil/:fileNumber",
    name: "hasil cari berkas",
    component: () => import("../views/cari-berkas/Hasil.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/peralihan-hak/konfirmasi",
    name: "konfirmasi-peralihan-hak",
    component: () => import("../views/peralihan-hak/Confirmation.vue"),
    meta: { requiresAuth: true },
  },
  {
    path : "/pengaturan-harga-tanah",
    name: "pengaturan-harga-tanah",
    component: () => import("../views/setPrice.vue"),
    meta: { requiresAuth: true },
  },
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
  },
];
