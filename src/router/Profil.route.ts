export const profilRoutes = [
  {
    path: "/profil",
    name: "profil",
    component: () => import("../views/profil/Profil.vue"),
    meta: { requiresAuth: true, title: "Profil" },
  },
];
