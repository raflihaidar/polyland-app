export const hakAksesRoutes = [
  {
    path: "hak-akses",
    name: "hak-akses",
    children: [
      {
        path: "users",
        name: "hak-akses.users",
        component: () => import("../views/hak-akses/UserList.vue"),
        meta: { title: "Daftar Pengguna" },
      },
      {
        path: "users/:id",
        name: "hak-akses.user-detail",
        component: () => import("../views/hak-akses/UserDetail.vue"),
        meta: { title: "Detail Pengguna" },
      },
      {
        path: "roles",
        name: "hak-akses.roles",
        component: () => import("../views/hak-akses/RoleList.vue"),
        meta: { title: "Daftar Roles" },
      },
      {
        path: "privilege",
        name: "hak-akses.privilege",
        component: () => import("../views/hak-akses/PrivilegeList.vue"),
        meta: { title: "Daftar Privilege" },
      },
    ],
    meta: { requiresAuth: true },
  },
];
