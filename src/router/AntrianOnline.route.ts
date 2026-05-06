export const antrianOnlineRoutes = [
  {
    path: "/antrian-online",
    name: "antrian-online",
    component: () => import("../views/antrian-online/AntrianDaring.vue"),
    children : [
      {
        path: 'antrian-online.form',
        component: () => import("@/views/antrian-online/components/Section/FormCreateAntrian.vue"),
      },
      {
        path: 'antrian-online.loket',
        component: () => import("@/views/antrian-online/components/Section/LoketList.vue"), 
      }
    ],
    meta: { requiresAuth: true },
  },
];
