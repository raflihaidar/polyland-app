export const aktaRoutes = [
  {
    path: "/aktaku",
    name: "aktaku",
    component: () => import("../views/aktaku/Aktaku.vue"),
    meta: { requiresAuth: true, title: "Aktaku" },
  },
];
