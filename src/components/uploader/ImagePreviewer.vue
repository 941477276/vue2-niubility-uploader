<template>
  <div v-if="show" class="image-preview-modal" @click="handleBackdropClick">
    <div class="preview-content" @click.stop>
      <div class="preview-header">
        <h6 class="preview-title">{{ imageName }}</h6>
        <button class="close-btn" @click="close" :title="nbt('nbUploader.close'/* 关闭 */)">
          ×
        </button>
      </div>
      <div
        class="image-container"
        ref="imageContainer"
        @wheel="handleWheel"
        @mousedown="startDrag"
        @dblclick="handleDoubleClick"
      >
        <div
          class="image-wrapper"
          ref="imageWrapper"
          :style="wrapperStyle"
        >
          <img
            v-if="imageUrl"
            ref="previewImage"
            :src="imageUrl"
            :alt="imageName"
            :style="imageStyle"
            @load="handleImageLoad"
          />
        </div>
        <div v-if="!imageUrl" class="no-image">
          <div class="no-image-icon">🖼️</div>
          <div class="no-image-text">{{ nbt('nbUploader.loadImgError')/* 无法加载图片 */ }}</div>
        </div>
      </div>
      <div class="preview-controls">
        <button class="control-btn" @click="zoomOut" :title="nbt('nbUploader.zoomOut'/* 缩小 */)" :disabled="!imageUrl">
          <!--<span class="control-icon">🔍−</span>-->
          <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M637 443H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h312c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z"></path></svg>
        </button>
        <span class="scale-info">{{ Math.round(scale * 100) }}%</span>
        <button class="control-btn" @click="zoomIn" :title="nbt('nbUploader.zoomIn'/* 放大 */)" :disabled="!imageUrl">
          <!--<span class="control-icon">🔍+</span>-->
          <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M637 443H519V309c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v134H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h118v134c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V519h118c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z"></path></svg>
        </button>
        <button class="control-btn" @click="resetZoom" :title="nbt('nbUploader.resetZoom'/* 重置缩放 */)" :disabled="!imageUrl">
          <!--<span class="control-icon">⭕</span>-->
          <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M511.4 124C290.5 124.3 112 303 112 523.9c0 128 60.2 242 153.8 315.2l-37.5 48c-4.1 5.3-.3 13 6.3 12.9l167-.8c5.2 0 9-4.9 7.7-9.9L369.8 727a8 8 0 00-14.1-3L315 776.1c-10.2-8-20-16.7-29.3-26a318.64 318.64 0 01-68.6-101.7C200.4 609 192 567.1 192 523.9s8.4-85.1 25.1-124.5c16.1-38.1 39.2-72.3 68.6-101.7 29.4-29.4 63.6-52.5 101.7-68.6C426.9 212.4 468.8 204 512 204s85.1 8.4 124.5 25.1c38.1 16.1 72.3 39.2 101.7 68.6 29.4 29.4 52.5 63.6 68.6 101.7 16.7 39.4 25.1 81.3 25.1 124.5s-8.4 85.1-25.1 124.5a318.64 318.64 0 01-68.6 101.7c-7.5 7.5-15.3 14.5-23.4 21.2a7.93 7.93 0 00-1.2 11.1l39.4 50.5c2.8 3.5 7.9 4.1 11.4 1.3C854.5 760.8 912 649.1 912 523.9c0-221.1-179.4-400.2-400.6-399.9z"></path></svg>
        </button>
        <button class="control-btn" @click="rotateLeft" :title="nbt('nbUploader.rotateLeft'/* 向左旋转 */)" :disabled="!imageUrl">
          <span class="control-icon">↶</span>
        </button>
        <button class="control-btn" @click="rotateRight" :title="nbt('nbUploader.rotateRight'/* 向右旋转 */)" :disabled="!imageUrl">
          <span class="control-icon">↷</span>
          <!--<svg viewBox="64 64 896 896" focusable="false" data-icon="rotate-right" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M480.5 251.2c13-1.6 25.9-2.4 38.8-2.5v63.9c0 6.5 7.5 10.1 12.6 6.1L660 217.6c4-3.2 4-9.2 0-12.3l-128-101c-5.1-4-12.6-.4-12.6 6.1l-.2 64c-118.6.5-235.8 53.4-314.6 154.2A399.75 399.75 0 00123.5 631h74.9c-.9-5.3-1.7-10.7-2.4-16.1-5.1-42.1-2.1-84.1 8.9-124.8 11.4-42.2 31-81.1 58.1-115.8 27.2-34.7 60.3-63.2 98.4-84.3 37-20.6 76.9-33.6 119.1-38.8z"></path><path d="M880 418H352c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H396V494h440v326z"></path></svg>-->
        </button>
        <button class="control-btn" @click="resetRotation" :title="nbt('nbUploader.resetRotation'/* 重置旋转 */)" :disabled="!imageUrl">
          <!--<span class="control-icon">🔄</span>-->
          <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M168 504.2c1-43.7 10-86.1 26.9-126 17.3-41 42.1-77.7 73.7-109.4S337 212.3 378 195c42.4-17.9 87.4-27 133.9-27s91.5 9.1 133.8 27A341.5 341.5 0 01755 268.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 003 14.1l175.7 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c0-6.7-7.7-10.5-12.9-6.3l-56.4 44.1C765.8 155.1 646.2 92 511.8 92 282.7 92 96.3 275.6 92 503.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8zm756 7.8h-60c-4.4 0-7.9 3.5-8 7.8-1 43.7-10 86.1-26.9 126-17.3 41-42.1 77.8-73.7 109.4A342.45 342.45 0 01512.1 856a342.24 342.24 0 01-243.2-100.8c-9.9-9.9-19.2-20.4-27.8-31.4l60.2-47a8 8 0 00-3-14.1l-175.7-43c-5-1.2-9.9 2.6-9.9 7.7l-.7 181c0 6.7 7.7 10.5 12.9 6.3l56.4-44.1C258.2 868.9 377.8 932 512.2 932c229.2 0 415.5-183.7 419.8-411.8a8 8 0 00-8-8.2z"></path></svg>
        </button>
        <!--<button class="control-btn" @click="downloadImage" :title="nbt('nbUploader.xxx'下载图片)" :disabled="!imageUrl">
          <span class="control-icon">⬇️</span>
        </button>-->
      </div>
    </div>
  </div>
</template>

<script>
import LocaleMixin from '@/components/uploader/locale/localeMixin';
export default {
  name: 'ImagePreviewer',
  mixins: [LocaleMixin],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: ''
    },
    imageName: {
      type: String,
      default: '图片预览'
    }
  },
  data () {
    return {
      scale: 1,
      scaleStep: 0.1,
      rotation: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      offsetX: 0,
      offsetY: 0,
      containerWidth: 0,
      containerHeight: 0,
      imageWidth: 0,
      imageHeight: 0,
      isImageLoaded: false,
      transitionEnabled: true
    };
  },
  computed: {
    wrapperStyle() {
      return {
        transform: `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale}) rotate(${this.rotation}deg)`,
        transition: this.transitionEnabled ? 'transform 0.3s ease' : 'none'
      };
    },
    imageStyle () {
      return {
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'block'
      };
    }
  },
  watch: {
    show (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.resetView();
          this.calculateInitialScale();
        });
        document.addEventListener('keydown', this.handleKeydown);
      } else {
        document.removeEventListener('keydown', this.handleKeydown);
      }
    },
    imageUrl () {
      // 当图片URL变化时重置视图
      this.isImageLoaded = false;
      this.$nextTick(() => {
        this.resetView();
      });
    }
  },
  methods: {
    // 图片加载完成
    handleImageLoad() {
      this.isImageLoaded = true;
      this.$nextTick(() => {
        this.calculateInitialScale();
      });
    },

    // 计算初始缩放比例
    calculateInitialScale() {
      if (!this.$refs.imageContainer || !this.$refs.previewImage || !this.isImageLoaded) return;

      const container = this.$refs.imageContainer;
      const image = this.$refs.previewImage;

      this.containerWidth = container.clientWidth;
      this.containerHeight = container.clientHeight;
      this.imageWidth = image.naturalWidth;
      this.imageHeight = image.naturalHeight;

      // 计算适合容器大小的缩放比例
      const scaleX = this.containerWidth / this.imageWidth;
      const scaleY = this.containerHeight / this.imageHeight;
      this.scale = Math.min(scaleX, scaleY, 1); // 不超过原始大小

      // 重置偏移量
      this.offsetX = 0;
      this.offsetY = 0;
    },

    // 重置视图状态
    resetView () {
      this.scale = 1;
      this.rotation = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.isDragging = false;
      this.transitionEnabled = true;
    },

    // 关闭预览
    close () {
      this.$emit('close');
    },

    // 处理背景点击
    handleBackdropClick () {
      this.close();
    },

    // 处理键盘事件
    handleKeydown (e) {
      switch (e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          if (this.imageUrl) this.rotateLeft();
          break;
        case 'ArrowRight':
          if (this.imageUrl) this.rotateRight();
          break;
        case '+':
        case '=':
          if (e.ctrlKey && this.imageUrl) {
            e.preventDefault();
            this.zoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey && this.imageUrl) {
            e.preventDefault();
            this.zoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey && this.imageUrl) {
            e.preventDefault();
            this.resetZoom();
          }
          break;
      }
    },

    // 缩放功能 - 以鼠标位置为中心
    zoomIn (mouseX, mouseY) {
      if (!this.imageUrl) return;

      this.transitionEnabled = true;
      const oldScale = this.scale;
      this.scale = Math.min(this.scale + this.scaleStep, 5);

      // 如果提供了鼠标位置，以鼠标位置为中心缩放
      if (mouseX !== undefined && mouseY !== undefined) {
        this.zoomToPoint(mouseX, mouseY, oldScale, this.scale);
      }
    },

    zoomOut (mouseX, mouseY) {
      if (!this.imageUrl) return;

      this.transitionEnabled = true;
      const oldScale = this.scale;
      this.scale = Math.max(this.scale - this.scaleStep, 0.1);

      // 如果提供了鼠标位置，以鼠标位置为中心缩放
      if (mouseX !== undefined && mouseY !== undefined) {
        this.zoomToPoint(mouseX, mouseY, oldScale, this.scale);
      }
    },

    // 以指定点为中心的缩放计算
    zoomToPoint(mouseX, mouseY, oldScale, newScale) {
      if (!this.$refs.imageContainer) return;

      const container = this.$refs.imageContainer;
      const containerRect = container.getBoundingClientRect();

      // 计算鼠标相对于容器中心的位置
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const containerCenterY = containerRect.top + containerRect.height / 2;

      // 计算鼠标相对于图片中心的位置（考虑当前偏移量）
      const mouseRelativeX = (mouseX - containerCenterX - this.offsetX) / oldScale;
      const mouseRelativeY = (mouseY - containerCenterY - this.offsetY) / oldScale;

      // 计算新的偏移量，使鼠标点保持在相同位置
      this.offsetX = mouseX - containerCenterX - mouseRelativeX * newScale;
      this.offsetY = mouseY - containerCenterY - mouseRelativeY * newScale;
    },

    resetZoom () {
      if (!this.imageUrl) return;
      this.transitionEnabled = true;
      this.scale = 1;
      this.offsetX = 0;
      this.offsetY = 0;
    },

    // 旋转功能
    rotateLeft () {
      if (!this.imageUrl) return;
      this.transitionEnabled = true;
      this.rotation -= 90;
    },

    rotateRight () {
      if (!this.imageUrl) return;
      this.transitionEnabled = true;
      this.rotation += 90;
    },

    resetRotation () {
      if (!this.imageUrl) return;
      this.transitionEnabled = true;
      this.rotation = 0;
    },

    // 鼠标滚轮缩放 - 以鼠标位置为中心
    handleWheel (e) {
      if (!this.imageUrl) return;
      e.preventDefault();

      // 禁用过渡效果以获得更直接的响应
      // this.transitionEnabled = false;

      const delta = e.deltaY > 0 ? -this.scaleStep : this.scaleStep;
      const newScale = Math.max(0.1, Math.min(5, this.scale + delta));

      if (newScale !== this.scale) {
        const oldScale = this.scale;
        this.scale = newScale;

        // 以鼠标位置为中心缩放
        this.zoomToPoint(e.clientX, e.clientY, oldScale, newScale);
      }

      // 短暂延迟后重新启用过渡效果
      setTimeout(() => {
        this.transitionEnabled = true;
      }, 100);
    },

    // 双击重置
    handleDoubleClick () {
      if (!this.imageUrl) return;
      this.resetZoom();
      this.resetRotation();
    },

    // 拖拽功能
    startDrag (e) {
      if (!this.imageUrl) return;
      this.transitionEnabled = false;
      this.isDragging = true;
      this.dragStartX = e.clientX - this.offsetX;
      this.dragStartY = e.clientY - this.offsetY;

      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },

    handleDrag (e) {
      if (!this.isDragging || !this.imageUrl) return;

      this.offsetX = e.clientX - this.dragStartX;
      this.offsetY = e.clientY - this.dragStartY;
    },

    stopDrag () {
      this.isDragging = false;
      this.transitionEnabled = true;
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    },

    // 下载图片
    /* downloadImage () {
      if (!this.imageUrl) return;

      try {
        const link = document.createElement('a');
        link.href = this.imageUrl;
        link.download = this.imageName || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('下载图片失败:', error);
      }
    } */
  },

  beforeUnmount () {
    // 清理事件监听器
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }
};
</script>

<style lang="scss">
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  animation: fadeIn 0.3s ease;

  .preview-content {
    border-radius: 12px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    color: white;
    border-bottom: 1px solid #333;
  }

  .preview-title {
    padding: 0;
    margin: 0;
    font-weight: 600;
    font-size: 16px;
    color: #fff;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-left: 16px;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: grab;
    position: relative;
  }

  .image-wrapper {
    position: relative;
    transform-origin: center center;
    transition: transform 0.3s ease;
  }

  .image-container img {
    display: block;
    user-select: none;
    pointer-events: none;
  }

  .image-container:active {
    cursor: grabbing;
  }

  .no-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
    padding: 40px;
    width: 100%;
    height: 100%;
  }

  .no-image-icon {
    font-size: 52px;
    margin-bottom: 12px;
  }

  .no-image-text {
    font-size: 16px;
    color: #999;
  }

  .preview-controls {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 40px;
    color: white;
    font-size: 16px;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    font-size: 18px;
    //font-weight: bold;
    .control-icon{
      font-size: 20px;
    }
  }

  .control-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .control-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }

  .control-icon {
    font-size: 18px;
    line-height: 1;
  }

  .scale-info {
    font-size: 14px;
    font-weight: 600;
    color: white;
    min-width: 70px;
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 12px;
    border-radius: 6px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-preview-modal {
    .preview-header {
      padding: 12px 16px;
    }
    .preview-controls {
      gap: 12px;
    }

    .control-btn {
      padding: 8px 12px;
      min-width: 44px;
      height: 36px;
    }

    .scale-info {
      font-size: 12px;
      min-width: 50px;
    }
  }
}

@media (max-width: 480px) {
  .image-preview-modal {
    .preview-header {
      padding: 12px;
    }

    .preview-controls {
      gap: 8px;
    }

    .control-btn {
      padding: 6px 10px;
      min-width: 40px;
      height: 32px;
    }

    .control-icon {
      font-size: 14px;
    }
    .close-btn {
      width: 36px;
      height: 36px;
      font-size: 20px;
    }

    .no-image-icon {
      font-size: 36px;
    }

    .no-image-text {
      font-size: 14px;
    }
  }
}
</style>
