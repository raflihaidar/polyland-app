import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import { useAuthStore } from '../store/auth.store'

const routes = [
  { path: '/', name : "Home", component: HomeView },
  { path: '/login', name : "Login", component: LoginView },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

router.beforeEach(async (to, from) => {
  const store = useAuthStore()
  if (
    !store.isAuthenticated &&
    to.name !== 'Login'
  ) {
    return { name: 'Login' }
  }
})
