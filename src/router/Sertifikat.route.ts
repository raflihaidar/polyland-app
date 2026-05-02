export const sertifikatRoutes = [
  {
    path: "/sertifikatku",
    name: "sertifikatku",
    component: () => import("../views/sertifikatku/Sertifikatku.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sertifikatku/:id",
    name: "detail sertifikatku",
    component: () => import("../views/sertifikatku/DetailSertifikatku.vue"),
    meta: { requiresAuth: true },
  },
];
