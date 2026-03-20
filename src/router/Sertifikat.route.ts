export const sertifikatRoutes = [
  {
    path: "/sertifikatku",
    name: "sertifikatku",
    component: () => import("../views/sertifikatku/Sertifikatku.vue"),
    meta: { requiresAuth: true },
  }
];
