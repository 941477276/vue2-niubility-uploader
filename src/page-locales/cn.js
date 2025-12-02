export default {
  app: {
    headerNav: {
      start: '开始',
      usageDemo: '使用示例',
      api: 'Api'
    }
  },
  // 安装和开始使用
  install: {
    title: '安装',
    npm: {
      title: '1、npm',
      description: '使用npm安装'
    },
    umd: {
      title: '2、umd',
      description: `使用 <code>script</code> 标签安装。这种方式您需要从 <code>Github</code> 仓库中的 <strong>lib</strong> 目录下下载 <code>vue2-niubility-uploader.umd.min.js</code>，
      <code>vue2-niubility-uploader.css</code>，然后将其导入到您的项目中。
      导入js后会在 <code>window</code> 对象下暴露 <code>Vue2NiubilityUploader</code> 组件.`
    }
  },
  usage: {
    title: '使用',
    globalRegistration: {
      title: '1、全局注册',
      mainJs: 'main.js',
      demoVue: 'Demo.vue'
    },
    localRegistration: {
      title: '2、局部注册',
      demoVue: 'Demo.vue'
    }
  },
  i18n: '国际化 (i18n)',

  // Start页面
  start: {
    i18nTitle: '国际化 (i18n)',
    i18nDescription: 'niubility-uploader 组件内部默认使用中文,若希望使用其他语言,则需要进行多语言设置。以英文为例,在 main.js 中:',
    directSetEnglish: '直接设置为英文',
    withI18nPlugin: '搭配i18n插件',
    languagePackage: '语言包'
  },

  // Demo页面内容
  demo: {
    nodejsDemo: {
      title: 'Nodejs版上传文件接口demo',
      description: '这个页面所有demo的上传文件接口都是使用的这份代码！',
      serverJs: 'server.js',
      packageJson: 'package.json'
    },
    basicUsage: {
      title: '基础使用',
      description: `使用 <code>niubility-uploader</code>组件，需传递 <code>request-handler</code> prop，它是一个函数，接收 <code>fileData</code>
      参数，需返回http网络请求所需数据，具体如下：`,
      interface: {
        url: '上传文件接口地址',
        method: '上传文件接口请求方式',
        data: '提交给上传文件接口的数据'
      }
    },
    uploadAvatar: {
      title: '头像上传',
      description: `设置 <code>show-file-list="false"</code> 去掉默认文件列表，
      再使用 <code>#default</code> 默认插槽可以覆盖默认选择文件样式即可实现头像上传功能。`
    },
    pictureCard: {
      title: '照片墙',
      description: `<code>list-type</code>设置为 <code>picture-card</code> 即可实现照片墙功能`
    },
    conditionLimits: {
      title: '条件限制',
      description: `给组件设置了上传文件类型、体积大小、数量等限制后，可以通过 <code>file-error</code> 事件接收具体错误信息！`
    },
    customFileListBtns: {
      title: '自定义文件列表上传与删除按钮',
      description: {
        fileItem: '<code>file-item</code> 插槽自定义上传列表，',
        filePreview: '<code>file-preview</code> 插槽自定义上传列表中的文件预览，',
        uploadProgress: '<code>file-upload-progress</code> 插槽自定义上传列表中的进度条，',
        uploadBtn: '<code>file-list-upload-btn</code> 插槽自定义列表中的上传按钮，',
        pauseBtn: '<code>file-list-pause-btn</code> 插槽自定义列表中的暂停按钮，',
        cancelBtn: '<code>file-list-cancel-btn</code> 插槽自定义列表中的取消上传按钮，',
        removeBtn: '<code>file-list-remove-btn</code> 插槽自定义列表中的删除按钮'
      }
    },
    beforeRemoveFile: {
      title: '移除文件前二次确认',
      description: `<code>before-remove</code> prop 可实现移除文件前二次确认功能，它是一个函数，接收 <code>fileData</code> 参数，
      需返回 <code>Promise</code>，若promise为 <code>rejected</code> 状态，则文件不会被移除。`
    },
    chunkUpload: {
      title: '分片上传',
      description: {
        intro: `<code>use-chunked-upload</code> prop 的值为 <code>true</code>即可开启分片上传。<br>
          <code>batch-file-concurrent-uploads</code> prop用来设置每批上传文件数，如：batchFileCount=3，总共选中了5个文件，开始上传后只有3个文件会在上传，等这3个文件上传完成后接着开始上传
          剩余的2个。
          <code>batch-chunk-concurrent-uploads</code> prop用来设置单个文件分片上传并发数。<br>
          <code>chunk-size</code> prop用来设置单个分片体积大小<br>`
      },
      note: {
        title: '注意：',
        content: `使用分片上传需配置 <code>before-upload</code> 钩子函数，在第一次上传该文件前组件会调用该函数，在该函数中用户需要调用服务端分片上传初始化接口（如：/upload/chunk/init），把文件名称、文件类型、
        文件大小、文件md5值传递给该接口。在该接口内部服务端可以根据文件md5值判断文件是否上传过，如果没有上传过则以文件md5值创建文件夹；如果上传过，则获取该文件夹内的所有分片，读取分片的索引号，并把所有已上传分片的索引号返回给组件。`
      }
    },
    autoUpload: {
      title: '自动上传',
      description: `<code>auto-upload</code> prop的值为 <code>true</code> 可开启自动上传。
      您也可以配置 <code>max-concurrent-uploads</code> 来限制文件上传最大并发数。`
    },
    manualAddFile: {
      title: '手动添加文件',
      description: `当您有一些外部文件（如用户剪切板里的图片、加密后的文件的字节数组、用户选择的文件）需要通过组件进行上传时，您可以调用
      组件的 <code>addFile</code> 函数将文件添加进上传组建。<code>addFile</code> 函数接收一个对象，对象需包含如下字段：`,
      interface: {
        name: '文件名称',
        file: '文件内容',
        previewUrl: '预览url，可以为base64字符串、url',
        type: '文件的mime类型，如：image/png，text/html'
      }
    },
    editImage: {
      title: '图片上传前编辑',
      description: `如果您想要实现在图片上传前编辑图片（如压缩、旋转、加水印等），您需要以下步骤：`,
      step1: `设置 <code>file-change</code> prop，该参数为一个函数，在这个函数中 <code>return false</code> 以阻止
      组件默认的将文件添加到文件列表行为。`,
      step2: `在编辑完图片后调用组件的 <code>addFile</code> 函数，将编辑好的图片添加组件文件列表。`,
      addFileParams: '<code>addFile</code> 函数参数如下：'
    },
    defaultFileList: {
      title: '默认文件列表',
      description: `在很多场景下需要回显已经上传成功的文件，在niubility-uploder组件中可以通过 <code>default-file-list</code> prop来回显。
      <code>default-file-list</code> prop的值需为一个数组，数组里面的内容项如下：`,
      interface: {
        id: '唯一ID',
        name: '文件名称',
        previewUrl: '预览url，可以为base64字符串、url'
      }
    },
    simpleStyle: {
      title: '简单样式',
      description: `设置 <code>simple-file-item</code> prop的值为 <code>true</code>，文件列表为简单样式，显示的内容会少一些。`
    },
    breakpointResume: {
      title: '断点续传',
      description: {
        intro: `在上传大文件时通常会采用分片上传方式，用户在上传过程中可能会无意触发刷新页面或不小心关掉了浏览器，这样会导致文件只上传了部分，此时续传功能就派上用场了。`,
        solution: '断点续传方案',
        step1: '在用户选择了文件后立即计算这个文件的md5值',
        step2: `配置 <code>before-upload</code> 钩子函数，在第一次上传该文件前组件会调用该函数，在该函数中用户需要调用服务端分片上传初始化接口（如：/upload/chunk/init），把文件名称、文件类型、
        文件大小、文件md5值传递给该接口。在该接口内部服务端可以根据文件md5值判断文件是否上传过，如果没有上传过则以文件md5值创建文件夹；如果上传过，则获取该文件夹内的所有分片，读取分片的索引号，并把所有已上传分片的索引号返回给组件。`,
        step3: '在 <code>beforeUploadChunk</code> 钩子函数，或 <code>requestHandler</code> 钩子函数中计算分片md5值',
        step4: `上传分片。配置 <code>requestHandler</code> 钩子函数，在该函数中上传分片，把文件名称、分片索引、分片md5值、分片大小等数据传递给接收分片数据的接口，该接口内部使用分片索引+分片md5值作为文件名称存储分片数据`,
        step5: `分片上传完成后组件会触发 <code>chunkUploadCompleted</code> 钩子函数，用户在该钩子中调用后端合并分片接口（如：/upload/chunk/finalize），若后端合并文件失败，
        <code>chunkUploadCompleted</code> 钩子函数返回rejected的Promise，文件上传会变为"上传失败"状态`,
        step6: `分片上传完成后也可以在 <code>file-upload-complete</code> 事件中调用后端合并分片接口，但如果后端合并分片失败，文件上传状态不会变为"上传失败"`
      },
      uploadedIndexes: '已上传分片索引：',
      placeholder: '请输入已上传分片索引，多个索引按英文逗号隔开'
    }
  },

  // API文档
  api: {
    props: 'Props (属性)',
    types: 'Types (类型)',
    events: 'Events (事件)',
    slots: 'Slots (插槽)',
    propCount: '属性数量',
    columnName: '属性',
    columnDescription: '说明',
    columnType: '类型',
    columnDefault: '默认值',
    columnVersion: '版本',
    columnEvent: '事件',
    columnParameter: '参数',
    columnSlotName: '插槽名称',

    // 属性描述
    requestHandler: {
      name: 'requestHandler',
      description: `请求处理器，所有请求都会调用该函数，可以在该函数内添加请求数据，设置自定义请求头，请求函数，超时时间等。`
    },
    respondHandler: {
      name: 'respondHandler',
      description: `请求响应处理器，所有请求响应都会调用该函数，可以在该函数内处理文件/分片上传完成后的一些逻辑，如根据接口响应的编码判断用户是否有权限访问。
      该函数若返回 Promise 且被 reject，则被认为文件/分片上传失败`
    },
    accept: {
      name: 'accept',
      description: '接受的文件类型，如: "image/*,.pdf"'
    },
    limit: {
      name: 'limit',
      description: '最大文件个数，null表示无限制'
    },
    multiple: {
      name: 'multiple',
      description: '是否支持多选'
    },
    maxSize: {
      name: 'maxSize',
      description: '单个文件最大体积（字节），null表示无限制'
    },
    maxConcurrentUploads: {
      name: 'maxConcurrentUploads',
      description: '多个文件上传时最大上传并发数'
    },
    showUploadActionBar: {
      name: 'showUploadActionBar',
      description: '是否显示底部上传操作栏'
    },
    hideUploaderWhenExceedLimit: {
      name: 'hideUploaderWhenExceedLimit',
      description: '是否在选择的文件数量超出或等于limit值后隐藏文件上传器'
    },
    listType: {
      name: 'listType',
      description: '文件列表类型'
    },
    useChunkedUpload: {
      name: 'useChunkedUpload',
      description: '是否使用分片上传'
    },
    chunkSize: {
      name: 'chunkSize',
      description: '分片上传时每片分片大小'
    },
    chunkSizeThreshold: {
      name: 'chunkSizeThreshold',
      description: '分片上传时分片大小阈值，如果文件体积小于该值则不会采用分片上传'
    },
    batchFileConcurrentUploads: {
      name: 'batchFileConcurrentUploads',
      description: `批量上传时每批上传文件并发数。如：batchFileCount=3，总共选中了5个文件，开始上传后只有3个文件会在上传，等这3个文件上传完成后接着开始上传
      剩余的2个`
    },
    batchChunkConcurrentUploads: {
      name: 'batchChunkConcurrentUploads',
      description: '批量上传时上传分片并发数'
    },
    timeout: {
      name: 'timeout',
      description: '请求超时时间(ms)'
    },
    drag: {
      name: 'drag',
      description: '是否支持拖拽上传'
    },
    disabled: {
      name: 'disabled',
      description: '是否禁用'
    },
    autoUpload: {
      name: 'autoUpload',
      description: '是否自动上传'
    },
    simpleFileItem: {
      name: 'simpleFileItem',
      description: '是否为简单样式'
    },
    showFileList: {
      name: 'showFileList',
      description: '是否显示文件列表'
    },
    showUploadStats: {
      name: 'showUploadStats',
      description: '是否显示上传状态信息'
    },
    showUploadSpeed: {
      name: 'showUploadSpeed',
      description: '是否显示上传速度'
    },
    showRemoveButton: {
      name: 'showRemoveButton',
      description: '是否显示移除文件按钮'
    },
    showCancelButton: {
      name: 'showCancelButton',
      description: '是否显示取消上传按钮'
    },
    showPauseButton: {
      name: 'showPauseButton',
      description: '是否显示暂停上传按钮'
    },
    fileInputAttrs: {
      name: 'fileInputAttrs',
      description: '文件选择input的属性'
    },
    statusMap: {
      name: 'statusMap',
      description: '状态映射表'
    },
    fileIconExtend: {
      name: 'fileIconExtend',
      description: '文件图标扩展'
    },
    defaultFileList: {
      name: 'defaultFileList',
      description: '非受控模式下的文件列表'
    },
    timeRemainingFormatter: {
      name: 'timeRemainingFormatter',
      description: '剩余时间格式化函数'
    },
    previewFile: {
      name: 'previewFile',
      description: '自定义图片、文件预览函数'
    },
    beforeUpload: {
      name: 'beforeUpload',
      description: `上传文件前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。`
    },
    beforeRemove: {
      name: 'beforeRemove',
      description: `删除文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则不会被删除。`
    },
    fileChange: {
      name: 'fileChange',
      description: `文件被选中的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则不会被添加到文件列表。`
    },
    beforeUploadChunk: {
      name: 'beforeUploadChunk',
      description: `上传分片前的钩子，参数为上传的分片，若返回 false 或者返回 Promise 且被 reject，则停止上传。`
    },
    chunkUploadCompleted: {
      name: 'chunkUploadCompleted',
      description: `分片全部上传完成的钩子，参数为上传的分片，若返回 false 或者返回 Promise 且被 reject，
      则视为文件整体上传失败，文件状态会被置为error。`
    },

    // 事件名称
    fileUploadProgress: '文件上传中事件',
    fileUploadCancelled: '文件上传取消事件',
    fileUploadPaused: '文件上传暂停事件',
    fileUploadError: '文件上传错误事件',
    fileUploadComplete: '文件上传完成事件',
    fileRemoved: '文件被移除事件',
    fileError: '文件校验失败事件',
    fileAdded: '文件被添加事件',

    // 插槽名称
    defaultSlot: '上传按钮插槽',
    uploadPrepend: '上传按钮前面内容插槽',
    uploadAppend: '上传按钮后面内容插槽',
    fileItemSlot: '文件列表项插槽',
    fileAppend: '文件列表项后面内容插槽',
    filePreview: '文件列表项中的文件预览插槽',
    filePreviewAppend: '文件列表项中文件预览后面内容插槽',
    fileUploadProgressSlot: '文件列表项中文件上传进度条插槽',
    fileListUploadBtn: '文件列表项中文件上传按钮插槽',
    fileListPauseBtn: '文件列表项中文件暂停上传按钮插槽',
    fileListCancelBtn: '文件列表项中文件取消上传按钮插槽',
    fileListRemoveBtn: '文件列表项中文件删除文件按钮插槽',
    fileActionAppend: '文件列表项中文件操作按钮后面内容插槽',
    fileListPreviewBtn: '文件列表项中文件文件预览按钮插槽，仅在 <code>listType=picture-card</code> 有效'
  },

  // 状态文本
  status: {
    pending: '待上传',
    checking: '检查中...',
    uploading: '上传中',
    completed: '上传完成',
    error: '上传失败',
    cancelled: '已取消',
    paused: '已暂停'
  },

  // 常用控制台和调试文本
  debug: {
    fileAdded: '文件添加:',
    fileProgress: '文件进度:',
    fileComplete: '文件上传完成:',
    uploadError: '上传错误:',
    fileValidationError: '文件校验出错',
    requestHandler: 'requestHandler',
    respondHandler: 'respondHandler',
    chunkData: 'chunkData',
    chunkUploadComplete: '分片全部上传完成',
    fileRemove: 'onFileRemove'
  },

  // 提示消息
  alerts: {
    confirmRemove: `确定要移除"{filename}"文件吗？`,
    enterBase64Image: '请输入Base64图片字符串数据！',
    base64DataIncorrect: 'Base64字符串数据不正确！',
    enterByteArrayData: '请输入文件字节数组数据！',
    enterByteArrayMimeType: '请输入文件字节数组的mime类型！',
    byteArrayDataIncorrect: '输入的文件字节数组数据不正确，非正确的数组字符串！',
    mimeTypeFormatIncorrect: '文件字节数据的mime类型格式不正确！'
  }
}