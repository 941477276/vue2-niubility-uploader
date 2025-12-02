<template>
<div class="demo-edit-image">
    <FileUploader
      ref="uploaderRef"
      :before-remove="onBeroreRemoveFile"
      :request-handler="requestHandler"
      :file-change="onFileChange"
      accept="image/*"
      multiple
      @file-added="onFileAdded"
      @file-upload-error="onFileError">
    </FileUploader>

    <dialog class="image-edit-dialog" ref="modalDialogRef">
      <div class="dialog-header">
        <h2 style="margin: 0;">模态对话框</h2>
      </div>
      <div class="dialog-content">
        <VueCropper
          class="vue-cropper"
          v-if="showvueCropper"
          ref="cropperRef"
          :src="cropperImgSrc"
          preview=".cropper-preview">
        </VueCropper>

        <div class="img-operate-area">
          <dl>
            <dt>预览</dt>
            <dd>
              <div class="cropper-preview">
                <img :src="cropperImgSrc" alt="预览">
              </div>
            </dd>
          </dl>
          <button @click.prevent="cropperRotate(-1)">逆时针旋转(-1d)</button>
          <button @click.prevent="cropperRotate(1)">顺时针旋转(+1d)</button>
          <button @click.prevent="cropperFlipX">水平翻转</button>
          <button @click.prevent="cropperFlipY">垂直翻转</button>
          <button @click="cropperReset">重置</button>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="close-btn" :disabled="loading" @click="dialogCancel">取消</button>
        <button :disabled="loading" @click="dialogConfirm">{{ loading ? '正在操作中...' : '确定' }}</button>
      </div>
    </dialog>
</div>
</template>

<script >
import VueCropper from 'vue-cropperjs';
import FileUploader from '@/components/uploader/FileUploader.vue';

// 生成文件预览URL
const generatePreviewUrl = function (file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('file is not a image!'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

export default {
  name: "DemoEditImage",
  components: {
    FileUploader,
    VueCropper
  },
  data () {
    return {
      showvueCropper: false,
      loading: true,
      cropperImgSrc: '',
      cropperPreview: '',
      cropperRotateDeg: 0,
      flipXDir: 1,
      flipYDir: 1,

      dialogFile: null,
      dialogImgPreviewUrl: ''
    };
  },
  methods: {
    onFileChange (file) {
      console.log('onFileChange', file);
      this.$nextTick(() => {
        // 显示图片编辑弹窗
        this.showImageEditorDialog(file);
      });
      // 选择文件时不自定加入文件列表，后面手动加入
      return false;
    },
    onFileAdded (file) {
      console.log('文件添加:', file);
    },
    onFileError (error) {
      console.error('上传错误:', error);
    },
    /**
     * 文件校验出错
     * @param errorInfo
     */
    onFileExceed (errorInfo) {
      console.log('文件校验出错', errorInfo);
      alert(errorInfo.message);
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
        name
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
    },
    /**
     *  请求响应处理器
     * @param fileData
     * @returns {Promise<never>}
     */
    respondHandler (fileData) {
      console.log('respondHandler', fileData);
      // return Promise.reject('abc');
    },
    onBeroreRemoveFile (fileData) {
      return new Promise(function (resolve, reject) {
        var res = window.confirm(`确定要移除“${fileData.name}”文件吗？`);
        return res ? resolve() : reject(res);
      });
    },
    // 显示图片编辑弹窗
    showImageEditorDialog (file) {
      this.dialogFile = file;
      this.loading = true;
      generatePreviewUrl(file)
        .then(res => {
          this.dialogImgPreviewUrl = res;
          this.cropperImgSrc = res;
          this.$refs.modalDialogRef.showModal();
          this.$nextTick(() => {
            this.showvueCropper = true;
            this.loading = false;
          });
        })
        .catch((error) => {
          this.loading = false;
          alert(error.message);
        });
    },
    dialogCancel () {
      console.log('弹窗关闭了');
      this.loading = true;
      this.addFileToUploader(this.dialogFile);
      this.$refs.modalDialogRef.close();
      this.dialogFile = null;
      this.dialogImgPreviewUrl = '';
      this.cropperImgSrc = '';
      this.showvueCropper = false;
      this.loading = false;
    },
    dialogConfirm () {
      this.loading = true;
      this.addFileToUploader(this.cropperGetImageData());
      this.$refs.modalDialogRef.close();
      this.dialogFile = null;
      this.dialogImgPreviewUrl = '';
      this.cropperImgSrc = '';
      this.showvueCropper = false;
      this.loading = false;
    },
    // 将文件添加到上传器
    addFileToUploader (fileData) {
      let dialogFile = this.dialogFile;
      this.$refs.uploaderRef.addFile({
        name: dialogFile.name,
        type: dialogFile.type,
        file: fileData,
        previewUrl: typeof fileData == 'string' ? fileData : '',
        extendData: {
          originalImageData: this.dialogImgPreviewUrl
        }
      });
    },
    cropperGetImageData () {
      let base64Img = this.$refs.cropperRef.getCroppedCanvas().toDataURL();
      console.log('cropperGetImageData', base64Img);
      return base64Img;
    },
    cropperReset() {
      this.$refs.cropperRef.reset();
    },
    cropperRotate(degIncrements) {
      let deg = this.cropperRotateDeg + (degIncrements || 1);
      if (deg > 360) {
        deg = 360;
      } else if (deg < -360) {
        deg = -360;
      }
      this.cropperRotateDeg = deg;
      this.$refs.cropperRef.rotate(deg);
    },
    cropperFlipX() {
      let scale = this.flipXDir;
      scale = scale ? -scale : -1;
      this.$refs.cropperRef.scaleX(scale);
      this.flipXDir = scale;
    },
    cropperFlipY() {
      let scale = this.flipYDir;
      scale = scale ? -scale : -1;
      this.$refs.cropperRef.scaleY(scale);
      this.flipYDir = scale;
    },
    // showDialog
  }
}
</script>

<style lang="scss" scoped>
.image-edit-dialog {
  border: none;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 768px;
}

.image-edit-dialog::backdrop {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
}

.dialog-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 15px 30px;
  border-radius: 12px 12px 0 0;
}

.dialog-header h2 {
  font-size: 18px;
}

.dialog-content {
  //display: flex;
  padding: 20px 30px;
}
dialog button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  outline: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}
.vue-cropper{
  flex: 1;
  height: 420px;
}
.img-operate-area{
  padding-top: 15px;
  dl{
    display: inline-block;
    margin: 0;
  }
  dt{
    font-weight: bold;
  }
  dd{
    margin: 5px 0 15px 25px;
  }
  button{
    display: inline-block;
    vertical-align: bottom;
    margin-left: 15px;
    margin-bottom: 15px;
  }
}
.cropper-preview{
  width: 120px;
  height: 200px;
  overflow: hidden;
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.close-btn {
  background: #6c757d;
}

.close-btn:hover {
  background: #5a6268;
}
</style>
