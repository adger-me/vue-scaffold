const Login = r => require.ensure([], () => r(require('@/pages/auth/login')), 'auth');
const route = [
  {
    path: '/login',
    name: 'login.index',
    component: Login,
    meta: {
      guest: true,
    },
  },
];
export default route;
