<template>
  <div>
    <FileUploader
      :before-upload="onBeforeUpload2"
      :request-handler="requestHandler"
      :chunk-upload-completed="onChunkUploadCompleted"
      :chunk-size="1024 * 100"
      :batch-chunk-concurrent-uploads="3"
      :chunk-size-threshold="1024*1024"
      :before-upload-chunk="onBeforeUploadChunk"
      use-chunked-upload
      multiple>
    </FileUploader>
  </div>
</template>

<script>
import FileUploader from '@/components/uploader/FileUploader.vue'

export default {
  name: "BreakpointResume",
  components: { FileUploader },
  data () {
    return {
      uploadedChunkIndexes: '0,3,4,7,10,11,12,15'
    };
  },
  methods: {
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
    /**
     *  请求响应处理器
     * @param fileData
     * @returns {Promise<never>}
     */
    respondHandler (fileData) {
      console.log('respondHandler', fileData);
    },
    onBeforeUpload2 (fileData) {
      if (!fileData.useChunked) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        let uploadedChunkIndexes = [];
        let uploadedChunkIndexesStr = this.uploadedChunkIndexes;
        if (uploadedChunkIndexesStr) {
          uploadedChunkIndexes = uploadedChunkIndexesStr.split(',').map(item => {
            return parseInt(item);
          }).filter(item => !isNaN(item));
        }

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
              // 设置已上传的分片索引，组件在上传分片时会跳过这些已上传的分片
              fileData.setUploadedChunks(fileData.id, uploadedChunkIndexes);
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
    // 分片全部上传完成事件
    onChunkUploadCompleted (fileData) {
      console.log('分片全部上传完成', fileData.name);
      return this.onFileComplete(fileData);
    },
  }
}
</script>
