<template>
  <!-- Default 列表样式 -->
  <div class="upload-list list-type-picture-card">
    <div
      v-for="file in files"
      :key="file.id"
      class="picture-card-item"
      :class="getStatusClass(file.status)">
      <RenderSlot
        slot-name="file-item"
        :parent-slots="parentSlots"
        :slot-data="file">
        <div class="picture-card-item-content">
          <div class="picture-card-preview">
            <div class="file-preview">
              <RenderSlot
                slot-name="file-preview"
                :parent-slots="parentSlots"
                :slot-data="file">
                <img v-if="file.previewUrl" :src="file.previewUrl" :alt="file.name">
                <div v-else class="picture-card-icon">
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
            <div class="picture-card-overlay">
              <div class="picture-card-actions">
                <button
                  v-if="file.previewUrl"
                  class="picture-card-action-btn picture-card-preview-btn"
                  :title="nbt('nbUploader.clickToPreviewImg'/* 点击查看图片 */)"
                  @click.stop="$emit('file-preview', file)">
                  <RenderSlot
                    slot-name="file-list-preview-btn"
                    :parent-slots="parentSlots"
                    :slot-data="file">
                    <IconEye></IconEye>
                  </RenderSlot>
                </button>
                <button
                  v-if="file.status === 'pending' || file.status === 'paused' || file.status === 'error' || file.status === 'cancelled'"
                  class="picture-card-action-btn picture-card-upload-btn"
                  :title="nbt('nbUploader.startUpload'/* 开始上传 */)"
                  @click.stop="uploadFile(file.id)">
                  <RenderSlot
                    slot-name="file-list-upload-btn"
                    :parent-slots="parentSlots"
                    :slot-data="file">
                    <IconUpload></IconUpload>
                  </RenderSlot>
                </button>
                <button
                  v-if="(file.status === 'uploading' || file.status === 'checking') && showCancelButton"
                  class="picture-card-action-btn picture-card-cancel-btn"
                  :title="nbt('nbUploader.cancelUpload'/* 取消上传 */)"
                  @click.stop="cancelUpload(file.id)">
                  <RenderSlot
                    slot-name="file-list-cancel-btn"
                    :parent-slots="parentSlots"
                    :slot-data="file">
                    <IconClose></IconClose>
                  </RenderSlot>
                </button>
                <button
                  v-if="showRemoveButton"
                  class="picture-card-action-btn picture-card-delete-btn"
                  :title="nbt('nbUploader.removeFile'/* 移除文件 */)"
                  @click.stop="removeFile(file.id)">
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
            </div>
            <div class="picture-card-progress" datav-if="file.status === 'uploading'">
              <RenderSlot
                slot-name="file-upload-progress"
                :parent-slots="parentSlots"
                :slot-data="file">
                <div class="picture-card-progress-default">
                  <div class="progress-container">
                    <div
                      class="progress-bar"
                      :style="{ width: file.progress + '%' }">
                    </div>
                  </div>
                  <div class="picture-card-progress-text">
                    {{ file.progress.toFixed(1) }}%
                  </div>
                </div>
              </RenderSlot>
            </div>
            <div class="picture-card-status" :class="getStatusClass(file.status)">
              {{ getStatusText(file.status) }}
            </div>
          </div>
          <div class="picture-card-info">
            <div class="picture-card-name" :title="file.name">{{ file.name }}</div>
            <div class="picture-card-size" v-if="file.size">
              {{ formatFileSize(file.loaded) }}/{{ formatFileSize(file.size) }}
            </div>
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
import IconEye from '@/components/svg-icons/IconEye.vue';
import IconUpload from '@/components/svg-icons/IconUpload.vue';
import IconDelete from '@/components/svg-icons/IconDelete.vue';
import IconClose from '@/components/svg-icons/IconClose.vue';
import RenderSlot from './RenderSlot.js';
import { uploaderListProps } from './upload-list-props';
import LocaleMixin from '@/components/uploader/locale/localeMixin';

export default {
  name: "UploadListPictureCard",
  components: {
    IconEye,
    IconUpload,
    IconDelete,
    IconClose,
    RenderSlot
  },
  mixins: [LocaleMixin],
  props: {
    ...uploaderListProps
  },
  data () {
    return {};
  }
};
</script>

<style lang="scss">
.file-uploader {
  &.picture-card {
    display: inline-block;

    .upload-area {
      display: inline-block;
      vertical-align: top;
    }
  }
}

.list-type-picture-card {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
  //padding: 0 20px;
  //margin: 20px 0;
  margin-right: 20px;
  max-height: none;
  overflow-y: visible;

  &.file-list-empty {
    margin-right: 0;
  }

  .file-preview {
    padding: 0 10px;
  }
}

.picture-card-item {
  width: 120px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  background: #fff;
  position: relative;

  &.status-uploading {
    border-color: #1890ff;
  }

  &.status-completed {
    border-color: #52c41a;
    .picture-card-progress{
      opacity: 0;
    }
  }

  &.status-error {
    border-color: #ff4d4f;
  }

  &.status-paused,
  &.status-cancelled {
    border-color: #faad14;
  }

  &:hover {
    border-color: #6a11cb;
    box-shadow: 0 2px 8px rgba(106, 17, 203, 0.1);
    &.status-completed {
      .picture-card-progress{
        opacity: 1;
      }
    }
  }
}

.picture-card-preview {
  position: relative;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.picture-card-icon {
  font-size: 32px;
  color: #6a11cb;
}

.picture-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
}

.picture-card-actions {
  display: flex;
  gap: 8px;
}

.picture-card-action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;

  &:hover {
    background: #fff;
    transform: scale(1.1);
  }
}

.picture-card-delete-btn {
  color: #f00;
}

.picture-card-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  transition: opacity 0.3s;

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
}

.picture-card-progress-text {
  color: #fff;
  font-size: 10px;
  text-align: center;
  margin-top: 2px;
}

.picture-card-status {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.7);
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, .2);
  color: #fff;
}

.picture-card-info {
  padding: 8px;
}

.picture-card-name {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picture-card-size {
  font-size: 11px;
  color: #666;
}

.picture-card-upload-area {
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;

  &:hover,
  &.dragover {
    border-color: #6a11cb;
    background: #f0f5ff;
  }
}

.picture-card-upload-content {
  text-align: center;
  color: #666;
}

.picture-card-upload-text {
  margin-top: 8px;
  font-size: 12px;
}

.upload-area.picture-card-upload {
  width: 120px;
  height: 120px;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d9d9d9;

  .upload-icon {
    font-size: 32px;
    margin-bottom: 0;
  }

  .upload-text {
    margin: 8px 0 0 0;
    font-size: 12px;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .upload-list.list-type-picture-card {
    gap: 12px;
    padding: 0 16px;
  }

  .picture-card-item,
  .picture-card-upload-area {
    width: 100px;
    height: 100px;
  }

  .picture-card-info {
    padding: 6px;
  }

  .picture-card-name {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .upload-list.list-type-picture-card {
    gap: 8px;
    padding: 0 12px;
  }

  .picture-card-item,
  .picture-card-upload-area {
    width: 80px;
    height: 80px;
  }

  .picture-card-icon {
    font-size: 24px;
  }

  .picture-card-upload-text {
    font-size: 10px;
  }
}
</style>
