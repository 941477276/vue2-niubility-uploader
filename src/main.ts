import Vue from 'vue';
import App from './App.vue';
// @ts-ignore
import router from './router/index.js';
// @ts-ignore
import pageLocalCn from './page-locales/cn.js';
// @ts-ignore
import pageLocalEn from './page-locales/en.js';
// 导入代码高亮插件css
// import 'prismjs-themes/dist/midnight.min.css';
/* import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI) */
import DemoBox from '@/components/demo-box/DemoBox.vue';
import VueI18n from 'vue-i18n';
// @ts-ignore
import uploaderCn from '@/components/uploader/locale/lang/zh-CN.js';
// @ts-ignore
import uploaderEn from '@/components/uploader/locale/lang/en.js';
// @ts-ignore
import uploaderLangUtil from '@/components/uploader/locale/index.js';


Vue.config.productionTip = false;

Vue.component(DemoBox.name, DemoBox);
Vue.use(VueI18n);

// 通过选项创建 VueI18n 实例
const i18n = new VueI18n({
  locale: 'cn', // 设置地区
  messages: {
    cn: {
      ...pageLocalCn,
      ...uploaderCn
    },
    en: {
      ...pageLocalEn,
      ...uploaderEn
    }
  }, // 设置地区信息
});

uploaderLangUtil.i18n((key: string, value: string) => {
  console.log('uploaderLangUtil.i18n', key, value);
  return i18n.t(key, value)
});
new Vue({
  // @ts-ignore
  router,
  i18n,
  render: h => h(App)
}).$mount('#app');
