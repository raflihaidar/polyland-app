export const guestRoutes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/auth/Register.vue"),
    meta: { requiresAuth: false },
  },
];
