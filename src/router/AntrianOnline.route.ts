export const antrianOnlineRoutes = [
  {
    path: "/antrian-online",
    name: "antrian-online",
    component: () => import("../views/antrian-online/AntrianDaring.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/antrian-online/create",
    name: "antrian-online.create",
    component: () => import("../views/antrian-online/PageCreateAntrian.vue"),
    children: [
      {
        path: "form",
        name: "antrian-online.form",
        component: () =>
          import("@/views/antrian-online/components/Section/FormCreateAntrian.vue"),
      },
      {
        path: "loket",
        name: "antrian-online.loket",
        component: () =>
          import("@/views/antrian-online/components/Section/LoketList.vue"),
      },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: "/antrian-online/detail-tiket/:id",
    name: "antrian-online.detail-tiket",
    component: () =>
      import("@/views/antrian-online/components/Section/DetailQueue.vue"),
    meta: { requiresAuth: true },
  },
];
