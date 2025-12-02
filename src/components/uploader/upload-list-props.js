export const commonProps = {
  showUploadStats: { // 是否显示上传状态信息
    type: Boolean,
    default: true
  },
  showUploadSpeed: { // 是否显示上传速度
    type: Boolean,
    default: true
  },
  showRemoveButton: { // 是否显示移除文件按钮
    type: Boolean,
    default: true
  },
  showCancelButton: { // 是否显示取消上传按钮
    type: Boolean,
    default: true
  },
  showPauseButton: { // 是否显示暂停上传按钮
    type: Boolean,
    default: true
  },
  simpleFileItem: { // 是否为简单样式
    type: Boolean
  },
}
export const uploaderListProps = {
  ...commonProps,
  files: {
    type: Array,
    default: () => []
  },
  parentSlots: { // 父组件插槽
    type: Object
  },
  /* showUploadSpeed: {
    type: Boolean,
    default: true
  },
  showUploadStats: {
    type: Boolean,
    default: true
  },
  showRemoveButton: { // 是否显示移除文件按钮
    type: Boolean,
    default: true
  },
  showCancelButton: { // 是否显示取消上传按钮
    type: Boolean,
    default: true
  },
  showPauseButton: { // 是否显示暂停上传按钮
    type: Boolean,
    default: true
  }, */
  getStatusText: {
    type: Function,
  },
  getFileIcon: {
    type: Function,
  },
  uploadFile: { // 上传文件函数
    type: Function,
  },
  pauseUpload: { // 暂停上传文件函数
    type: Function,
  },
  cancelUpload: { // 取消上传文件函数
    type: Function,
  },
  removeFile: { // 移除上传文件函数
    type: Function,
  },
  getStatusClass: {
    type: Function,
  },
  formatFileSize: {
    type: Function,
  }
}
