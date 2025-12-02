<template>
  <FileUploader
    :request-handler="requestHandler"
    :respond-handler="respondHandler"
    @file-added="onFileAdded">
    <template #file-list-upload-btn="{file}">
      <span>上传 <small>({{ file.name }})</small></span>
    </template>
    <template #file-list-remove-btn>
      <span>删除</span>
    </template>
  </FileUploader>
</template>

<script>
import FileUploader from '@/components/uploader/FileUploader.vue'

export default {
  name: "CustomFileItemUploadBtn",
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
      /* let formData = new FormData();
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
      } */
    },
    /**
     *  请求响应处理器
     * @param fileData
     * @returns {Promise<never>}
     */
    respondHandler (fileData) {
      console.log('respondHandler', fileData);
    }
  }
}
</script>
