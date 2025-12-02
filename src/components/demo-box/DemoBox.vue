<template>
  <div class="demo-box">
    <div class="demo-box-header">
      <h6 class="demo-title">
        <slot name="title">{{ title }}</slot>
      </h6>
      <div class="demo-operate-area">
        <!--复制代码-->
        <button type="button" title="复制代码" @click="copyExampleCode">
          <span class="copy-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" ariaHidden="true" focusable="false" data-icon="bs-icon-files"><path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"></path></svg>
          </span>
        </button>
        <button
          v-if="showCodeExpandButton"
          type="button"
          :title="codeExpanded ? '收起代码' : '展开代码'"
          @click="codeExpanded = !codeExpanded"
           :class="{
             'example-code-expanded': codeExpanded
           }">
          <span class="code-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" ariaHidden="true" focusable="false" data-icon="bs-icon-code"><path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"></path></svg>
          </span>
        </button>
      </div>
    </div>
    <div class="demo-description">
      <slot name="description"></slot>
    </div>

    <div class="demo-example">
      <slot></slot>
    </div>
    <div class="demo-example-code" v-show="codeExpanded">
    <pre ref="demoCodeRef" class="language-html">{{ demoCoe }}</pre>
    <div class="shrink-code-operate">
        <!--收起代码-->
        <button type="button" @click="codeExpanded = false">
          <span class="code-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" ariaHidden="true" focusable="false" data-icon="bs-icon-code"><path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"></path></svg>
          </span>
          收起代码<!--{{ $t('shrinkCode') }}-->
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// import './demo-box.scss';
import prism from 'prismjs';

export default {
  name: 'DemoBox',
  props: {
    title: { // 标题
      type: String
    },
    fileName: { // 文件名称
      type: String
    },
    showCodeExpandButton: {
      type: Boolean,
      default: true
    },
    copyContent: {
      type: String
    }
  },
  data () {
    return {
      codeExpanded: false,
      exampleCodeRef: null,
      activeTab: 'vue',
      // langCode: 'cn',
      demoCoe: ''
    }
  },
  methods: {
    /**
     * 复制文本
     * @param value 文本值
     * @returns {number} 返回1表示复制成功
     */
    copyText: function (value) {
      if (!value) {
        return -1;
      }
      if (!document.execCommand) {
        // Message.error('浏览器不支持')
        return -2;
      }
      try {
        const selectText = (
          textbox,
          startIndex,
          stopIndex
        ) => {
          if (textbox.createTextRange) {
            // ie
            const range = textbox.createTextRange();
            range.collapse(true);
            range.moveStart('character', startIndex); // 起始光标
            range.moveEnd('character', stopIndex - startIndex); // 结束光标
            range.select(); // 不兼容苹果
          } else {
            // firefox/chrome
            textbox.setSelectionRange(startIndex, stopIndex);
            textbox.focus();
          }
        };
        const copyEl = document.createElement('textarea'); // 不能使用input元素，会导致复制的内容丢失换行
        copyEl.style.position = 'fixed';
        copyEl.style.opacity = '0';
        copyEl.value = value;
        copyEl.setAttribute('readonly', 'readonly');
        document.body.appendChild(copyEl);
        selectText(copyEl, 0, (value + '').length);
        if (document.execCommand('copy')) {
          copyEl.blur();
          document.execCommand('copy');
          document.body.removeChild(copyEl);
          return 1;
        }
      } catch (e) {
        console.log(e);
        return 2;
      }
    },
    copyExampleCode () { // 复制代码
      let text = this.copyContent ? this.copyContent : decodeURIComponent(this.demoCoe);
      let copyStatus = this.copyText(text);
      if (copyStatus == 1) {
        alert('代码已复制');
      } else {
        alert('代码复制失败');
      }
    }
  },
  mounted: function () {
    // prism.highlightElement(exampleCodeRef.value);
    if (this.fileName) {
      // 使用 raw-loader 动态加载源码
      import(/* webpackChunkName: "demo-source" */ `!!raw-loader!@/views/usage-demos/${this.fileName}.vue`)
        .then(res => {
          let demoCode = res.default || '';
          // console.log('demo 源码', demoCode);
          demoCode = demoCode.replace('@/components/uploader/FileUploader.vue', 'vue2-niubility-uploader');
          this.demoCoe = demoCode;
          this.$nextTick(() => {
            prism.highlightElement(this.$refs.demoCodeRef);
          });
        })
        .catch(() => {
          this.demoCoe = '--';
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@use './demo-box.scss';
</style>
