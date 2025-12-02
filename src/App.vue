<template>
  <div id="app" class="app">
    <header class="app-header" title="An awesome file uploader for vue2!">
      <h1>
        <img class="logo-img" src="./assets/logo.png" alt="logo">
        <span>Vue2 Uploader</span>
      </h1>
      <nav>
        <ul class="menu-list">
          <li
            class="menu-item"
            :class="{
               'is-active': $route.path === '/start'
            }">
            <router-link to="/start"><!--开始-->{{ $t('app.headerNav.start') }}</router-link>
          </li>
          <li
            class="menu-item"
            :class="{
               'is-active': $route.path === '/demo'
            }">
            <router-link to="/demo"><!--使用示例-->{{ $t('app.headerNav.usageDemo') }}</router-link>
          </li>
          <li
            class="menu-item"
            :class="{
               'is-active': $route.path === '/api'
            }">
            <router-link to="/api"><!--Api-->{{ $t('app.headerNav.api') }}</router-link>
          </li>
        </ul>
      </nav>
      <div class="header-right">
        <div class="language-trigger">
          <button type="button" title="Trigger language">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor" aria-label="i18n icon" name="i18n" style="width:1rem;height:1rem;vertical-align:middle;"><path d="M379.392 460.8 494.08 575.488l-42.496 102.4L307.2 532.48 138.24 701.44l-71.68-72.704L234.496 460.8l-45.056-45.056c-27.136-27.136-51.2-66.56-66.56-108.544h112.64c7.68 14.336 16.896 27.136 26.112 35.84l45.568 46.08 45.056-45.056C382.976 312.32 409.6 247.808 409.6 204.8H0V102.4h256V0h102.4v102.4h256v102.4H512c0 70.144-37.888 161.28-87.04 210.944L378.88 460.8zM576 870.4 512 1024H409.6l256-614.4H768l256 614.4H921.6l-64-153.6H576zM618.496 768h196.608L716.8 532.48 618.496 768z"></path></svg>
            <i class="bottom-arrow"></i>
          </button>
          <ul class="language-list">
            <li
              v-for="item in languageList"
              :key="item.value"
              :class="{
                'is-active': item.value == currentLangCode
              }"
              @click="changeLanguage(item)">{{ item.label }}</li>
          </ul>
        </div>
        <a href="javascript:void (0);" target="_blank" class="github-button" role="button" title="Github code">
          <svg viewBox="64 64 896 896" focusable="false" data-icon="github" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>
          <small :title="`version: ${version}`">(v{{ version }})</small>
        </a>
      </div>
    </header>
    <main class="app-main">
      <!--<aside class="app-aside">
        <ul class="menu-list">
          <li
            class="menu-item"
            :class="{
               'is-active': $route.path === '/'
            }">
            <router-link to="/">使用示例</router-link>
          </li>
          <li
            class="menu-item"
            :class="{
               'is-active': $route.path === '/api'
            }">
            <router-link to="/api">Api</router-link>
          </li>
        </ul>
      </aside>-->
      <div class="page-main">
        <router-view/>
      </div>
    </main>

  </div>
</template>

<script>
import './app.scss';
import { version } from './version';
import uploaderLang from '@/components/uploader/locale'
export default {
  name: 'App',
  data () {
    return {
      version,
      currentLangCode: 'cn',
      languageList: [
        {
          label: '简体中文',
          value: 'cn',
        },
        {
          label: 'English',
          value: 'en',
        }
      ]
    }
  },
  methods: {
    changeLanguage (language) {
      this.currentLangCode = language.value;
      this.$i18n.locale = language.value;
      // uploaderLang.use(language.value);
    }
  }
};
</script>
