/* ============
 * 路由文件
 * ============
 */
import VueRouter from 'vue-router';
import Vue from 'vue';
import store from '../store';
import VuexRouterSync from 'vuex-router-sync';
import Auth from './auth';
import Home from './home';

Vue.use(VueRouter);

// 设置路由默认状态
const arr = [
  {
    path: '/',
    redirect: '/home',
  }
];

let routes = [...Home, ...Auth, ...arr];
const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(m => m.meta.auth) && !store.state.auth.authenticated) {
    next({
      name: 'login.index',
    });
  } else if (to.matched.some(m => m.meta.guest) && store.state.auth.authenticated) {
    next({
      name: 'home.index',
    });
  } else {
    next();
  }
});
VuexRouterSync.sync(store, router);
Vue.prototype.router = Vue.router = router;

export default router;