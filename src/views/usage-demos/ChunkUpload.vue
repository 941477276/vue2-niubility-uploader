<template>
  <div>
    <div class="upload-options">
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
        <label class="option-label">单个文件分片上传并发数:</label>
        <input
          type="number"
          v-model.number="batchChunkCount"
          min="1"
          max="20"
          class="batch-input">
      </div>
      <div class="option-group">
        <label class="option-label">单个分片大小(M):</label>
        <input
          type="number"
          v-model.number="batchChunkSize"
          min="1"
          class="batch-input">
      </div>
    </div>

    <FileUploader
      :before-upload="onBeforeUpload"
      :before-upload-chunk="onBeforeUploadChunk"
      :chunk-size="batchChunkSize * 1024 * 1024"
      :batch-file-concurrent-uploads="batchFileCount"
      :batch-chunk-concurrent-uploads="batchChunkCount"
      :request-handler="requestHandler"
      use-chunked-upload
      multiple
      @file-added="onFileAdded"
      @file-upload-complete="onFileComplete"></FileUploader>
  </div>
</template>

<script>
import FileUploader from '@/components/uploader/FileUploader.vue'

export default {
  name: "ChunkUpload",
  components: { FileUploader },
  data () {
    return {
      batchFileCount: 3,
      batchChunkCount: 5,
      batchChunkSize: 3,
    };
  },
  methods: {
    onFileAdded (file) {
      console.log('文件添加:', file);
    },
    /**
     * 请求处理器
     * @param fileData
     */
    requestHandler (fileData) {
      console.log('requestHandler', fileData);
      let {
        file,
        isUploadChunk,
        chunk,
        // id,
        chunkIndex,
        name,
        fileData: chunkFileData
      } = fileData;

      if (!isUploadChunk) { // 上传单个文件
        return {
          url: 'http://localhost:3001/upload',
          method: 'POST',
          data: {
            file: file,
            name
          }
        };
      }
      let formData = new FormData();
      formData.append('file', chunk);
      formData.append('fileName', chunkFileData.file.name);
      formData.append('uploadId', chunkFileData.id);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', chunkFileData.chunks);
      formData.append('chunkMd5', fileData.extraData.chunkMd5);
      return { // 上传分片文件
        url: 'http://localhost:3001/upload/chunk',
        method: 'POST',
        data: formData
      }
    },
    /**
     *  请求响应处理器
     * @param fileData
     * @returns {Promise<never>}
     */
    respondHandler (fileData) {
      console.log('respondHandler', fileData);
    },
    onBeforeUpload (fileData) {
      if (!fileData.useChunked) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const data = {
          uploadId: fileData.id,
          fileName: fileData.file.name,
          fileSize: fileData.file.size,
          fileType: fileData.file.type,
        };

        xhr.open('POST', 'http://localhost:3001/upload/init');
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload initialization'));
        });
        xhr.send(JSON.stringify(data));
      });
    },
    onBeforeUploadChunk (chunkData) {
      console.log('chunkData', chunkData);
      return new Promise((resolve) => {
        setTimeout(function () {
          resolve({
            chunkMd5: 'chunk_' + new Date().getTime()
          })
        }, 1000)
      })
    },
    onFileComplete (fileData) {
      console.log('文件上传完成:', fileData);
      return new Promise((resolve, reject) => {
        if (fileData.useChunked) {
          // 分片上传完成后的处理
          const xhr = new XMLHttpRequest();
          const data = {
            uploadId: fileData.id,
            fileName: fileData.file.name,
            fileSize: fileData.file.size,
          };

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error(xhr.statusText));
            }
          });

          xhr.addEventListener('error', () => {
            reject({
              xhr,
              code: xhr.status,
              message: 'Network error'
            });
          });

          xhr.open('POST', 'http://localhost:3001/upload/finalize');
          xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
          xhr.send(JSON.stringify(data));
        } else {
          resolve();
        }
      });
    },
  }
}
</script>


<style lang="scss" scoped>
/* 上传选项布局调整 */
.upload-options {
  display: flex;
  gap: 20px;
  padding: 20px 15px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin: 20px 0;
  flex-wrap: wrap;
  align-items: center;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  font-size: 14px;
  color: #555;
  white-space: nowrap;
}

</style>
