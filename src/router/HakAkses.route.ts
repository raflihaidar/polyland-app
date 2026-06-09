export const hakAksesRoutes = [
  {
    path: "hak-akses",
    name: "hak-akses",
    children: [
      {
        path: "users",
        name: "hak-akses.users",
        component: () => import("../views/verifikasi-akun/admin/UserList.vue"),
        meta: { title: "Daftar User" },
      },
    ],
    meta: { requiresAuth: true },
  },
];
