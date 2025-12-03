# vue2-niubility-uploader

一个功能强大、高度可定制的Vue2文件上传组件，支持单文件/多文件上传、大文件分片上传、断点续传、拖拽上传、图片预览等丰富功能。

A powerful and highly customizable Vue2 file upload component supporting single/multiple file uploads, large file chunking, resumable uploads, drag & drop, image preview and more.

[Demo and Document (文档)](https://941477276.github.io/vue2-niubility-uploader/dist/#/start)


## ✨ 特性

### 🚀 核心功能
- **单文件/多文件上传** - 支持单个或批量文件上传
- **大文件分片上传** - 自动将大文件分片上传，提高可靠性
- **断点续传** - 支持上传中断后从断点继续上传
- **拖拽上传** - 支持拖拽文件到指定区域上传
- **文件夹上传** - 支持整个文件夹上传（保持目录结构）
- **图片预览** - 支持图片文件的实时预览
- **上传进度** - 实时显示每个文件的上传进度、速度和剩余时间

### 🎨 界面特性
- **多种展示模式** - 支持列表模式和卡片模式
- **自定义主题** - 可自定义样式和主题
- **国际化支持** - 支持多语言（中文/英文）
- **响应式设计** - 适配各种屏幕尺寸
- **丰富的插槽** - 提供多个插槽支持完全自定义UI

### ⚙️ 高级配置
- **并发控制** - 支持设置并发上传数量
- **文件限制** - 支持文件类型、大小、数量限制
- **请求定制** - 完全可定制的上传请求处理
- **生命周期钩子** - 丰富的事件回调函数
- **错误处理** - 完善的错误处理和重试机制

## 📦 安装

```bash
# NPM
npm install vue2-niubility-uploader --save

# Yarn
yarn add vue2-niubility-uploader
```

## 🚀 快速开始

### 全局注册

```javascript
// main.js
import Vue from 'vue';
import Vue2NiubilityUploader from 'vue2-niubility-uploader';
import 'vue2-niubility-uploader/vue2-niubility-uploader.css';

Vue.component(Vue2NiubilityUploader.name, Vue2NiubilityUploader);
```

### 局部注册

```vue
<template>
  <Vue2NiubilityUploader
    :request-handler="requestHandler"
    @file-added="onFileAdded"
    @file-upload-progress="onFileProgress"
    @file-upload-complete="onFileComplete"
    @file-upload-error="onFileError" />
</template>

<script>
import Vue2NiubilityUploader from 'vue2-niubility-uploader';
import 'vue2-niubility-uploader/vue2-niubility-uploader.css';

export default {
  components: {
    Vue2NiubilityUploader
  },
  methods: {
    onFileAdded(file) {
      console.log('文件添加:', file);
    },
    onFileProgress(file) {
      console.log('上传进度:', file);
    },
    onFileComplete(fileData) {
      console.log('上传完成:', fileData);
    },
    onFileError(error) {
      console.error('上传错误:', error);
    },
    // 请求处理器 - 必须实现
    requestHandler(fileData) {
      const { file, isUploadChunk, chunkIndex, name, fileData: chunkFileData } = fileData;

      if (!isUploadChunk) {
        // 单文件上传
        return {
          url: '/api/upload',
          method: 'POST',
          data: {
            file: file,
            name: name
          }
        };
      }

      // 分片上传
      const formData = new FormData();
      formData.append('file', fileData.chunk);
      formData.append('fileName', chunkFileData.file.name);
      formData.append('uploadId', chunkFileData.id);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', chunkFileData.chunks);

      return {
        url: '/api/upload/chunk',
        method: 'POST',
        data: formData
      };
    }
  }
}
</script>
```

## 📖 API文档

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| **requestHandler** | Function | - | **必填**，请求处理函数 |
| accept | String | '' | 接受的文件类型，如 'image/*,.pdf' |
| multiple | Boolean | false | 是否支持多文件上传 |
| limit | Number | - | 最大上传文件数量 |
| maxSize | Number | - | 单个文件最大大小（字节） |
| drag | Boolean | false | 是否启用拖拽上传 |
| autoUpload | Boolean | false | 是否自动上传 |
| disabled | Boolean | false | 是否禁用上传 |
| useChunkedUpload | Boolean | false | 是否启用分片上传 |
| chunkSize | Number | 5*1024*1024 | 分片大小（默认5MB） |
| maxConcurrentUploads | Number | 3 | 最大并发上传数 |
| showFileList | Boolean | true | 是否显示文件列表 |
| showUploadSpeed | Boolean | true | 是否显示上传速度 |
| showUploadStats | Boolean | true | 是否显示上传统计 |
| listType | String | 'default' | 列表类型：'default' 或 'picture-card' |
| simpleFileItem | Boolean | false | 是否使用简化文件项样式 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| file-added | fileData: FileData | 文件添加时触发 |
| file-upload-progress | fileData: FileData | 上传进度变化时触发 |
| file-upload-complete | fileData: FileData | 上传完成时触发 |
| file-upload-error | { fileData, error } | 上传错误时触发 |
| file-upload-cancelled | fileData: FileData | 上传取消时触发 |
| file-upload-paused | fileData: FileData | 上传暂停时触发 |
| file-removed | file: File | 文件移除时触发 |
| file-error | errorInfo: ErrorInfo | 文件验证错误时触发 |

### Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| default | files: FileData[] | 自定义上传区域内容 |
| upload-prepend | files: FileData[] | 上传区域前置内容 |
| upload-append | files: FileData[] | 上传区域后置内容 |
| file-item | fileData: FileData | 自定义文件项内容 |
| file-preview | fileData: FileData | 自定义预览区域内容 |
| file-upload-progress | fileData: FileData | 自定义进度条内容 |

### FileData 数据结构

```typescript
interface FileData {
  id: string;
  file: File;
  name: string; // File name
  size: number; // File size
  directory: boolean;
  previewUrl: string; // File preview url
  progress: number; // Upload progress
  loaded: number;
  source: 'files' | 'defaultList'; // File source
  // Upload status
  status: 'pending' | 'checking' | 'uploading' | 'completed' | 'error' | 'cancelled' | 'paused;
  speed: string; // Upload speed
  remainingTime: string; // Remaining upload time
  startTime: null | number;
  useChunked: boolean; // Whether to use chunked upload
  chunks: number; // Chunk index list
  currentChunk: number; // Current chunk index
  uploadedChunks: number;
  xhr: null | XMLHttpRequest; // HTTP request
  extendData: Object; // Extension data provided by caller
  chunkQueue: number[]; // Chunk upload queue
  activeChunks: number; // Current active chunk upload count
  uploadedChunkSet: Set<number>; // Record successfully uploaded chunk indexes
  lastUpdateTime: null | number;
  lastUploadedBytes: number;
  chunkProgressMap: Map; // Store real-time upload progress for each chunk
  speedSamples: number[]; // Speed sample array for smooth calculation
  lastSpeedUpdateTime: null | number;
  fileIcon: Object; // File preview icon
}
```

## 🎯 使用示例

### 1. 基础使用

```vue
<template>
  <Vue2NiubilityUploader
    :request-handler="requestHandler"
    multiple
    drag />
</template>

<script>
export default {
  methods: {
    requestHandler({ file, name }) {
      return {
        url: '/api/upload',
        method: 'POST',
        data: { file, name }
      };
    }
  }
}
</script>
```

### 2. 图片卡片模式

```vue
<template>
  <Vue2NiubilityUploader
    :request-handler="requestHandler"
    list-type="picture-card"
    :limit="9"
    accept="image/*" />
</template>
```

### 3. 分片上传

```vue
<template>
  <Vue2NiubilityUploader
    :request-handler="requestHandler"
    :before-upload="onBeforeUpload"
    :chunk-upload-completed="onChunkUploadCompleted"
    use-chunked-upload
    :chunk-size="10*1024*1024" />
</template>

<script>
export default {
  methods: {
    async onBeforeUpload(fileData) {
      if (fileData.useChunked) {
        // 初始化分片上传
        const response = await fetch('/api/upload/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: fileData.file.name,
            fileSize: fileData.file.size
          })
        });
        return response.json();
      }
    },
    async onChunkUploadCompleted(fileData) {
      // 合并分片
      const response = await fetch('/api/upload/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: fileData.id,
          fileName: fileData.file.name
        })
      });
      return response.json();
    }
  }
}
</script>
```

### 4. 自定义文件限制

```vue
<template>
  <Vue2NiubilityUploader
    :request-handler="requestHandler"
    :limit="5"
    :max-size="50*1024*1024"
    accept="image/*,.pdf,.doc,.docx"
    @file-error="onFileError" />
</template>

<script>
export default {
  methods: {
    onFileError(errorInfo) {
      this.$message.error(errorInfo.message);
    }
  }
}
</script>
```


## 🎨 主题定制

### CSS 变量

```css
:root {
  --uploader-primary-color: #409eff;
  --uploader-success-color: #67c23a;
  --uploader-warning-color: #e6a23c;
  --uploader-danger-color: #f56c6c;
  --uploader-border-color: #dcdfe6;
  --uploader-bg-color: #f5f7fa;
}
```

### 自定义样式

```scss
.file-uploader {
  // 自定义上传区域样式
  .upload-area {
    border: 2px dashed var(--uploader-primary-color);
    background-color: var(--uploader-bg-color);
  }

  // 自定义文件项样式
  .file-item {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
- GitHub Issues：[提交问题](https://github.com/your-repo/vue2-niubility-uploader/issues)


### 开发环境搭建

```bash
# 克隆项目
git clone https://github.com/your-repo/vue2-niubility-uploader.git

# 安装依赖
cd vue2-niubility-uploader
npm install

# 启动开发服务器
npm run serve

# 启动后端服务（用于测试）
cd src/node-server
npm install
npm run start
```

## 📄 许可证

[MIT](LICENSE)

**如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！**
