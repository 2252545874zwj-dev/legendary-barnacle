import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Search from '../views/Search.vue'
import InfoDetail from '../views/InfoDetail.vue'
<<<<<<< HEAD
import AdminPanel from '../views/AdminPanel.vue'
import Profile from '../views/Profile.vue'
=======
<<<<<<< HEAD
import AdminPanel from '../views/AdminPanel.vue'
import Profile from '../views/Profile.vue'
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Search',
    component: Search,
    meta: { requiresAuth: true }
  },
  {
    path: '/info/:id',
    name: 'InfoDetail',
    component: InfoDetail,
    meta: { requiresAuth: true }
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated()) {
    next('/')
<<<<<<< HEAD
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/')
=======
<<<<<<< HEAD
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/')
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  } else {
    next()
  }
})

export default router
