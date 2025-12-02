<template>
  <!-- Default 列表样式 -->
  <div
    class="upload-list list-type-default">
    <div
      v-for="file in files"
      :key="file.id"
      class="upload-item"
      :class="[getStatusClass(file.status), simpleFileItem ? 'is-simple-upload-item' : '']">
      <RenderSlot
        slot-name="file-item"
        :parent-slots="parentSlots"
        :slot-data="file">
        <div class="upload-item-content">
          <div class="file-preview" @click="$emit('file-preview', file)">
            <RenderSlot
              slot-name="file-preview"
              :parent-slots="parentSlots"
              :slot-data="file">
              <img v-if="file.previewUrl" :src="file.previewUrl" :alt="file.name" :title="nbt('nbUploader.clickToPreviewImg'/* 点击查看图片 */)">
              <div v-else class="file-icon">
                <!--{{ getFileIcon(file.name) }}-->
                <img v-if="file.fileIcon.type == 'img'" :src="file.fileIcon.value" :alt="nbt('nbUploader.fileIcon'/* 文件图标 */)">
                <span v-else :title="file.name">{{ file.fileIcon.value }}</span>
              </div>
            </RenderSlot>
            <RenderSlot
              slot-name="file-preview-append"
              :parent-slots="parentSlots"
              :slot-data="file">
            </RenderSlot>
          </div>
          <div class="file-info">
            <dl class="file-name">
              <dt>{{ file.name }}</dt>

              <dd v-if="file.directory" style="font-size: 11px; color: #888;">
                ({{ file.directory }})
              </dd>
              <!--<dd class="status-badge" :class="getStatusClass(file.status)">-->
              <dd class="status-badge">
                {{ getStatusText(file.status) }}
                <!--<span v-if="file.useChunked && file.status === 'uploading'">
                  ({{ file.currentChunk + 1 }}/{{ file.chunks }})
                </span>-->
              </dd>
            </dl>
            <div v-if="!simpleFileItem || (simpleFileItem && file.status === 'uploading')" class="file-upload-progress-bar">
              <RenderSlot
                slot-name="file-upload-progress"
                :parent-slots="parentSlots"
                :slot-data="file">
                <div class="progress-container">
                  <div
                    class="progress-bar"
                    :style="{ width: file.progress + '%' }">
                  </div>
                  <span class="progress-percent"> {{ file.progress }}<b>%</b> </span>
                </div>
              </RenderSlot>

            </div>

            <div class="upload-stats" v-if="showUploadStats && !simpleFileItem">
              <span class="upload-percent">{{ file.progress.toFixed(1) }}%</span>
              <span class="upload-speed" v-if="file.status === 'uploading' && showUploadSpeed">
                {{ nbt('nbUploader.speed')/* 速度 */ }}: {{ file.speed }}/s, {{ nbt('nbUploader.remaining')/* 剩余 */ }}: {{ file.remainingTime }},
              </span>
              <span v-if="file.size" class="file-size">{{ formatFileSize(file.loaded) }}/{{
                  formatFileSize(file.size)
                }}</span>
            </div>
          </div>
          <div class="file-actions">
            <button
              v-if="uploadBtnVisibleStatus.includes(file.status)"
              class="file-action-btn file-upload-btn"
              :title="nbt('nbUploader.startUpload'/* 开始上传 */)"
              @click="uploadFile(file.id)">
              <!--<slot name="action-upload-button">
                <IconUpload></IconUpload>
              </slot>-->
              <RenderSlot
                slot-name="file-list-upload-btn"
                :parent-slots="parentSlots"
                :slot-data="file">
                <IconUpload></IconUpload>
              </RenderSlot>
            </button>
            <button
              v-if="(file.useChunked && file.status === 'uploading') && showPauseButton"
              class="file-action-btn file-pause-btn"
              :title="nbt('nbUploader.pauseUpload'/* 暂停上传 */)"
              @click="pauseUpload(file.id)">
              <!--<slot name="action-pause-button">
                <IconPause></IconPause>
              </slot>-->
              <RenderSlot
                slot-name="file-list-pause-btn"
                :parent-slots="parentSlots"
                :slot-data="file">
                <IconPause></IconPause>
              </RenderSlot>
            </button>
            <button
              v-if="(file.status === 'uploading' || file.status === 'checking') && showCancelButton"
              class="file-action-btn"
              :title="nbt('nbUploader.cancelUpload'/* 取消上传 */)"
              @click="cancelUpload(file.id)">
              <!--<slot name="action-cancel-button">
                <IconClose></IconClose>
              </slot>-->
              <RenderSlot
                slot-name="file-list-cancel-btn"
                :parent-slots="parentSlots"
                :slot-data="file">
                <IconClose></IconClose>
              </RenderSlot>
            </button>
            <button
              v-if="showRemoveButton"
              class="file-action-btn file-remove-btn"
              :title="nbt('nbUploader.removeFile'/* 移除文件 */)"
              @click="removeFile(file.id)">
              <!--<slot name="action-remove-button">
                <IconDelete></IconDelete>
              </slot>-->
              <RenderSlot
                slot-name="file-list-remove-btn"
                :parent-slots="parentSlots"
                :slot-data="file">
                <IconDelete></IconDelete>
              </RenderSlot>
            </button>
            <RenderSlot
              slot-name="file-action-append"
              :parent-slots="parentSlots"
              :slot-data="file">
            </RenderSlot>
          </div>
          <RenderSlot
            slot-name="file-append"
            :parent-slots="parentSlots"
            :slot-data="file">
          </RenderSlot>
        </div>

      </RenderSlot>
    </div>
  </div>
</template>

<script>
import IconUpload from '@/components/svg-icons/IconUpload.vue';
import IconDelete from '@/components/svg-icons/IconDelete.vue';
import IconClose from '@/components/svg-icons/IconClose.vue';
import IconPause from '@/components/svg-icons/IconPause.vue';
import RenderSlot from './RenderSlot.js';
import { uploaderListProps } from './upload-list-props';
import LocaleMixin from '@/components/uploader/locale/localeMixin';

export default {
  name: "UploadListDefault",
  components: {
    IconUpload,
    IconDelete,
    IconClose,
    IconPause,
    RenderSlot
  },
  mixins: [LocaleMixin],
  props: {
    ...uploaderListProps
  },
  data () {
    return {
      uploadBtnVisibleStatus: ['pending', 'paused', 'error', 'cancelled']
    }
  }
};
</script>

<style lang="scss">
.list-type-default{
  max-height: 400px;
  overflow-y: auto;
  &:not(:empty) {
    margin-top: 20px;
  }

  .upload-item {
    padding: 12px;
    border-bottom: 1px solid #eee;
    transition: background 0.2s;
    &.status-pending {
      &:hover{
        background: #f9f9f9;
      }
      .status-badge{
        background-color: #ddd7d7;
      }
    }

    &.status-uploading {
      .status-badge{
        background-color: #abd5f3;
      }
    }

    &.status-completed {
      .status-badge{
        background-color: #cad9cc;
      }
    }

    &.status-error {
      .status-badge{
        background-color: #ebc6cc;
      }
    }

    &.status-paused {
      .status-badge{
        background-color: #f9e1bb;
      }
    }

    &.status-checking {
      .status-badge{
        background-color: #f9eab8;
      }
    }


    &:hover{
      .file-actions{
        opacity: 1;
      }
    }
  }

  .upload-item-content{
    position: relative;
    display: flex;
    align-items: flex-start;
  }

  .file-preview {
    width: 60px;
    height: 60px;
    margin-right: 12px;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .file-preview:hover {
    transform: scale(1.05);
  }

  .file-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  .file-icon {
    color: #6a11cb;
    font-size: 24px;
  }

  .file-info {
    flex: 1;
  }

  .file-name {
    display: flex;
    flex-wrap: wrap;
    font-weight: 600;
    margin: 0 0 5px 0;
    word-break: break-all;
    font-size: 16px;
  }

  .file-name dt {
    text-align: left;
  }

  .file-details {
    display: flex;
    font-size: 12px;
    color: #777;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }

  .file-upload-progress-bar{
    margin-top: 8px;
  }

  .progress-container {
    width: 100%;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
    .progress-percent{
      display: none;
    }
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #6a11cb, #2575fc);
    border-radius: 3px;
    transition: width 0.3s;
    width: 0%;
  }

  .upload-stats {
    display: flex;
    //justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #777;
    margin-top: 5px;
  }

  .upload-stats .upload-percent{
    margin-right: auto;
  }

  .upload-stats .upload-speed,
  .upload-stats .file-size{
    margin-left: 6px;
  }

  .file-actions {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.25s;
  }

  .file-action-btn {
    background: none;
    line-height: 0;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .file-action-btn:hover {
    background: #f0f0f0;
  }

  .file-remove-btn{
    color: #f00;
  }

  .upload-item {
    &.is-simple-upload-item{
      .file-preview{
        width: 30px;
        height: 30px;
      }
      .file-info{
        display: flex;
        flex-direction: column;
        align-self: stretch;
        justify-content: center;
      }
      .file-name{
        margin-bottom: 0;
        font-size: 14px;
      }
      .file-upload-progress-bar{
        margin-top: 4px;
      }
      .file-icon{
        font-size: 22px;
      }
      /*.progress-container{
        height: 4px;
      }*/
      /*.file-action-btn{
        font-size: 14px;
      }*/
    }
  }
}
</style>
