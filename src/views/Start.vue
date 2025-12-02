<template>
<div class="start">
  <h3>{{ $t('install.title') }}</h3>
  <dl>
    <dt>{{ $t('install.npm.title') }}</dt>
    <dd>
      <p>{{ $t('install.npm.description') }}</p>
      <code class="language-bash">
        npm install vue2-niubility-uploader --save
      </code>
    </dd>
  </dl>
  <dl>
    <dt>{{ $t('install.umd.title') }}</dt>
    <dd>
      <p v-html="$t('install.umd.description')"></p>
      <p>
        <code class="language-bash">
          &lt;link rel="stylesheet" href="./vue2-niubility-uploader.css"&gt;
        </code>
      </p>
      <code class="language-bash">
        &lt;script src="./vue2-niubility-uploader.umd.min.js"&gt;&lt;/script&gt;
      </code>
    </dd>
  </dl>

  <h3>{{ $t('usage.title') }}</h3>
  <dl>
    <dt>{{ $t('usage.globalRegistration.title') }}</dt>
    <dd>
      <p><strong>{{ $t('usage.globalRegistration.mainJs') }}</strong></p>
      <pre class="language-js">
        import Vue from 'vue';
        import Vue2NiubilityUploader from 'vue2-niubility-uploader';
        import 'vue2-niubility-uploader/vue2-niubility-uploader.css';

        Vue.component(Vue2NiubilityUploader.name, Vue2NiubilityUploader);
      </pre>
      <p><strong>{{ $t('usage.globalRegistration.demoVue') }}</strong></p>
      <pre class="language-html">
        &lt;template&gt;
          &lt;Vue2NiubilityUploader
            :request-handler="requestHandler"
            @file-added="onFileAdded&gt;&lt;/Vue2NiubilityUploader&gt;
        &lt;/template&gt;

        &lt;script>
          export default {
            name: "Demo",
            data () {
              return {};
            },
            methods: {
              onFileAdded (file) {
                console.log(this.$t('debug.fileAdded'), file);
              },
              /**
               * {{ $t('debug.requestHandler') }}
               * @param fileData
               */
              requestHandler (fileData) {
                console.log(this.$t('debug.requestHandler'), fileData);
                let {
                  file,
                  name
                } = fileData;

                if (!isUploadChunk) { // Upload single file
                  return {
                    url: 'http://localhost:3001/upload',
                    method: 'POST',
                    data: {
                      file: file,
                      name
                    }
                  };
                }
              }
            }
          }
        &lt;/script&gt;
      </pre>
    </dd>
  </dl>
  <dl>
    <dt>{{ $t('usage.localRegistration.title') }}</dt>
    <dd>
      <p><strong>{{ $t('usage.localRegistration.demoVue') }}</strong></p>
      <pre class="language-html">
        &lt;template&gt;
          &lt;FileUploader
            :request-handler="requestHandler"
            @file-added="onFileAdded&gt;&lt;/FileUploader&gt;
        &lt;/template&gt;

        &lt;script>
          import FileUploader from 'vue2-niubility-uploader';
          import 'vue2-niubility-uploader/vue2-niubility-uploader.css';
          export default {
            name: "Demo",
            components: {
              FileUploader
            },
            data () {
              return {};
            },
            methods: {
              onFileAdded (file) {
                console.log(this.$t('debug.fileAdded'), file);
              },
              /**
               * {{ $t('debug.requestHandler') }}
               * @param fileData
               */
              requestHandler (fileData) {
                console.log(this.$t('debug.requestHandler'), fileData);
                let {
                  file,
                  name
                } = fileData;

                if (!isUploadChunk) { // Upload single file
                  return {
                    url: 'http://localhost:3001/upload',
                    method: 'POST',
                    data: {
                      file: file,
                      name
                    }
                  };
                }
              }
            }
          }
        &lt;/script&gt;
      </pre>
    </dd>
  </dl>
  <h3>{{ $t('start.i18nTitle') }}</h3>
  <p>{{ $t('start.i18nDescription') }}</p>
  <dl>
    <dt>{{ $t('start.directSetEnglish') }}</dt>
    <dd>
      <pre class="language-js">
        import uploaderLangUtil from 'vu2-niubility-uploader/locale/index.js';
        import uploaderEnLocal from 'vu2-niubility-uploader/locale/lang/en.js';

        // 设置语言为英文
        uploaderLangUtil.use(uploaderEnLocal);
      </pre>
    </dd>
  </dl>
  <dl>
    <dt>{{ $t('start.withI18nPlugin') }}</dt>
    <dd>
      <pre class="language-js">
        import VueI18n from 'vue-i18n';
        import uploaderLangUtil from 'vu2-niubility-uploader/locale/index.js';
        import uploaderCn from 'vu2-niubility-uploader/locale/lang/zh-CN.js';
        import uploaderEn from 'vu2-niubility-uploader/locale/lang/en.js';

        const i18n = new VueI18n({
          locale: 'cn', // 设置地区
          messages: {
            cn: {
              hello: '你好',
              ...uploaderCn
            },
            en: {
              hello: 'Hello',
              ...uploaderEn
            }
          }, // 设置地区信息
        });

        uploaderLangUtil.i18n((key, value) => {
          return i18n.t(key, value);
        });

        // 切换语言
        setTimeout(function () {
          i18n.local('en');
        }, 1000);
      </pre>
    </dd>
  </dl>
  <dl>
    <dt>{{ $t('start.languagePackage') }}</dt>
    <dd>
      <pre class="language-js">
        export default {
          nbUploader: {
            statusMap: {
              pending: '待上传',
              checking: '检查中...',
              uploading: '上传中',
              completed: '上传完成',
              error: '上传失败',
              cancelled: '已取消',
              paused: '已暂停'
            },
            dragFileText: '拖放文件到此处 或',
            chooseFileText: '点击选择文件',
            previewImg: '预览图片',
            clickToPreviewImg: '点击查看图片',
            fileIcon: '文件图标',
            speed: '速度',
            remaining: '剩余',
            startUpload: '开始上传',
            pauseUpload: '暂停上传',
            cancelUpload: '取消上传',
            removeFile: '移除文件',
            zoomIn: '放大',
            zoomOut: '缩小',
            resetZoom: '重置缩放',
            rotateLeft: '向左旋转',
            rotateRight: '向右旋转',
            resetRotation: '重置旋转',
            loadImgError: '无法加载图片',
            close: '关闭',
            removeAll: '移除全部',
            cancelAll: '取消全部',
            pauseAll: '暂停全部',
            uploadAll: '上传全部',
          }
        };
      </pre>
    </dd>
  </dl>
</div>
</template>

<script>
import prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';
// Import code highlighting plugin CSS
import 'prismjs-themes/dist/shy.min.css';
export default {
  name: "Start",
  mounted () {
    let preEls = document.querySelectorAll('pre');
    for (let i = 0; i < preEls.length; i++) {
      let preEl = preEls[i];
      if (preEl.className.includes('language-')) {
        prism.highlightElement(preEl);
      }
    }
  }
};
</script>

<style scoped lang="scss">
@use "start";
</style>
