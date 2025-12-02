<template>
  <FileUploader
    :chunk-size="2 * 1024 * 1024"
    :max-concurrent-uploads="3"
    :request-handler="requestHandler"
    drag
    :show-file-list="false"
    :show-upload-action-bar="false"
    accept="image/*"
    @file-added="onFileAdded">
    <template #default="{files}">
      <div v-if="files.length > 0">
        <img :src="files[0].previewUrl" style="width: 120px;height: 120px;object-fit: contain;" alt="">
      </div>

      <div v-else class="upload-icon">
        <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
          <path
            d="M544.768 856.064V659.456h131.072L512 462.848 348.16 659.456h131.072v196.608H315.392v-2.048l-16.384 2.048c-69.632-2.048-127.488-26.112-173.568-72.192S55.296 679.936 53.248 610.304c1.364992-64.171008 22.356992-118.612992 62.976-163.328S208.555008 375.808 271.36 367.616c12.288-59.392 40.448-107.179008 84.48-143.36s96.084992-54.955008 156.16-56.32c60.075008 1.364992 112.128 20.139008 156.16 56.32S740.352 308.224 752.64 367.616c62.804992 8.192 114.516992 34.644992 155.136 79.36S969.387008 546.132992 970.752 610.304c-2.048 69.632-26.112 127.488-72.192 173.568S794.624 854.016 724.992 856.064l-16.384-2.048v2.048H544.768z"></path>
        </svg>
      </div>
    </template>
  </FileUploader>
</template>

<script>
import FileUploader from '@/components/uploader/FileUploader.vue'

export default {
  name: "UploadAvatar",
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
};
</script>
