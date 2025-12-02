<template>
  <div
    class="file-uploader"
    :class="{
      'drag-able': drag,
      'picture-card': listType === 'picture-card',
      'is-disabled': disabled
    }">

    <!--卡片样式-->
    <UploadListPictureCard
      v-if="listType === 'picture-card' && showFileList"
      :class="{
        'file-list-empty': fileList.length === 0,
      }"
      :files="fileList"
      :showUploadSpeed="showUploadSpeed"
      :showUploadStats="showUploadStats"
      :getStatusText="getStatusText"
      :getFileIcon="getFileIcon"
      :uploadFile="uploadFile"
      :pauseUpload="pauseUpload"
      :cancelUpload="cancelUpload"
      :removeFile="removeFile"
      :getStatusClass="getStatusClass"
      :formatFileSize="formatFileSize"
      :show-cancel-button="showCancelButton"
      :show-pause-button="showPauseButton"
      :show-remove-button="showRemoveButton"
      :simple-file-item="simpleFileItem"
      @file-preview="previewImage"></UploadListPictureCard>

    <slot name="upload-prepend" :files="fileList"></slot>

    <!-- 上传区域 -->
    <div
      v-show="!needHideUploader"
      class="upload-area"
      :class="{
        'dragover': isDragging,
        'is-disabled': disabled
      }"
      @click="openFileDialog"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave">

      <slot :files="fileList">
        <div class="upload-dragger">
          <div class="upload-icon">
            <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
              <path
                d="M544.768 856.064V659.456h131.072L512 462.848 348.16 659.456h131.072v196.608H315.392v-2.048l-16.384 2.048c-69.632-2.048-127.488-26.112-173.568-72.192S55.296 679.936 53.248 610.304c1.364992-64.171008 22.356992-118.612992 62.976-163.328S208.555008 375.808 271.36 367.616c12.288-59.392 40.448-107.179008 84.48-143.36s96.084992-54.955008 156.16-56.32c60.075008 1.364992 112.128 20.139008 156.16 56.32S740.352 308.224 752.64 367.616c62.804992 8.192 114.516992 34.644992 155.136 79.36S969.387008 546.132992 970.752 610.304c-2.048 69.632-26.112 127.488-72.192 173.568S794.624 854.016 724.992 856.064l-16.384-2.048v2.048H544.768z"></path>
            </svg>
          </div>
          <p class="upload-text">
            <span v-if="drag"><!--拖放文件到此处 或-->{{ nbt('nbUploader.dragFileText') }}</span>
            <!--点击选择文件-->{{ nbt('nbUploader.chooseFileText') }}
          </p>
        </div>
      </slot>

      <input
        ref="fileInput"
        type="file"
        class="file-input"
        v-bind="fileInputAttrs"
        :multiple="multiple"
        :accept="accept"
        :disabled="disabled"
        @change="onFileInputChange">
    </div>

    <!-- Default 列表样式 -->
    <UploadListDefault
      v-if="listType === 'default' && showFileList"
      :class="{
        'file-list-empty': fileList.length === 0,
      }"
      :files="fileList"
      :showUploadSpeed="showUploadSpeed"
      :showUploadStats="showUploadStats"
      :getStatusText="getStatusText"
      :getFileIcon="getFileIcon"
      :uploadFile="uploadFile"
      :pauseUpload="pauseUpload"
      :cancelUpload="cancelUpload"
      :removeFile="removeFile"
      :getStatusClass="getStatusClass"
      :formatFileSize="formatFileSize"
      :parent-slots="$scopedSlots"
      :show-cancel-button="showCancelButton"
      :show-pause-button="showPauseButton"
      :show-remove-button="showRemoveButton"
      :simple-file-item="simpleFileItem"
      @file-preview="previewImage"></UploadListDefault>

    <slot name="upload-append" :files="fileList"></slot>

    <!-- 操作按钮 -->
    <div class="upload-actions" v-if="listType === 'default' && showUploadActionBar && fileList.length > 0">
      <div class="left-actions">
        <button class="action-btn remove-all-btn" @click="removeAll">{{ nbt('nbUploader.removeAll') }}<!--移除全部--></button>
        <button class="action-btn cancel-btn" @click="cancelAll">{{ nbt('nbUploader.cancelAll') }}<!--取消全部--></button>
        <button
          v-if="useChunkedUpload"
          class="action-btn cancel-btn"
          @click="pauseAll">
          {{ nbt('nbUploader.pauseAll') }}<!--暂停全部-->
        </button>
      </div>
      <div class="right-actions">
        <button class="action-btn upload-all-btn" @click="uploadAll">{{ nbt('nbUploader.uploadAll') }}<!--上传全部--></button>
      </div>
    </div>

    <!-- 图片预览组件 -->
    <ImagePreviewer
      :show="showPreview"
      :imageUrl="currentPreviewImageUrl"
      :imageName="currentPreviewImageName"
      @close="closePreview"
    />
  </div>
</template>

<script>
// 导入工具函数
import {
  uploadSingleFile,
  formatSpeed,
  formatTime,
  formatFileSize,
  generatePreviewUrl,
  isImageFile,
  getFileIcon, isFunction, isPromise, errorMsgs, invokeRequestHandler, defaultTimeout, simpleHash, base64ToBlob
} from './upload-utils.js';
import { commonProps } from './upload-list-props';
import LocaleMixin from '@/components/uploader/locale/localeMixin';

// 导入图片预览组件
import ImagePreviewer from './ImagePreviewer.vue';
import UploadListDefault from './UploadListDefault.vue';
import UploadListPictureCard from './UploadListPictureCard.vue';
import './uploader.scss';

export default {
  name: 'FileUploader',
  components: {
    ImagePreviewer,
    UploadListDefault,
    UploadListPictureCard
  },
  mixins: [
    LocaleMixin
  ],
  props: {
    ...commonProps,
    maxConcurrentUploads: { // 最大上传并发数
      type: Number,
      default: 3
    },
    useChunkedUpload: { // 是否使用分片上传
      type: Boolean,
      default: false
    },
    chunkSize: { // 每片数量
      type: Number,
      default: 5 * 1024 * 1024 // 默认5MB
    },
    chunkSizeThreshold: {
      type: Number,
      default: 10 * 1024 * 1024, // 10MB以上使用分片上传
    },
    // 批次控制
    batchFileConcurrentUploads: {  // 批量上传时每批上传文件并发数
      type: Number,
      default: 3
    },
    batchChunkConcurrentUploads: {  // 批量上传时上传分片并发数
      type: Number,
      default: 5
    },
    fileInputAttrs: { // 文件选择input的属性
      type: Object,
      default () {
        return {};
      }
    },
    beforeUpload: { // 上传文件前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。
      type: Function
    },
    beforeUploadChunk: { // 上传分片前的钩子，参数为上传的分片，若返回 false 或者返回 Promise 且被 reject，则停止上传。
      type: Function
    },
    beforeRemove: { // 删除文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则不会被删除。
      type: Function
    },
    chunkUploadCompleted: { // 分片全部上传完成的钩子，参数为上传的分片，若返回 false 或者返回 Promise 且被 reject，则停止上传。
      type: Function
    },
    fileChange: { // 文件被选中的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则不会被添加到文件列表。
      type: Function
    },
    previewFile: { // 自定义预览函数
      type: Function
    },
    // 请求处理器，所有请求都会调用该函数，可以在该函数内添加请求数据，设置自定义请求头，请求函数，超时时间等。
    // 调用该函数时传入的参数为：
    /*
      {
        extraData: undefined || {...}, // 上传单个文件时为beforeUpload函数返回的数据，分片上传时为beforeChunkUpload返回的数据
        file: File, // 上传文件
        isUploadChunk: false, // 是否为分片上传
        chunkData: {...} // 分片数据
      }
     */
    // 该函数需返回一个对象或promise，对象格式为：
    /*
      {
        url: 'xxx',
        method: 'post' | 'put' | 'update',
        data: {...}, // 可以为普通对象，也可以为FormData
        headers: {...},
        timeout: xxx,
        withCredentials: true | false
      }
     */
    requestHandler: {
      type: Function,
      required: true
    },
    // 请求响应处理器，所有请求响应都会调用该函数，可以在该函数内处理文件/分片上传完成后的一些逻辑，如根据接口响应的编码判断用户是否有权限访问。
    // 该函数若返回 Promise 且被 reject，则被认为文件/分片上传失败
    // 调用该函数时传入的参数为：
    /*
      {
        file: File, // 上传文件
        isUploadChunk: false, // 是否为分片上传
        chunkData: {...} // 分片数据
      }
     */
    respondHandler: {
      type: Function
    },
    fileIconExtend: { // 文件图标扩展，如：{ 'mp4': { type: 'emoji', value: '🎬' }, 'vue': { type: 'img', value: 'https://cn.vuejs.org/logo.svg' }, 'jsx': { type: 'img', value: 'data:image/jpeg;base64,xxxxx' } }
      type: Object
    },
    timeRemainingFormatter: { // 剩余时间格式化函数
      type: Function
    },
    // 新增props
    maxSize: {
      type: Number,
      default: null // 单个文件最大体积（字节），null表示无限制
    },
    limit: {
      type: Number,
      default: null // 最大文件个数，null表示无限制
    },
    accept: {
      type: String,
      default: '' // 接受的文件类型，如 "image/*,.pdf"
    },
    multiple: { // 是否支持多选
      type: Boolean
    },
    drag: { // 是否支持拖拽上传
      type: Boolean
    },
    /* showUploadStats: { // 是否显示上传状态信息
      type: Boolean,
      default: true
    },
    showUploadSpeed: { // 是否显示上传速度
      type: Boolean,
      default: true
    },
    showRemoveButton: { // 是否显示移除文件按钮
      type: Boolean,
      default: true
    },
    showCancelButton: { // 是否显示取消上传按钮
      type: Boolean,
      default: true
    },
    showPauseButton: { // 是否显示暂停上传按钮
      type: Boolean,
      default: true
    }, */
    showUploadActionBar: { // 是否显示底部上传操作栏
      type: Boolean,
      default: true
    },
    listType: { // 文件列表类型
      type: String,
      default: 'default',
      validator: (value) => ['default', 'picture-card'].includes(value)
    },
    hideUploaderWhenExceedLimit: { // 是否在选择的文件数量超出或等于limit值后隐藏文件上传器
      type: Boolean,
      default: true
    },
    disabled: { // 是否禁用
      type: Boolean,
      // default: true
    },
    showFileList: { // 是否显示文件列表
      type: Boolean,
      default: true
    },
    autoUpload: { // 是否自动上传
      type: Boolean
    },
    /* simpleFileItem: { // 是否为简单样式
      type: Boolean
    }, */
    timeout: { // 请求超时时间
      type: Number,
      default: 6000 * 5
    },
    defaultFileList: { // 非受控模式下的文件列表
      type: Array,
      default: () => [],
      validator: (value) => {
        if (!Array.isArray(value)) {
          console.warn("The value of the defaultFileList prop must be an array.");
          return false;
        }
        let flag = value.some((item, index) => {
          if (!item || typeof item !== 'object' || !item.id || !item.name) {
            console.warn(`The defaultFileList prop item at index ${index} must be an object that contains id, previewUrl and name properties.`);
            return true;
          }
          return false;
        });

        return !flag;
      }
    },
    statusMap: { // 状态映射表
      type: Object,
    }
  },
  data () {
    return {
      files: [],
      isDragging: false,

      // 上传队列
      fileUploadQueue: [],
      chunkUploadQueue: [],
      activeFileUploads: 0,
      activeChunkUploads: 0,

      // useChunkedUpload: false,
      // chunkSizeThreshold: 10 * 1024 * 1024, // 10MB以上使用分片上传

      // 存储取消函数
      cancelFunctions: new Map(),
      chunkCancelFunctions: new Map(), // 存储分片上传的取消函数

      // 图片预览相关
      showPreview: false,
      currentPreviewImageUrl: '',
      currentPreviewImageName: ''
    };
  },
  computed: {
    // 计算剩余可上传的文件数
    /* remainingFileSlots () {
      return this.batchFileConcurrentUploads - this.activeFileUploads;
    }, */

    // 计算剩余可上传的分片数
    /* remainingChunkSlots () {
      return this.batchChunkConcurrentUploads - this.activeChunkUploads;
    }, */
    fileList () {
      let result = [];
      this.defaultFileList.forEach(item => {
        let name = item.name || 'unknown name file';
        result.push({
          ...item,
          name,
          file: item,
          size: 0,
          progress: 100,
          loaded: 100,
          fileIcon: this.getFileIcon(name), // 文件预览图标
          status: /* status ||  */'completed',
          source: 'defaultList'
        });
      });
      this.files.forEach(item => {
        /* result.push({
          ...item,
          source: 'files'
        }); */
        result.push(item);
      });
      return result;
    },
     // 是否隐藏文件选择器
    needHideUploader () {
      let  {
        limit,
        hideUploaderWhenExceedLimit,
        listType,
      } = this;
      let flag = hideUploaderWhenExceedLimit && limit && (limit > 0) && (this.files.length >= limit) && (listType === 'picture-card');
      return flag;
    }
  },
  /* watch: {
    defaultFileList: {
      handler (defaultFileList) {
        if (Array.isArray(defaultFileList)) {
          let files = this.files.slice();
          let newFiles = [];
          if (defaultFileList.length === 0) {
            newFiles = files.filter(item => item.source !== 'defaultList');
          } else {
            // let defaultFileIds = [];
            defaultFileList.forEach(item => {
              let newItem = {
                ...item,
                status: /!* status ||  *!/'completed',
                source: 'defaultList'
              }

              // defaultFileIds.push(newItem.id);
              newFiles.push(newItem);
            });
            files.forEach(item => {
              let {
                // id,
                source
              } = item;
              if (source === 'files') {
                newFiles.push(item);
              }
            });
          }

        }
      },
      immediate: true,
    }
  }, */
  methods: {
    // 打开文件选择对话框
    openFileDialog () {
      this.$refs.fileInput.click();
    },

    // 处理文件选择
    onFileInputChange (e) {
      const files = e.target.files;
      this.handleFiles(files);
      // e.target.value = ''; // 重置input
    },

    // 处理文件列表
    async handleFiles (files) {
      let fileErrorEventName = 'file-error';
      // 将files(FileList)转换成普通数组，在循环中有异步操作时files会被清空，导致只有第1个文件能加进去
      let fileList = [...files];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        let checkFileRes = this.checkFile(file, file.name);
        if (!checkFileRes.valid) {
          this.$emit(fileErrorEventName, checkFileRes.errorInfo);
          // 检查文件数量限制
          if (checkFileRes.errorInfo.type === 'limit') {
            return;
          }
          continue;
        }

        // 检查是否是文件夹
        const isDirectory = file.webkitRelativePath && file.webkitRelativePath.includes('/');
        const directory = isDirectory ? file.webkitRelativePath.split('/')[0] : '';

        // 调用 file-change prop 进行文件验证
        let shouldAddFile = true;
        let outFileCheckPromise = Promise.resolve(true);
        if (isFunction(this.fileChange)) {
          try {
            const result = this.fileChange(file);
            if (result instanceof Promise) {
              // 如果是 Promise，等待其结果
              outFileCheckPromise = result;
            } else {
              // 如果是同步函数，直接使用返回值
              outFileCheckPromise = Promise.resolve(result !== false);
            }
          } catch (error) {
            // 如果 Promise 被 reject，不添加文件
            console.warn('文件验证失败:', error);
            this.$emit(fileErrorEventName, {
              type: 'error',
              file: file,
              error
            });
            outFileCheckPromise = Promise.resolve(false);
          }
        }

        shouldAddFile = await outFileCheckPromise;
        // 如果验证通过，添加文件到列表
        if (shouldAddFile) {
          // 生成预览URL
          let previewUrl = ''
          if (isFunction(this.previewFile)){
            previewUrl = await this.previewFile(file);
          } else {
            // 生成预览URL
            previewUrl = await generatePreviewUrl(file);
          }
          // this._addFile(file, directory, previewUrl);
          this._addFile({
            file,
            name: file.name,
            directory,
            previewUrl
          });
        }
      }
    },

    // 校验文件
    checkFile (file, fileName) {
      let {
        multiple,
        limit,
        maxSize,
        accept
      } = this;
      let result = {
        valid: true,
        errorInfo: null
      };
      if (multiple) {
        if (limit && limit > 0 && this.files.length >= limit) {
          // 检查文件数量限制
          result.errorInfo = {
            type: 'limit',
            message: `文件数量超过限制，最多允许上传 ${limit} 个文件`,
            file: file,
            limit: limit,
            currentCount: this.files.length,
            // newFilesCount: files.length
          };
          result.valid = false;
          return result;
        }
      }
      // 检查文件大小限制
      if (maxSize && maxSize > 0 && file.size > maxSize) {
        result.errorInfo = {
          type: 'maxSize',
          message: `文件 "${file.name}" 大小(${this.formatFileSize(file.size)})超过限制，最大允许: ${this.formatFileSize(maxSize)}`,
          file: file,
          maxSize: maxSize,
          fileSize: file.size
        };
        result.valid = false;
        return result;
      }
      // 检查文件类型
      if (accept && !this.isFileTypeAccepted(file, fileName)) {
        result.errorInfo = {
          type: 'accept',
          message: `文件 "${file.name}" 的类型不被支持，仅支持 ${accept} 类型的文件`,
          file: file,
          accept: accept
        };
        result.valid = false;
        return result;
      }

      return result;
    },

    // 检查文件类型是否被接受
    isFileTypeAccepted (file, fileName) {
      if (!this.accept) {
        return true;
      }

      const acceptTypes = this.accept.split(',').map(type => type.trim());

      for (const acceptType of acceptTypes) {
        if (this.matchFileType(file, acceptType, fileName)) {
          return true;
        }
      }

      return false;
    },

    // 匹配文件类型
    matchFileType (file, acceptType, fileName) {
      // 处理通配符类型，如 "image/*"
      if (acceptType.endsWith('/*')) {
        const mimeType = acceptType.slice(0, -2);
        return file.type.startsWith(mimeType);
      }

      // 处理具体MIME类型，如 "image/jpeg"
      if (file.type === acceptType) {
        return true;
      }

      // 处理文件扩展名，如 ".jpg"
      if (acceptType.startsWith('.')) {
        // 改进的文件名扩展名提取逻辑
        const filename = (file.name || fileName).toLowerCase();

        // 直接匹配完整文件名后缀
        if (filename.endsWith(acceptType.toLowerCase())) {
          return true;
        }

        /* // 对于多扩展名文件（如 .tar.gz），检查所有可能的扩展名组合
        const nameParts = fileName.split('.');
        if (nameParts.length > 1) {
          // 从最长扩展名组合开始检查（如 .tar.gz）
          for (let i = nameParts.length - 1; i > 0; i--) {
            const currentExtension = '.' + nameParts.slice(i).join('.');
            if (currentExtension === acceptExtension) {
              return true;
            }
          }
        } */
      }

      return false;
    },

    // 添加文件进文件队列
    addFile (fileData) {
      console.log('addFile, fileData', fileData);
      if (!fileData || typeof fileData !== 'object' || !fileData.name || !fileData.file) {
        throw new Error("addFile function needs a parameter with an object that contains 'name', 'type' and 'file' properties.");
      }
      let {
        file,
        name,
        type,
        previewUrl, // 预览地址
        status = 'pending', // 状态
        extendData // 扩展数据
      } = fileData;
      let finalFile = null;
      let fileErrorEventName = 'file-error';
      let doAddFile = (previewUrl) => {
        let checkFileRes = this.checkFile(finalFile, name);
        if (!checkFileRes.valid) {
          this.$emit(fileErrorEventName, checkFileRes.errorInfo);
          return;
        }

        // 调用 file-change prop 进行文件验证
        let outFileCheckPromise = Promise.resolve(true);
        // 手动添加文件不调用 fileChange 函数，否则无法区分 fileChange 函数无法区分是手动调用函数uploader自动触发
        /* if (isFunction(this.fileChange)) {
          try {
            const result = this.fileChange(file);
            if (result instanceof Promise) {
              // 如果是 Promise，等待其结果
              outFileCheckPromise = result;
            } else {
              // 如果是同步函数，直接使用返回值
              outFileCheckPromise = Promise.resolve(result !== false);
            }
          } catch (error) {
            // 如果 Promise 被 reject，不添加文件
            console.warn('文件验证失败:', error);
            this.$emit(fileErrorEventName, {
              type: 'error',
              file: file,
              error
            });
            outFileCheckPromise = Promise.resolve(false);
          }
        } */

        outFileCheckPromise.then((shouldAddFile) => {
          if (shouldAddFile) {
            this._addFile({
              file: finalFile,
              name,
              size: finalFile.size,
              previewUrl,
              status,
              extendData
            });
          }
        });
      };
      if (typeof file === 'string') {
        // base64的图片数据，直接转成blob
        if (file.startsWith('data:image/')) {
          finalFile = base64ToBlob(file);
          if (!previewUrl) {
            previewUrl = file;
          }
        } else {
          finalFile = new Blob([file], { type });
        }
      } else if ((file instanceof Blob) || (file instanceof File)) {
        finalFile = file;
        let filetype = file.type;
        if (!previewUrl && filetype && filetype.startsWith('image/')) {
          let previewUrlPrimise;
          // 生成预览URL
          if (isFunction(this.previewFile)){
            previewUrlPrimise = this.previewFile(file);
          } else {
            // 生成预览URL
            previewUrlPrimise = generatePreviewUrl(file);
          }
          previewUrlPrimise.then((previewUrl) => {
            doAddFile(previewUrl);
          });
          return;
        }
      }
      if (!finalFile) {
        throw new Error('The file is invalid. It can be Image base64 data, a File object, a Blob object, or a string, but must specify a MIME type.');
      }
      /* this._addFile({
        file: finalFile,
        name,
        size: finalFile.size,
        previewUrl,
        status
      }); */
      doAddFile(previewUrl);
    },

    // 添加文件到上传列表
    _addFile (params) {
      let {
        file,
        name,
        directory = '',
        previewUrl = null,
        status,
        extendData
      } = params;
      console.log('file', file);
      const fileId = this.generateFileId(file, name);
      const fileData = {
        id: fileId,
        file: file,
        name: name,
        size: file.size,
        directory: directory,
        previewUrl: previewUrl,
        progress: 0,
        loaded: 0,
        source: 'files',
        status: status || 'pending', // pending, checking, uploading, completed, error, cancelled, paused
        speed: '0 B',
        remainingTime: '--',
        startTime: null,
        useChunked: this.useChunkedUpload && file.size > this.chunkSizeThreshold,
        chunks: Math.ceil(file.size / this.chunkSize),
        currentChunk: 0,
        uploadedChunks: 0,
        xhr: null,
        extendData, // 扩展数据，由调用方提供
        // 分片上传相关
        chunkQueue: [], // 分片上传队列
        activeChunks: 0, // 当前活跃的分片上传数
        uploadedChunkSet: new Set(), // 记录已上传成功的分片索引
        // 实时进度跟踪
        lastUpdateTime: null,
        lastUploadedBytes: 0,
        chunkProgressMap: new Map(), // 存储每个分片的实时上传进度
        // 平滑速度计算
        speedSamples: [], // 速度样本数组，用于平滑计算
        lastSpeedUpdateTime: null,
        fileIcon: this.getFileIcon(name), // 文件预览图标
        // 设置已上传分片
        setUploadedChunks: this.setUploadedChunks
      };

      if (!this.multiple) {
        this.files = [fileData];
        this.fileUploadQueue = [];
        this.cancelFunctions = new Map();
      } else {
        this.files.push(fileData);
      }

      this.$emit('file-added', fileData);

      if (this.autoUpload) {
        this.$nextTick(() => {
          this.uploadFile(fileId);
        });
      }
      return fileId;
    },

    // 生成文件ID
    generateFileId (file, fileName) {
      let {
        lastModified = 0,
        size = 0,
        type = 'unknow',
        name = 'unknown',
      } = file;
      // return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      let id = simpleHash('file_' + lastModified + '-' + size + '-' + type + '-' + (name || fileName));
      let hasSame = this.files.some(fileData => fileData.id === id);
      if (hasSame) {
        id = simpleHash('file_' + lastModified + '-' + size + '-' + type + '-' + (name || fileName) + new Date().getTime());
      }
      return id;
    },

    // 上传文件
    async uploadFile (fileId) {
      const fileData = this.getFileById(fileId);
      if (!fileData) return;

      let fileStatus = fileData.status;
      // 如果文件是从暂停状态恢复，保持已上传的分片信息
      if (['paused', 'cancelled', 'error'].includes(fileStatus)) {
        fileData.status = 'uploading';
        fileData.startTime = Date.now();
        fileData.lastUpdateTime = Date.now();
        fileData.lastUploadedBytes = fileData.loaded;
        fileData.speedSamples = [];
        fileData.lastSpeedUpdateTime = null;
        fileData.speed = '0 B';

        if (fileData.useChunked) {
          /* if (fileStatus === 'error') { // 如果文件上传失败了重新上传，则需清空分片队列信息
            fileData.chunkQueue = []; // 分片上传队列
            fileData.uploadedChunks = 0;
            fileData.progress = 0;
            fileData.remainingTime = '--';
            fileData.uploadedChunkSet = new Set(); // 记录已上传成功的分片索引
            fileData.lastUpdateTime = null;
            fileData.lastUploadedBytes = 0;
            fileData.chunkProgressMap = new Map(); // 存储每个分片的实时上传进度
            // 平滑速度计算
            fileData.speedSamples = []; // 速度样本数组，用于平滑计算
          } */
          // 重新开始分片上传
          await this.uploadFileWithChunks(fileData);
        } else {
          // 单文件上传
          await this.uploadSingleFile(fileData);
        }
      } else if (fileStatus === 'pending') {
        // 新文件上传
        fileData.status = 'checking';

        try {
          fileData.status = 'uploading';
          fileData.startTime = Date.now();
          fileData.lastUpdateTime = Date.now();
          fileData.lastUploadedBytes = 0;
          fileData.speedSamples = [];
          fileData.lastSpeedUpdateTime = null;

          if (fileData.useChunked) {
            await this.uploadFileWithChunks(fileData);
          } else {
            await this.uploadSingleFile(fileData);
          }
        } catch (error) {
          if (error.message !== 'Upload cancelled') {
            fileData.status = 'error';
            this.$emit('file-upload-error', { fileData, error: error.message });
          }
        }
      }
    },

    // 重置文件状态（用于取消后重新上传）
    resetFileState (fileData) {
      // 注意：这里不清除 uploadedChunks 和 uploadedChunkSet，保留已上传的分片信息
      fileData.progress = (fileData.uploadedChunks / fileData.chunks) * 100;
      fileData.loaded = Math.floor((fileData.uploadedChunks / fileData.chunks) * fileData.size);
      fileData.speed = '0 B';
      fileData.remainingTime = '--';
      fileData.currentChunk = fileData.uploadedChunks;
      fileData.chunkQueue = [];
      fileData.activeChunks = 0;
      fileData.startTime = null;
      fileData.lastUpdateTime = null;
      fileData.lastUploadedBytes = fileData.loaded;
      fileData.chunkProgressMap.clear();
      fileData.speedSamples = [];
      fileData.lastSpeedUpdateTime = null;
    },

    // 单文件上传
    async uploadSingleFile (fileData) {
      // 将文件添加到上传队列
      this.fileUploadQueue.push(fileData.id);
      this.processFileUploadQueue();
    },

    // 处理文件上传队列
    async processFileUploadQueue () {
      while (this.fileUploadQueue.length > 0 && this.activeFileUploads < this.batchFileConcurrentUploads) {
        const fileId = this.fileUploadQueue.shift();
        const fileData = this.getFileById(fileId);

        if (!fileData || fileData.status !== 'uploading') continue;

        this.activeFileUploads++;

        try {
          await uploadSingleFile({
            fileData: fileData,
            file: fileData.file,
            timeout: this.timeout,
            requestHandler: this.requestHandler,
            responseHandler: this.respondHandler,
            onProgress: (progress) => {
              fileData.progress = progress.progress;
              fileData.loaded = progress.loaded;
              fileData.speed = progress.speed;
              fileData.remainingTime = this.formatTime(progress.remainingTime);
              this.$emit('file-upload-progress', fileData);
            },
            onComplete: () => {
              fileData.status = 'completed';
              fileData.progress = 100;
              fileData.loaded = fileData.file.size;
              this.$emit('file-upload-complete', fileData);
              // 清理取消函数
              this.cancelFunctions.delete(fileData.id);
            },
            onError: (error) => {
              console.log('onError', error)
              if (error.message !== 'Upload cancelled') {
                fileData.status = 'error';
                this.$emit('file-upload-error', { fileData, error: error });
              }
              // 清理取消函数
              this.cancelFunctions.delete(fileData.id);
            },
            onBeforeUpload: this.beforeUpload,
            onCancel: (cancelFunc) => {
              // 存储取消函数
              this.cancelFunctions.set(fileData.id, cancelFunc);
            }
          });
        } catch (error) {
          console.error('文件上传失败:', error);
          // fileData.status = 'error';
          // this.$emit('file-upload-error', { file: fileData, error: error });
        } finally {
          this.activeFileUploads--;
          // 继续处理队列中的下一个文件
          this.processFileUploadQueue();
        }
      }
    },

    // 分片上传 - 使用队列控制
    async uploadFileWithChunks (fileData) {
      let beforeUploadPromise = Promise.resolve();
      if (isFunction(this.beforeUpload)) {
        beforeUploadPromise = this.beforeUpload(fileData);
      }
      return beforeUploadPromise.then(() => {
        // 初始化分片队列（只上传未完成的分片）
        fileData.chunkQueue = this.buildChunkQueue(fileData);
        console.log('uploadFileWithChunks', [...fileData.chunkQueue], fileData.uploadedChunks, fileData.chunks);
          if (fileData.uploadedChunks >= fileData.chunks) {
          this._onChunkUploadCompleted(fileData);
          return;
        }
        fileData.activeChunks = 0;

        // 设置文件状态为上传中
        fileData.status = 'uploading';

        // 开始处理分片上传
        this.processChunkUploadQueue(fileData);
      });
    },

    // 构建分片队列（排除已上传成功的分片）
    buildChunkQueue (fileData) {
      const chunkQueue = [];
      for (let i = 0; i < fileData.chunks; i++) {
        // 只添加未上传的分片
        if (!fileData.uploadedChunkSet.has(i)) {
          chunkQueue.push(i);
        }
      }
      return chunkQueue;
    },

    // 处理分片上传队列
    async processChunkUploadQueue (fileData) {
      console.log('processChunkUploadQueue 1111');
      // 检查文件是否被暂停或取消
      if (fileData.status === 'paused' || fileData.status === 'cancelled') {
        return;
      }

      console.log('processChunkUploadQueue 2222', {...fileData});
      while (fileData.chunkQueue.length > 0 &&
      fileData.activeChunks < this.batchChunkConcurrentUploads &&
      fileData.status === 'uploading') {

        const chunkIndex = fileData.chunkQueue.shift();
        fileData.activeChunks++;
        this.activeChunkUploads++;

        this.uploadChunk(fileData, chunkIndex)
          .then(() => {
            // 分片上传成功
            fileData.uploadedChunks++;
            fileData.uploadedChunkSet.add(chunkIndex);
            fileData.currentChunk = chunkIndex;

            // 清理该分片的进度记录
            fileData.chunkProgressMap.delete(chunkIndex);

            // 计算进度
            this.updateFileProgress(fileData);

            // 如果所有分片都上传完成
            /* if (fileData.uploadedChunks >= fileData.chunks) {
              fileData.loaded = fileData.size;
              fileData.speed = '0 B';
              fileData.remainingTime = '0';
              this.$emit('file-upload-complete', fileData);
              // 清理取消函数
              this.cancelFunctions.delete(fileData.id);
              this.chunkCancelFunctions.delete(fileData.id);
              let promise = Promise.resolve(true);
              if (isFunction(this.chunkUploadCompleted)) {
                promise = this.chunkUploadCompleted(fileData);
                if (!isPromise(promise)) {
                  promise = Promise.resolve(true);
                }
              }
              promise
                .then(() => {
                  fileData.progress = 100;
                  fileData.status = 'completed';
                })
                .catch(() => {
                  fileData.progress = 100;
                  fileData.status = 'error';
                });
            } */
            if (fileData.uploadedChunks >= fileData.chunks) {
              this._onChunkUploadCompleted(fileData);
            }
          })
          .catch(error => {
            console.error('上传分片失败，error', error);
            let message = error.message;
            // let networkStatus = error.xhr && error.xhr.status;
            if (['Upload cancelled', 'Upload paused'].includes(message)) {
              // 取消或暂停上传，将分片重新加入队列以便恢复上传
              fileData.chunkQueue.unshift(chunkIndex);
            }/*  else if (message === 'Network error') {
              // 分片上传，将分片重新加入队列以便恢复上传
              fileData.chunkQueue.unshift(chunkIndex);
              this.$emit('chunk-upload-error', { file: fileData, error: error });
            } */ else {
              // 上传失败，不自动重试，将分片重新加入队列
              fileData.chunkQueue.unshift(chunkIndex);
              fileData.status = 'error';
              this.$emit('chunk-upload-error', { file: fileData, error: error });
              // 清理取消函数
              this.cancelFunctions.delete(fileData.id);
              this.chunkCancelFunctions.delete(fileData.id);
            }
          })
          .finally(() => {
            console.log('上传分片失败111111');
            fileData.activeChunks--;
            this.activeChunkUploads--;

            // 如果文件状态仍然是上传中，继续处理队列
            if (fileData.status === 'uploading') {
              this.processChunkUploadQueue(fileData);
            }
          });
      }
    },

    // 所有分片上传完成事件
    _onChunkUploadCompleted (fileData) {
      // 如果所有分片都上传完成
      // if (fileData.uploadedChunks >= fileData.chunks) {
        fileData.loaded = fileData.size;
        fileData.speed = '0 B';
        fileData.remainingTime = '0';
        this.$emit('file-upload-complete', fileData);
        // 清理取消函数
        this.cancelFunctions.delete(fileData.id);
        this.chunkCancelFunctions.delete(fileData.id);
        let promise = Promise.resolve(true);
        if (isFunction(this.chunkUploadCompleted)) {
          promise = this.chunkUploadCompleted(fileData);
          if (!isPromise(promise)) {
            promise = Promise.resolve(true);
          }
        }
        promise
          .then(() => {
            fileData.progress = 100;
            fileData.status = 'completed';
          })
          .catch(() => {
            fileData.progress = 100;
            fileData.status = 'error';
          });
      // }
    },

    // 上传进度更新方法
    updateFileProgress (fileData) {
      const currentTime = Date.now();

      // 计算总上传字节数（已完成的字节数 + 当前正在上传的分片字节数）
      let totalUploadedBytes = 0;

      // 计算已完成的字节数
      const completedBytes = fileData.uploadedChunks * this.chunkSize;

      // 计算当前正在上传的分片的字节数
      let currentChunksBytes = 0;
      fileData.chunkProgressMap.forEach((progress, chunkIndex) => {
        const chunkStart = chunkIndex * this.chunkSize;
        const chunkEnd = Math.min(chunkStart + this.chunkSize, fileData.size);
        const chunkSize = chunkEnd - chunkStart;
        currentChunksBytes += progress * chunkSize;
      });

      totalUploadedBytes = completedBytes + currentChunksBytes;

      // 确保不超过文件总大小
      totalUploadedBytes = Math.min(totalUploadedBytes, fileData.size);

      // 计算进度百分比
      const progress = (totalUploadedBytes / fileData.size) * 100;

      // 更新进度
      fileData.progress = progress;
      fileData.loaded = Math.floor(totalUploadedBytes);

      // 计算平滑的上传速度
      this.calculateSmoothSpeed(fileData, totalUploadedBytes, currentTime);

      this.$emit('file-upload-progress', fileData);
    },

    // 计算平滑的上传速度
    calculateSmoothSpeed (fileData, currentBytes, currentTime) {
      // 初始化时间记录
      if (!fileData.lastSpeedUpdateTime) {
        fileData.lastSpeedUpdateTime = currentTime;
        fileData.lastUploadedBytes = currentBytes;
        return;
      }

      const timeDiff = (currentTime - fileData.lastSpeedUpdateTime) / 1000;

      // 至少0.5秒更新一次速度，避免频繁跳动
      if (timeDiff < 0.5) {
        return;
      }

      // 计算瞬时速度
      const bytesDiff = currentBytes - fileData.lastUploadedBytes;
      const instantSpeed = bytesDiff / timeDiff;

      // 将速度样本添加到数组中（最多保留5个样本）
      fileData.speedSamples.push(instantSpeed);
      if (fileData.speedSamples.length > 5) {
        fileData.speedSamples.shift();
      }

      // 计算平均速度（使用加权平均，最近的样本权重更高）
      let totalWeight = 0;
      let weightedSum = 0;

      fileData.speedSamples.forEach((sample, index) => {
        const weight = index + 1; // 越新的样本权重越高
        weightedSum += sample * weight;
        totalWeight += weight;
      });

      const averageSpeed = weightedSum / totalWeight;

      // 计算剩余时间
      const remainingBytes = fileData.size - currentBytes;
      const remainingTime = averageSpeed > 0 ? remainingBytes / averageSpeed : 0;

      // 更新文件数据
      fileData.speed = formatSpeed(averageSpeed);
      fileData.remainingTime = this.formatTime(remainingTime);

      // 更新记录
      fileData.lastSpeedUpdateTime = currentTime;
      fileData.lastUploadedBytes = currentBytes;
    },

    // 格式化剩余时间
    formatTime (time) {
      let result = formatTime(time);
      let text = result.text;
      if (isFunction(this.timeRemainingFormatter)) {
        text = this.timeRemainingFormatter(time);
      }
      return text;
    },

    // 上传单个分片
    async uploadChunk (fileData, chunkIndex) {
      return new Promise(async (resolve, reject) => {
        try {
          // 上传前检查文件状态
          if (fileData.status !== 'uploading') {
            reject(new Error(`Upload ${fileData.status}`));
            return;
          }

          const start = chunkIndex * this.chunkSize;
          const end = Math.min(start + this.chunkSize, fileData.file.size);
          const chunk = fileData.file.slice(start, end);

          let beforeUploadChunkPromise = Promise.resolve();
          // 执行 beforeUploadChunk 函数
          if (isFunction(this.beforeUploadChunk)) {
            beforeUploadChunkPromise = this.beforeUploadChunk({
              chunk,
              fileData,
              chunkIndex,
              chunkSize: this.chunkSize,
              chunkStart: start,
              chunkEnd: end,
            });
            /* if (beforeUploadChunkInvokeRes === false) {
              reject(errorMsgs.beforeChunkUploadRejected);
              return;
            } else if (isPromise(beforeUploadChunkInvokeRes)) {
              beforeUploadChunkPromise = beforeUploadChunkInvokeRes;
            } */
          }
          let beforeUploadChunkRes = await beforeUploadChunkPromise;
          if (beforeUploadChunkRes === false) {
            reject(errorMsgs.beforeChunkUploadRejected);
            return;
          }

          // 执行 requestHandler 函数
          let requestHandlerRes = await invokeRequestHandler(this.requestHandler, {
            chunk,
            fileData,
            chunkIndex,
            chunkSize: this.chunkSize,
            chunkStart: start,
            chunkEnd: end,
            isUploadChunk: true,
            extraData: beforeUploadChunkRes
          });
          console.log('requestHandlerRes', requestHandlerRes)

          let {
            url,
            method,
            data,
            headers,
            timeout,
            withCredentials,
          } = requestHandlerRes;

          if (requestHandlerRes.code !== 0) {
            // if (onError) onError(requestHandlerRes);
            reject(requestHandlerRes);
            return;
          }

          let formData = new FormData();
          if (data instanceof FormData) {
            formData = data;
          } else {
            for (let key in data) {
              formData.append(key, data[key]);
            }
          }

          const xhr = new XMLHttpRequest();

          // 设置分片取消函数
          const cancelFunc = () => {
            if (xhr && xhr.readyState !== 4) {
              xhr.abort();
            }
            reject(new Error('Upload cancelled'));
          };

          // 存储分片取消函数
          if (!this.chunkCancelFunctions.has(fileData.id)) {
            this.chunkCancelFunctions.set(fileData.id, []);
          }
          this.chunkCancelFunctions.get(fileData.id).push(cancelFunc);

          // 监听分片上传进度
          xhr.upload.addEventListener('progress', (e) => {
            if (fileData.status !== 'uploading') return;

            if (e.lengthComputable) {
              // 记录当前分片的上传进度（0-1）
              const chunkProgress = e.loaded / e.total;
              fileData.chunkProgressMap.set(chunkIndex, chunkProgress);

              // 实时更新总进度
              this.updateFileProgress(fileData);
            }
          });

          xhr.addEventListener('load', () => {
            // 从取消函数列表中移除
            const cancelFuncs = this.chunkCancelFunctions.get(fileData.id);
            if (cancelFuncs) {
              const index = cancelFuncs.indexOf(cancelFunc);
              if (index > -1) {
                cancelFuncs.splice(index, 1);
              }
            }

            if (xhr.status === 200) {
              // resolve();
              if (isFunction(this.responseHandler)) {
                let responseHandlerRes = this.responseHandler({
                  chunk,
                  fileData,
                  chunkIndex,
                  chunkSize: this.chunkSize,
                  chunkStart: start,
                  chunkEnd: end,
                  isUploadChunk: true,
                  xhr,
                  response: xhr.response
                });
                if (isPromise(responseHandlerRes)) {
                  responseHandlerRes
                    .then(() => {
                      resolve();
                    })
                    .catch((err) => {
                      let error = {
                        xhr,
                        error: err,
                        ...errorMsgs.responseHandlerRejected
                      };
                      reject(error);
                    });
                  return;
                }
              }
              resolve();
            } else {
              reject(new Error(xhr.statusText));
            }
          });

          xhr.addEventListener('error', () => {
            // 从取消函数列表中移除
            const cancelFuncs = this.chunkCancelFunctions.get(fileData.id);
            if (cancelFuncs) {
              const index = cancelFuncs.indexOf(cancelFunc);
              if (index > -1) {
                cancelFuncs.splice(index, 1);
              }
            }
            reject({
              xhr,
              code: xhr.status,
              message: 'Network error'
            });
          });

          // xhr.open('POST', 'http://localhost:3001/upload/chunk');
          xhr.open(method.toUpperCase(), url);

          if (headers && typeof headers === 'object') {
            for (const key in headers) {
              xhr.setRequestHeader(key, headers[key]);
            }
          }
          if (timeout && timeout > 0) {
            xhr.timeout = timeout;
          } else {
            let timeout2 = this.timeout;
            xhr.timeout = (timeout2 && timeout2 > 0) ? timeout2 : defaultTimeout;
          }
          xhr.withCredentials = withCredentials;

          xhr.send(formData);
        } catch (error) {
          reject(error);
        }
      });
    },

    // 设置已上传分片索引
    setUploadedChunks (fileId, uploadedChunks) {
      let fileData = this.getFileById(fileId);
      if (!fileData || !fileData.useChunked || !Array.isArray(uploadedChunks)) {
        return false;
      }
      uploadedChunks.forEach((chunk) => {
        let chunkIndex = parseInt(chunk);
        if (isNaN(chunkIndex)) {
          return;
        }
        // 分片上传成功
        fileData.uploadedChunks++;
        fileData.uploadedChunkSet.add(chunkIndex);
      });

      return true;
    },

    // 根据ID获取文件
    getFileById (fileId) {
      return this.files.find(file => file.id === fileId);
    },

    // 取消上传
    cancelUpload (fileId) {
      const fileData = this.getFileById(fileId);
      if (!fileData) return;

      // 设置文件状态为取消
      fileData.status = 'cancelled';

      // 执行所有分片的取消函数
      const chunkCancelFuncs = this.chunkCancelFunctions.get(fileId);
      if (chunkCancelFuncs) {
        chunkCancelFuncs.forEach(cancelFunc => {
          cancelFunc();
        });
        this.chunkCancelFunctions.delete(fileId);
      }

      // 执行主取消函数
      const cancelFunc = this.cancelFunctions.get(fileId);
      if (cancelFunc) {
        cancelFunc();
        this.cancelFunctions.delete(fileId);
      }

      // 从队列中移除
      this.fileUploadQueue = this.fileUploadQueue.filter(id => id !== fileId);

      this.$emit('file-upload-cancelled', fileData);
    },

    // 取消全部上传
    cancelAll () {
      this.files.forEach(file => {
        if (file.status === 'uploading' || file.status === 'checking') {
          this.cancelUpload(file.id);
        }
      });

      // 清空上传队列
      this.fileUploadQueue = [];
      this.activeFileUploads = 0;
      this.activeChunkUploads = 0;
    },

    // 暂停上传（仅用于分片上传）
    pauseUpload (fileId) {
      const fileData = this.getFileById(fileId);
      if (!fileData || !fileData.useChunked) return;

      // 设置文件状态为暂停
      fileData.status = 'paused';

      // 执行所有分片的取消函数
      const chunkCancelFuncs = this.chunkCancelFunctions.get(fileId);
      if (chunkCancelFuncs) {
        chunkCancelFuncs.forEach(cancelFunc => {
          cancelFunc();
        });
        this.chunkCancelFunctions.delete(fileId);
      }

      // 执行主取消函数
      const mainCancelFunc = this.cancelFunctions.get(fileId);
      if (mainCancelFunc) {
        mainCancelFunc();
        this.cancelFunctions.delete(fileId);
      }

      this.$emit('file-upload-paused', fileData);
    },

    // 暂停全部上传（仅分片上传）
    pauseAll () {
      this.files.forEach(file => {
        if (file.useChunked && (file.status === 'uploading' || file.status === 'checking')) {
          this.pauseUpload(file.id);
        }
      });
    },

    // 移除文件
    removeFile (fileId) {
      // const index = this.files.findIndex(file => file.id === fileId);
      const fileIndex = this.fileList.findIndex(file => file.id === fileId);
      console.log('removeFile1', fileIndex);
      if (fileIndex !== -1) {
        // let file = this.files[index];
        let file = this.fileList[fileIndex];
        let isDefaultFile = file.source === 'defaultList';
        console.log('removeFile2', file);
        const doRemoveFile = () => {
          let status = file.status;
          let previewUrl = file.previewUrl;

          if (!isDefaultFile) {
            let index = this.files.findIndex(file => file.id === fileId);
            // 如果文件正在上传，先取消上传
            if (status === 'uploading' || status === 'checking') {
              this.cancelUpload(fileId);
            }
            this.files.splice(index, 1);
            if (this.files.length === 0) {
              this.$nextTick(() => {
                // 重置文件选择框
                this.$refs.fileInput.value = '';
              });
            }
            // 清理取消函数
            this.cancelFunctions.delete(fileId);
            this.chunkCancelFunctions.delete(fileId);
          }

          this.$emit('file-removed', file);
          if (!isDefaultFile) {
            // 如果预览图是使用URL.createObjectURL创建的，移除后释放资源
            if (previewUrl && previewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(previewUrl);
            }
          }
        }

        if (isFunction(this.beforeRemove)) {
          let res = this.beforeRemove(file, !isDefaultFile ? this.files : this.defaultFileList);
          if (res === false) {
            return;
          }
          if (isPromise(res)) {
            res.then(() => {
              doRemoveFile();
            });
          }
        } else {
          doRemoveFile();
        }
      }
    },

    // 上传全部文件
    uploadAll () {
      this.files.forEach(file => {
        if (file.status === 'pending' || file.status === 'paused' || file.status === 'cancelled' || file.status === 'error') {
          this.uploadFile(file.id);
        }
      });
    },

    // 移除全部文件
    removeAll () {
      this.files.forEach(file => {
        if (file.status === 'uploading' || file.status === 'checking') {
          this.cancelUpload(file.id);
        }
      });
      let files = this.files;
      this.files = [];
      // 清理所有取消函数
      this.cancelFunctions.clear();
      this.chunkCancelFunctions.clear();
      // 重置队列
      this.fileUploadQueue = [];
      this.activeFileUploads = 0;
      this.activeChunkUploads = 0;
      this.$nextTick(() => {
        // 重置文件选择框
        this.$refs.fileInput.value = '';
      });
      files.forEach(file => {
        let previewUrl = file.previewUrl;
        // 如果预览图是使用URL.createObjectURL创建的，移除后释放资源
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
      });
      files = null;
    },

    // 拖放处理
    handleDrop (e) {
      if (!this.drag) {
        return;
      }
      e.preventDefault();
      this.isDragging = false;

      const files = e.dataTransfer.files;
      this.handleFiles(files);
    },

    handleDragOver (e) {
      if (!this.drag) {
        return;
      }
      e.preventDefault();
      this.isDragging = true;
    },

    handleDragLeave (e) {
      if (!this.drag) {
        return;
      }
      e.preventDefault();
      this.isDragging = false;
    },

    // 获取状态文本
    getStatusText (status) {
      const statusMap = {
        pending: this.nbt('nbUploader.statusMap.pending'), // '待上传',
        checking: this.nbt('nbUploader.statusMap.checking'), // '检查中...',
        uploading: this.nbt('nbUploader.statusMap.uploading'), // '上传中',
        completed: this.nbt('nbUploader.statusMap.completed'), // '上传完成',
        error: this.nbt('nbUploader.statusMap.error'), // '上传失败',
        cancelled: this.nbt('nbUploader.statusMap.cancelled'), // '已取消',
        paused: this.nbt('nbUploader.statusMap.paused'), // '已暂停'
      };
      let statusMapProps = this.statusMap || {};

      return statusMapProps[status] || statusMap[status] || status;
    },

    // 获取状态类名
    getStatusClass (status) {
      const classMap = {
        pending: 'status-pending',
        checking: 'status-checking',
        uploading: 'status-uploading',
        completed: 'status-completed',
        error: 'status-error',
        cancelled: 'status-paused',
        paused: 'status-paused'
      };

      return classMap[status] || '';
    },

    // 图片预览功能
    previewImage (fileData) {
      console.log('previewImage', fileData, isImageFile(fileData));
      let isImgFile = isImageFile(fileData.file);
      let previewUrl = fileData.previewUrl || '';
      let name = fileData.name;
      let previewUrlIsBase64Img = previewUrl.startsWith('data:image') && previewUrl.includes('base64,');
      // let isImg = false;
      let isImg = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tif', 'gif', 'svg', 'ico'].some(fileSuffix => {
        let flag = name.endsWith(fileSuffix);
        if (flag) {
          return true;
        }
        return previewUrl.endsWith(fileSuffix);
      });
      if (!isImgFile && !previewUrlIsBase64Img && !isImg) {
        this.currentPreviewImageUrl = '';
        return;
      }
      // 直接使用已生成的预览URL
      const imageUrl = previewUrl;
      this.currentPreviewImageUrl = imageUrl;
      this.currentPreviewImageName = fileData.name || this.nbt('previewImg')/* '预览图片' */;
      this.showPreview = true;
    },

    closePreview () {
      this.showPreview = false;
      this.currentPreviewImageUrl = '';
      this.currentPreviewImageName = '';
    },

    // 工具函数
    formatFileSize,
    getFileIcon (fileName) {
      return getFileIcon(fileName, this.fileIconExtend);
    }
  },
  beforeDestroy () {
    this.files.forEach(file => {
      let previewUrl = file.previewUrl;
      // 如果预览图是使用URL.createObjectURL创建的，移除后释放资源
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    })
  }
};
</script>
