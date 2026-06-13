export const hakAksesRoutes = [
  {
    path: "hak-akses",
    name: "hak-akses",
    children: [
      {
        path: "users",
        name: "hak-akses.users",
        component: () => import("../views/hak-akses/UserList.vue"),
        meta: { title: "Daftar User" },
      },
       {
        path: "roles",
        name: "hak-akses.roles",
        component: () => import("../views/hak-akses/RoleList.vue"),
        meta: { title: "Daftar Roles" },
      },
    ],
    meta: { requiresAuth: true },
  },
];
