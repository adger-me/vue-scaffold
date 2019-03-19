import Vue from 'vue';

/* ============
 * Vue i18n
 * ============
 *
 * Internationalization plugin of Vue.js.
 *
 * https://kazupon.github.io/vue-i18n/
 */
// import VueI18n from 'vue-i18n';
// import messages from './locale';

// Vue.use(VueI18n);

// export const i18n = new VueI18n({
//   locale: 'en',
//   fallbackLocale: 'en',
//   messages,
// });

import MobileMessage from 'mobile-message';
import 'mobile-message/dist/message.css';

Vue.use(MobileMessage);

// 引入公共样式
import '@/assets/style/index.less';
Vue.config.debug = process.env.NODE_ENV !== 'production';

export default {
  // i18n,
};
