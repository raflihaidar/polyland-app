export const cariBerkasRoutes = [
  {
    path: "/cari-berkas",
    name: "cari-berkas",
    component: () => import("../views/cari-berkas/CariBerkas.vue"),
    meta: { requiresAuth: true, title: "Cari Berkas" },
  },
  {
    path: "/cari-berkas/hasil",
    name: "hasil cari berkas",
    component: () => import("../views/cari-berkas/Hasil.vue"),
    meta: { requiresAuth: true, title: "Detail Berkas" },
  },
];
