<template>
  <FileUploader
    :max-concurrent-uploads="3"
    :before-upload="onBeforeUpload"
    :request-handler="requestHandler"
    drag
    list-type="picture-card"
    :limit="3"
    multiple
    @file-added="onFileAdded"></FileUploader>
</template>

<script>
import FileUploader from '@/components/uploader/FileUploader.vue'

export default {
  name: "PictureCard",
  components: { FileUploader },
  data () {
    return {

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
    }
  }
}
</script>
