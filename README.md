# vue2-niubility-uploader

A powerful and highly customizable Vue2 file upload component supporting single/multiple file uploads, large file chunking, resumable uploads, drag & drop, image preview and more.


[中文文档](./README_CN.md)

[Demo and Document (文档)](https://941477276.github.io/vue2-niubility-uploader/dist/#/start)


## ✨ Features

### 🚀 Core Features
- **Single/Multiple File Upload** - Support single or batch file uploads
- **Large File Chunking** - Automatically chunk large files for improved reliability
- **Resumable Upload** - Resume uploads from breakpoints after interruption
- **Drag & Drop Upload** - Support dragging files to designated areas for upload
- **Folder Upload** - Support uploading entire folders (preserving directory structure)
- **Image Preview** - Support real-time preview of image files
- **Upload Progress** - Real-time display of upload progress, speed, and remaining time for each file

### 🎨 UI Features
- **Multiple Display Modes** - Support list mode and card mode
- **Custom Themes** - Customizable styles and themes
- **i18n Support** - Multi-language support (Chinese/English)
- **Responsive Design** - Adapts to various screen sizes
- **Rich Slots** - Provides multiple slots for complete UI customization

### ⚙️ Advanced Configuration
- **Concurrency Control** - Support setting concurrent upload limits
- **File Restrictions** - Support file type, size, and quantity restrictions
- **Request Customization** - Fully customizable upload request handling
- **Lifecycle Hooks** - Rich event callbacks
- **Error Handling** - Comprehensive error handling and retry mechanisms

## 📦 Installation

```bash
# NPM
npm install vue2-niubility-uploader --save

# Yarn
yarn add vue2-niubility-uploader
```

## 🚀 Quick Start

### Global Registration

```javascript
// main.js
import Vue from 'vue';
import Vue2NiubilityUploader from 'vue2-niubility-uploader';
import 'vue2-niubility-uploader/vue2-niubility-uploader.css';

Vue.component(Vue2NiubilityUploader.name, Vue2NiubilityUploader);
```

### Local Registration

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
      console.log('File added:', file);
    },
    onFileProgress(file) {
      console.log('Upload progress:', file);
    },
    onFileComplete(fileData) {
      console.log('Upload complete:', fileData);
    },
    onFileError(error) {
      console.error('Upload error:', error);
    },
    // Request handler - Required
    requestHandler(fileData) {
      const { file, isUploadChunk, chunkIndex, name, fileData: chunkFileData } = fileData;

      if (!isUploadChunk) {
        // Single file upload
        return {
          url: '/api/upload',
          method: 'POST',
          data: {
            file: file,
            name: name
          }
        };
      }

      // Chunked upload
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

## 📖 API Documentation

### Props

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **requestHandler** | Function | - | **Required**, request handler function |
| accept | String | '' | Accepted file types, e.g. 'image/*,.pdf' |
| multiple | Boolean | false | Whether to support multiple file uploads |
| limit | Number | - | Maximum number of uploadable files |
| maxSize | Number | - | Maximum size per file (bytes) |
| drag | Boolean | false | Whether to enable drag & drop upload |
| autoUpload | Boolean | false | Whether to auto-upload |
| disabled | Boolean | false | Whether to disable upload |
| useChunkedUpload | Boolean | false | Whether to enable chunked upload |
| chunkSize | Number | 5*1024*1024 | Chunk size (default 5MB) |
| maxConcurrentUploads | Number | 3 | Maximum concurrent uploads |
| showFileList | Boolean | true | Whether to show file list |
| showUploadSpeed | Boolean | true | Whether to show upload speed |
| showUploadStats | Boolean | true | Whether to show upload statistics |
| listType | String | 'default' | List type: 'default' or 'picture-card' |
| simpleFileItem | Boolean | false | Whether to use simplified file item style |

### Events

| Event Name | Parameters | Description |
|------------|------------|-------------|
| file-added | fileData: FileData | Triggered when file is added |
| file-upload-progress | fileData: FileData | Triggered when upload progress changes |
| file-upload-complete | fileData: FileData | Triggered when upload completes |
| file-upload-error | { fileData, error } | Triggered when upload error occurs |
| file-upload-cancelled | fileData: FileData | Triggered when upload is cancelled |
| file-upload-paused | fileData: FileData | Triggered when upload is paused |
| file-removed | file: File | Triggered when file is removed |
| file-error | errorInfo: ErrorInfo | Triggered when file validation error occurs |

### Slots

| Slot Name | Parameters | Description |
|-----------|------------|-------------|
| default | files: FileData[] | Custom upload area content |
| upload-prepend | files: FileData[] | Prepend content before upload area |
| upload-append | files: FileData[] | Append content after upload area |
| file-item | fileData: FileData | Custom file item content |
| file-preview | fileData: FileData | Custom preview area content |
| file-upload-progress | fileData: FileData | Custom progress bar content |

### FileData Structure

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
  status: 'pending' | 'checking' | 'uploading' | 'completed' | 'error' | 'cancelled' | 'paused';
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

## 🎯 Usage Examples

### 1. Basic Usage

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

### 2. Picture Card Mode

```vue
<template>
  <Vue2NiubilityUploader
    :request-handler="requestHandler"
    list-type="picture-card"
    :limit="9"
    accept="image/*" />
</template>
```

### 3. Chunked Upload

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
        // Initialize chunked upload
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
      // Merge chunks
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

### 4. Custom File Restrictions

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


## 🎨 Theme Customization

### CSS Variables

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

### Custom Styles

```scss
.file-uploader {
  // Custom upload area styles
  .upload-area {
    border: 2px dashed var(--uploader-primary-color);
    background-color: var(--uploader-bg-color);
  }

  // Custom file item styles
  .file-item {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

## 🤝 Contributing

Issues and Pull Requests are welcome!
- GitHub Issues: [Submit Issue](https://github.com/your-repo/vue2-niubility-uploader/issues)


### Development Setup

```bash
# Clone the project
git clone https://github.com/vue2-niubility-uploader/vue2-niubility-uploader.git

# Install dependencies
cd vue2-niubility-uploader
npm install

# Start development server
npm run serve

# Start backend server (for testing)
cd src/node-server
npm install
npm run start
```

## 📄 License

[MIT](LICENSE)

**If this project helps you, please give it a ⭐ Star!**
