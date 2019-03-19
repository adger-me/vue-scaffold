const Home = r => require.ensure([], () => r(require('@/pages/home')), 'home');
const route = [
  {
    path: '/home',
    name: 'home.index',
    component: Home,
    meta: {
      guest: true,
    },
  },
];
export default route;
