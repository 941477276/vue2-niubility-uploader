<template>
  <div
    class="file-uploader"
    :class="{
      'drag-able': drag
    }">
    <!-- 上传选项 -->
    <div class="upload-options">
      <div class="option-group">
        <input
          type="checkbox"
          id="chunked-upload"
          class="option-checkbox"
          v-model="useChunkedUpload">
        <label for="chunked-upload" class="option-label">启用分片上传（大于10MB文件）</label>
      </div>
      <div class="option-group">
        <label class="option-label">每批上传文件数:</label>
        <input
          type="number"
          v-model.number="batchFileCount"
          min="1"
          max="10"
          class="batch-input">
      </div>
      <div class="option-group">
        <label class="option-label">每批上传分片数:</label>
        <input
          type="number"
          v-model.number="batchChunkCount"
          min="1"
          max="20"
          class="batch-input">
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{ 'dragover': isDragging }"
      @click="openFileDialog"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave">

      <slot>
        <div class="upload-icon">
          <!--📁-->
          <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
            <path
              d="M544.768 856.064V659.456h131.072L512 462.848 348.16 659.456h131.072v196.608H315.392v-2.048l-16.384 2.048c-69.632-2.048-127.488-26.112-173.568-72.192S55.296 679.936 53.248 610.304c1.364992-64.171008 22.356992-118.612992 62.976-163.328S208.555008 375.808 271.36 367.616c12.288-59.392 40.448-107.179008 84.48-143.36s96.084992-54.955008 156.16-56.32c60.075008 1.364992 112.128 20.139008 156.16 56.32S740.352 308.224 752.64 367.616c62.804992 8.192 114.516992 34.644992 155.136 79.36S969.387008 546.132992 970.752 610.304c-2.048 69.632-26.112 127.488-72.192 173.568S794.624 854.016 724.992 856.064l-16.384-2.048v2.048H544.768z"></path>
          </svg>
        </div>
        <p class="upload-text">
          <span v-if="drag">拖放文件到此处 或</span>
          点击选择文件
        </p>
        <!--<button class="upload-btn">选择文件</button>-->
      </slot>

      <input
        ref="fileInput"
        type="file"
        class="file-input"
        :multiple="multiple"
        :accept="accept"
        @change="onFileInputChange">
    </div>

    <!-- 文件列表 -->
    <div class="upload-list">
      <div v-if="files.length === 0" class="empty-state">
        暂无文件，请添加文件进行上传
      </div>

      <div v-for="file in files" :key="file.id" class="upload-item">
        <div class="file-preview" @click="previewImage(file)">
          <slot name="file-preview">
            <img v-if="file.previewUrl" :src="file.previewUrl" :alt="file.name">
            <div v-else class="file-icon">
              {{ getFileIcon(file.name) }}
            </div>
          </slot>
        </div>
        <div class="file-info">
          <dl class="file-name">
            <dt>{{ file.name }}</dt>

            <dd v-if="file.directory" style="font-size: 11px; color: #888;">
              ({{ file.directory }})
            </dd>
            <dd class="status-badge" :class="getStatusClass(file.status)">
              {{ getStatusText(file.status) }}
              <span v-if="file.useChunked && file.status === 'uploading'">
                ({{ file.currentChunk + 1 }}/{{ file.chunks }})
              </span>
            </dd>
          </dl>
          <!--<div class="file-details">
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span v-if="file.status === 'uploading'">
              速度: {{ file.speed }}/s, 剩余: {{ file.remainingTime }}
            </span>
            <span v-if="file.useChunked && file.status !== 'pending'">
              (分片上传)
            </span>
          </div>-->
          <div class="progress-container">
            <div
              class="progress-bar"
              :style="{ width: file.progress + '%' }">
            </div>
          </div>
          <div class="upload-stats" v-if="showUploadStats">
            <span class="upload-percent">{{ file.progress.toFixed(1) }}%</span>
            <span class="upload-speed" v-if="file.status === 'uploading' && showUploadSpeed">
              速度: {{ file.speed }}/s, 剩余: {{ file.remainingTime }},
            </span>
            <span v-if="file.size" class="file-size">{{ formatFileSize(file.loaded) }}/{{ formatFileSize(file.size) }}</span>
          </div>
        </div>
        <div class="file-actions">
          <button
            v-if="file.status === 'pending' || file.status === 'paused' || file.status === 'error' || file.status === 'cancelled'"
            class="file-action-btn"
            title="开始上传"
            @click="uploadFile(file.id)">
            <!--⬆️-->
            <slot name="action-upload-button">
              <svg viewBox="64 64 896 896" focusable="false" data-icon="upload" width="1em" height="1em"
                   fill="currentColor" aria-hidden="true">
                <path
                  d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 00-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
              </svg>
            </slot>
          </button>
          <!-- 分片上传显示暂停按钮，单文件上传不显示 -->
          <button
            v-if="file.useChunked && file.status === 'uploading'"
            class="file-action-btn"
            title="暂停上传"
            @click="pauseUpload(file.id)">
            <!--⏸️-->
            <slot name="action-upload-button">
              <svg viewBox="64 64 896 896" focusable="false" data-icon="pause" width="1em" height="1em"
                   fill="currentColor" aria-hidden="true">
                <path
                  d="M304 176h80v672h-80zm408 0h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z"></path>
              </svg>
            </slot>

          </button>
          <button
            v-if="file.status === 'uploading' || file.status === 'checking'"
            class="file-action-btn"
            title="取消上传"
            @click="cancelUpload(file.id)">
            <!--❌-->
            <slot name="action-cancel-button">
              <svg fill-rule="evenodd" viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em"
                   height="1em" fill="currentColor" aria-hidden="true">
                <path
                  d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
              </svg>
            </slot>
          </button>
          <button
            class="file-action-btn"
            title="移除文件"
            @click="removeFile(file.id)">
            <!--🗑️-->
            <slot name="action-remove-button">
              <svg viewBox="64 64 896 896" focusable="false" data-icon="delete" width="1em" height="1em"
                   fill="currentColor" aria-hidden="true">
                <path
                  d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
              </svg>
            </slot>
          </button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="upload-actions">
      <div class="left-actions">
        <button class="action-btn remove-all-btn" @click="removeAll">移除全部</button>
        <button class="action-btn cancel-btn" @click="cancelAll">取消全部</button>
        <!-- 仅分片上传时显示暂停全部按钮 -->
        <button
          v-if="useChunkedUpload"
          class="action-btn cancel-btn"
          @click="pauseAll">
          暂停全部
        </button>
      </div>
      <div class="right-actions">
        <button class="action-btn upload-all-btn" @click="uploadAll">上传全部</button>
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
  getFileIcon
} from './upload-utils.js';

// 导入图片预览组件
import ImagePreviewer from './ImagePreviewer.vue';

export default {
  name: 'FileUploader',
  components: {
    ImagePreviewer
  },
  props: {
    chunkSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 默认5MB
    },
    maxConcurrentUploads: {
      type: Number,
      default: 3
    },
    uploadUrl: {
      type: String,
      default: '/api/upload'
    },
    beforeUpload: {
      type: Function
    },
    fileChange: {
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
    showUploadStats: { // 是否显示上传状态信息
      type: Boolean,
      default: true
    },
    showUploadSpeed: { // 是否显示上传速度
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      files: [],
      isDragging: false,

      // 批次控制
      batchFileCount: 3, // 每批上传文件数
      batchChunkCount: 5, // 每批上传分片数

      // 上传队列
      fileUploadQueue: [],
      chunkUploadQueue: [],
      activeFileUploads: 0,
      activeChunkUploads: 0,

      useChunkedUpload: false,
      chunkSizeThreshold: 10 * 1024 * 1024, // 10MB以上使用分片上传

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
    remainingFileSlots () {
      return this.batchFileCount - this.activeFileUploads;
    },

    // 计算剩余可上传的分片数
    remainingChunkSlots () {
      return this.batchChunkCount - this.activeChunkUploads;
    }
  },
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
      let {
        multiple,
        limit,
        maxSize,
        accept
      } = this;
      let fileErrorEventName = 'file-error';
      // 将files(FileList)转换成普通数组，在循环中有异步操作时files会被清空，导致只有第1个文件能加进去
      let fileList = [...files];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (multiple) {
          if (limit && limit > 0 && this.files.length >= limit) {
            // 检查文件数量限制
            this.$emit(fileErrorEventName, {
              type: 'limit',
              message: `文件数量超过限制，最多允许上传 ${this.limit} 个文件`,
              limit: limit,
              currentCount: this.files.length,
              // newFilesCount: files.length
            });
            return;
          }
          // 检查文件大小限制
          if (maxSize && maxSize > 0 && file.size > maxSize) {
            this.$emit(fileErrorEventName, {
              type: 'maxSize',
              message: `文件 "${file.name}" 大小(${this.formatFileSize(file.size)})超过限制，最大允许: ${this.formatFileSize(maxSize)}`,
              file: file,
              maxSize: maxSize,
              fileSize: file.size
            });
            continue;
          }
          // 检查文件类型
          if (accept && !this.isFileTypeAccepted(file)) {
            this.$emit(fileErrorEventName, {
              type: 'accept',
              message: `文件 "${file.name}" 类型不被支持`,
              file: file,
              accept: accept
            });
            continue;
          }
        }

        // 检查是否是文件夹
        const isDirectory = file.webkitRelativePath && file.webkitRelativePath.includes('/');
        const directory = isDirectory ? file.webkitRelativePath.split('/')[0] : '';

        // 调用 file-change prop 进行文件验证
        let shouldAddFile = true;
        let outFileCheckPromise = Promise.resolve(true);
        if (typeof this.fileChange === 'function') {
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
          const previewUrl = await generatePreviewUrl(file);
          this.addFile(file, directory, previewUrl);
        }
      }
    },

    // 检查文件类型是否被接受
    isFileTypeAccepted (file) {
      if (!this.accept) {
        return true;
      }

      const acceptTypes = this.accept.split(',').map(type => type.trim());

      for (const acceptType of acceptTypes) {
        if (this.matchFileType(file, acceptType)) {
          return true;
        }
      }

      return false;
    },

    // 匹配文件类型
    matchFileType (file, acceptType) {
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
        const fileName = file.name.toLowerCase();

        // 直接匹配完整文件名后缀
        if (fileName.endsWith(acceptType.toLowerCase())) {
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

    // 添加文件到上传列表
    addFile (file, directory = '', previewUrl = null) {
      const fileId = this.generateFileId();
      const fileData = {
        id: fileId,
        file: file,
        name: file.name,
        size: file.size,
        directory: directory,
        previewUrl: previewUrl,
        progress: 0,
        loaded: 0,
        status: 'pending', // pending, checking, uploading, completed, error, cancelled, paused
        speed: '0 B',
        remainingTime: '--',
        startTime: null,
        useChunked: this.useChunkedUpload && file.size > this.chunkSizeThreshold,
        chunks: Math.ceil(file.size / this.chunkSize),
        currentChunk: 0,
        uploadedChunks: 0,
        xhr: null,
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
        lastSpeedUpdateTime: null
      };

      if (!this.multiple) {
        this.files = [fileData];
        this.fileUploadQueue = [];
        this.cancelFunctions = new Map();
      } else {
        this.files.push(fileData);
      }

      this.$emit('file-added', fileData);

      return fileId;
    },

    // 生成文件ID
    generateFileId () {
      return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 上传文件
    async uploadFile (fileId) {
      const fileData = this.getFileById(fileId);
      if (!fileData) return;

      // 如果文件是从暂停状态恢复，保持已上传的分片信息
      if (fileData.status === 'paused' || fileData.status === 'cancelled' || fileData.status === 'error') {
        fileData.status = 'uploading';
        fileData.startTime = Date.now();
        fileData.lastUpdateTime = Date.now();
        fileData.lastUploadedBytes = fileData.loaded;
        fileData.speedSamples = [];
        fileData.lastSpeedUpdateTime = null;

        if (fileData.useChunked) {
          // 重新开始分片上传
          await this.uploadFileWithChunks(fileData);
        } else {
          // 单文件上传
          await this.uploadSingleFile(fileData);
        }
      } else if (fileData.status === 'pending') {
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
            this.$emit('file-upload-error', { file: fileData, error: error.message });
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
      while (this.fileUploadQueue.length > 0 && this.activeFileUploads < this.batchFileCount) {
        const fileId = this.fileUploadQueue.shift();
        const fileData = this.getFileById(fileId);

        if (!fileData || fileData.status !== 'uploading') continue;

        this.activeFileUploads++;

        try {
          await uploadSingleFile({
            fileData: fileData,
            file: fileData.file,
            onProgress: (progress) => {
              fileData.progress = progress.progress;
              fileData.loaded = progress.loaded;
              fileData.speed = progress.speed;
              fileData.remainingTime = progress.remainingTime;
              this.$emit('file-upload-progress', fileData);
            },
            onComplete: () => {
              fileData.status = 'completed';
              fileData.progress = 100;
              this.$emit('file-upload-complete', fileData);
              // 清理取消函数
              this.cancelFunctions.delete(fileData.id);
            },
            onError: (error) => {
              if (error.message !== 'Upload cancelled') {
                fileData.status = 'error';
                this.$emit('file-upload-error', { file: fileData, error: error });
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
      if (typeof this.beforeUpload === 'function') {
        beforeUploadPromise = this.beforeUpload(fileData);
      }
      return beforeUploadPromise.then(() => {
        // 初始化分片队列（只上传未完成的分片）
        fileData.chunkQueue = this.buildChunkQueue(fileData);
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
      // 检查文件是否被暂停或取消
      if (fileData.status === 'paused' || fileData.status === 'cancelled') {
        return;
      }

      while (fileData.chunkQueue.length > 0 &&
      fileData.activeChunks < this.batchChunkCount &&
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
            if (fileData.uploadedChunks >= fileData.chunks) {
              fileData.status = 'completed';
              fileData.progress = 100;
              fileData.loaded = fileData.size;
              fileData.speed = '0 B';
              fileData.remainingTime = '0秒';
              this.$emit('file-upload-complete', fileData);
              // 清理取消函数
              this.cancelFunctions.delete(fileData.id);
              this.chunkCancelFunctions.delete(fileData.id);
            }
          })
          .catch(error => {
            if (error.message === 'Upload cancelled' || error.message === 'Upload paused') {
              // 取消或暂停上传，将分片重新加入队列以便恢复上传
              fileData.chunkQueue.unshift(chunkIndex);
            } else {
              // 上传失败，不自动重试，将分片重新加入队列
              fileData.chunkQueue.unshift(chunkIndex);
              fileData.status = 'error';
              this.$emit('file-upload-error', { file: fileData, error: error });
              // 清理取消函数
              this.cancelFunctions.delete(fileData.id);
              this.chunkCancelFunctions.delete(fileData.id);
            }
          })
          .finally(() => {
            fileData.activeChunks--;
            this.activeChunkUploads--;

            // 如果文件状态仍然是上传中，继续处理队列
            if (fileData.status === 'uploading') {
              this.processChunkUploadQueue(fileData);
            }
          });
      }
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
      fileData.remainingTime = formatTime(remainingTime);

      // 更新记录
      fileData.lastSpeedUpdateTime = currentTime;
      fileData.lastUploadedBytes = currentBytes;
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

          const formData = new FormData();
          formData.append('file', chunk);
          formData.append('fileName', fileData.file.name);
          formData.append('uploadId', fileData.id);
          formData.append('chunkIndex', chunkIndex);
          formData.append('totalChunks', fileData.chunks);

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
            reject(new Error('Network error'));
          });

          xhr.open('POST', 'http://localhost:3001/upload/chunk');
          xhr.send(formData);

        } catch (error) {
          reject(error);
        }
      });
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
      const index = this.files.findIndex(file => file.id === fileId);
      if (index !== -1) {
        // 如果文件正在上传，先取消上传
        if (this.files[index].status === 'uploading' || this.files[index].status === 'checking') {
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
        pending: '等待上传',
        checking: '检查中...',
        uploading: '上传中',
        completed: '上传完成',
        error: '上传失败',
        cancelled: '已取消',
        paused: '已暂停'
      };

      return statusMap[status] || status;
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
      if (!isImageFile(fileData.file)) {
        this.currentPreviewImageUrl = '';
        return;
      }
      // 直接使用已生成的预览URL
      const imageUrl = fileData.previewUrl || '';
      this.currentPreviewImageUrl = imageUrl;
      this.currentPreviewImageName = fileData.name || '预览图片';
      this.showPreview = true;
    },

    closePreview () {
      this.showPreview = false;
      this.currentPreviewImageUrl = '';
      this.currentPreviewImageName = '';
    },

    // 工具函数
    formatFileSize,
    getFileIcon
  }
};
</script>

<style lang="scss">
@import "uploader.scss";
</style>
