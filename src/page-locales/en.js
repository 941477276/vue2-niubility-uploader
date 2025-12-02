export default {
  app: {
    headerNav: {
      start: 'Start',
      usageDemo: 'Usage demo',
      api: 'Api'
    }
  },
  // Installation and Getting Started
  install: {
    title: 'Installation',
    npm: {
      title: '1. npm',
      description: 'Install with npm'
    },
    umd: {
      title: '2. umd',
      description: `Install with <code>script</code> tag. For this method, you need to download <code>vue2-niubility-uploader.umd.min.js</code> and
      <code>vue2-niubility-uploader.css</code> from the <strong>lib</strong> directory of the <code>Github</code> repository,
      then import them into your project. After importing the js, it will expose the <code>Vue2NiubilityUploader</code> component
      on the <code>window</code> object.`
    }
  },
  usage: {
    title: 'Usage',
    globalRegistration: {
      title: '1. Global Registration',
      mainJs: 'main.js',
      demoVue: 'Demo.vue'
    },
    localRegistration: {
      title: '2. Local Registration',
      demoVue: 'Demo.vue'
    }
  },
  i18n: 'Internationalization (i18n)',

  // Start page
  start: {
    i18nTitle: 'Internationalization (i18n)',
    i18nDescription: 'The niubility-uploader component uses Chinese by default. If you want to use other languages, you need to configure multi-language settings. Taking English as an example, in main.js:',
    directSetEnglish: 'Set to English directly',
    withI18nPlugin: 'With i18n plugin',
    languagePackage: 'Language package'
  },

  // Demo page content
  demo: {
    nodejsDemo: {
      title: 'Node.js Upload File API Demo',
      description: 'All demos on this page use this code for the upload file interface!',
      serverJs: 'server.js',
      packageJson: 'package.json'
    },
    basicUsage: {
      title: 'Basic Usage',
      description: `Use the <code>niubility-uploader</code> component, you need to pass the <code>request-handler</code> prop.
      It's a function that receives the <code>fileData</code> parameter and returns the data needed for HTTP network requests as follows:`,
      interface: {
        url: 'Upload file interface address',
        method: 'Upload file interface request method',
        data: 'Data submitted to upload file interface'
      }
    },
    uploadAvatar: {
      title: 'Avatar Upload',
      description: `Set <code>show-file-list="false"</code> to remove the default file list,
      then use the <code>#default</code> default slot to override the default file selection style to implement avatar upload.`
    },
    pictureCard: {
      title: 'Picture Card',
      description: `Set <code>list-type</code> to <code>picture-card</code> to achieve photo wall functionality`
    },
    conditionLimits: {
      title: 'Condition Limits',
      description: `After setting upload file type, size, quantity and other restrictions on the component,
      you can receive specific error information through the <code>file-error</code> event!`
    },
    customFileListBtns: {
      title: 'Custom File List Upload and Delete Buttons',
      description: {
        fileItem: '<code>file-item</code> slot to customize upload list,',
        filePreview: '<code>file-preview</code> slot to customize file preview in the upload list,',
        uploadProgress: '<code>file-upload-progress</code> slot to customize progress bar in the upload list,',
        uploadBtn: '<code>file-list-upload-btn</code> slot to customize upload button in the list,',
        pauseBtn: '<code>file-list-pause-btn</code> slot to customize pause button in the list,',
        cancelBtn: '<code>file-list-cancel-btn</code> slot to customize cancel upload button in the list,',
        removeBtn: '<code>file-list-remove-btn</code> slot to customize delete button in the list'
      }
    },
    beforeRemoveFile: {
      title: 'Confirm Before Removing File',
      description: `The <code>before-remove</code> prop can implement the confirm before removing file function.
      It's a function that receives the <code>fileData</code> parameter and needs to return a <code>Promise</code>.
      If the promise is in <code>rejected</code> state, the file will not be removed.`
    },
    chunkUpload: {
      title: 'Chunk Upload',
      description: {
        intro: `Set the value of <code>use-chunked-upload</code> prop to <code>true</code> to enable chunk upload.<br>
        The <code>batch-file-concurrent-uploads</code> prop is used to set the number of files uploaded per batch.
        For example: batchFileCount=3, if 5 files are selected in total, only 3 files will be uploading at the beginning,
        after these 3 files are uploaded, the remaining 2 files will start uploading.
        The <code>batch-chunk-concurrent-uploads</code> prop is used to set the concurrent upload count for individual file chunks.<br>
        The <code>chunk-size</code> prop is used to set the size of individual chunks<br>`
      },
      note: {
        title: 'Note:',
        content: `Using chunk upload requires configuring the <code>before-upload</code> hook function.
        Before the first upload of this file, the component will call this function,
        in which the user needs to call the server-side chunk upload initialization interface (such as: /upload/chunk/init),
        passing the file name, file type, file size, and file MD5 value to this interface.
        Inside this interface, the server can determine whether the file has been uploaded based on the file MD5 value.
        If not uploaded, create a folder with the file MD5 value;
        if uploaded, get all chunks in the folder, read the chunk index numbers,
        and return all uploaded chunk index numbers to the component.`
      }
    },
    autoUpload: {
      title: 'Auto Upload',
      description: `Set the value of <code>auto-upload</code> prop to <code>true</code> to enable auto upload.
      You can also configure <code>max-concurrent-uploads</code> to limit the maximum concurrent upload count.`
    },
    manualAddFile: {
      title: 'Manual Add File',
      description: `When you have some external files (such as images from the user's clipboard, encrypted file byte arrays,
      user-selected files) that need to be uploaded through the component, you can call the component's <code>addFile</code>
      function to add files into the upload component. The <code>addFile</code> function receives an object,
      the object needs to contain the following fields:`,
      interface: {
        name: 'File name',
        file: 'File content',
        previewUrl: 'Preview url, can be base64 string or url',
        type: 'File mime type, such as: image/png, text/html'
      }
    },
    editImage: {
      title: 'Edit Image Before Upload',
      description: `If you want to implement image editing before upload (such as compression, rotation, watermark, etc.),
      you need the following steps:`,
      step1: `Set <code>file-change</code> prop, which is a function, in this function <code>return false</code> to prevent
      the component's default behavior of adding files to the file list.`,
      step2: `After editing the image, call the component's <code>addFile</code> function to add the edited image to the component's file list.`,
      addFileParams: '<code>addFile</code> function parameters are as follows:'
    },
    defaultFileList: {
      title: 'Default File List',
      description: `In many scenarios, you need to display files that have been successfully uploaded.
      In the niubility-uploader component, this can be achieved through the <code>default-file-list</code> prop.
      The value of <code>default-file-list</code> prop needs to be an array, and the content items in the array are as follows:`,
      interface: {
        id: 'Unique ID',
        name: 'File name',
        previewUrl: 'Preview url, can be base64 string or url'
      }
    },
    simpleStyle: {
      title: 'Simple Style',
      description: `Set the value of <code>simple-file-item</code> prop to <code>true</code>, the file list will be in simple style,
      displaying less content.`
    },
    breakpointResume: {
      title: 'Breakpoint Resume',
      description: {
        intro: `When uploading large files, chunk upload is usually used. Users may accidentally trigger page refresh or accidentally
        close the browser during the upload process, which will result in only partial file upload.
        In this case, the resume function comes in handy.`,
        solution: 'Breakpoint Resume Solution',
        step1: 'Immediately calculate the MD5 value of this file after the user selects the file',
        step2: `Configure the <code>before-upload</code> hook function. Before the first upload of this file,
        the component will call this function, in which the user needs to call the server-side chunk upload
        initialization interface (such as: /upload/chunk/init), passing the file name, file type, file size, and file MD5 value.
        Inside this interface, the server can determine whether the file has been uploaded based on the file MD5 value.
        If not uploaded, create a folder with the file MD5 value;
        if uploaded, get all chunks in the folder, read the chunk index numbers,
        and return all uploaded chunk index numbers to the component.`,
        step3: 'Calculate chunk MD5 value in the <code>beforeUploadChunk</code> hook function or <code>requestHandler</code> hook function',
        step4: `Upload chunks. Configure the <code>requestHandler</code> hook function, in which upload chunks,
        passing data such as file name, chunk index, chunk MD5 value, chunk size, etc. to the interface that receives chunk data.
        This interface uses chunk index + chunk MD5 value as the file name to store chunk data`,
        step5: `After chunk upload is completed, the component will trigger the <code>chunkUploadCompleted</code> hook function.
        The user calls the backend merge chunks interface (such as: /upload/chunk/finalize) in this hook.
        If the backend merge fails, the <code>chunkUploadCompleted</code> hook function returns a rejected Promise,
        and the file upload status will be set to "upload failed"`,
        step6: `After chunk upload is completed, you can also call the backend merge chunks interface in the
        <code>file-upload-complete</code> event, but if the backend merge chunks fails, the file upload status will not become "upload failed"`
      },
      uploadedIndexes: 'Uploaded Chunk Indexes:',
      placeholder: 'Please enter uploaded chunk indexes, separated by commas'
    }
  },

  // API Documentation
  api: {
    props: 'Props',
    types: 'Types',
    events: 'Events',
    slots: 'Slots',
    propCount: 'Attribute count',
    columnName: 'Attribute',
    columnDescription: 'Description',
    columnType: 'Type',
    columnDefault: 'Default',
    columnVersion: 'Version',
    columnEvent: 'Event',
    columnParameter: 'Parameter',
    columnSlotName: 'Slot Name',

    // Prop descriptions
    requestHandler: {
      name: 'requestHandler',
      description: `Request handler, all requests will call this function, in which you can add request data, set custom request headers,
      request functions, timeout, etc.`
    },
    respondHandler: {
      name: 'respondHandler',
      description: `Request response handler, all request responses will call this function, in which you can handle some logic
      after file/chunk upload is completed, such as determining whether the user has permission to access based on the response encoding from the interface.
      If this function returns Promise and is rejected, the file/chunk upload is considered to have failed`
    },
    accept: {
      name: 'accept',
      description: 'Accepted file types, e.g: "image/*,.pdf"'
    },
    limit: {
      name: 'limit',
      description: 'Maximum number of files, null means unlimited'
    },
    multiple: {
      name: 'multiple',
      description: 'Whether to support multiple selection'
    },
    maxSize: {
      name: 'maxSize',
      description: 'Maximum size of a single file (bytes), null means unlimited'
    },
    maxConcurrentUploads: {
      name: 'maxConcurrentUploads',
      description: 'Maximum concurrent uploads when uploading multiple files'
    },
    showUploadActionBar: {
      name: 'showUploadActionBar',
      description: 'Whether to show the bottom upload action bar'
    },
    hideUploaderWhenExceedLimit: {
      name: 'hideUploaderWhenExceedLimit',
      description: 'Whether to hide the file uploader when the number of selected files exceeds or equals the limit value'
    },
    listType: {
      name: 'listType',
      description: 'File list type'
    },
    useChunkedUpload: {
      name: 'useChunkedUpload',
      description: 'Whether to use chunked upload'
    },
    chunkSize: {
      name: 'chunkSize',
      description: 'Chunk size for chunked upload'
    },
    chunkSizeThreshold: {
      name: 'chunkSizeThreshold',
      description: 'Chunk size threshold for chunked upload. If file size is smaller than this value, chunked upload will not be used'
    },
    batchFileConcurrentUploads: {
      name: 'batchFileConcurrentUploads',
      description: `Concurrent upload count of files per batch. For example: batchFileCount=3, if 5 files are selected in total,
      only 3 files will be uploading at the beginning, after these 3 files are uploaded, the remaining 2 files will start uploading`
    },
    batchChunkConcurrentUploads: {
      name: 'batchChunkConcurrentUploads',
      description: 'Concurrent upload count of chunks when batch uploading'
    },
    timeout: {
      name: 'timeout',
      description: 'Request timeout time (ms)'
    },
    drag: {
      name: 'drag',
      description: 'Whether to support drag and drop upload'
    },
    disabled: {
      name: 'disabled',
      description: 'Whether to disable'
    },
    autoUpload: {
      name: 'autoUpload',
      description: 'Whether to auto upload'
    },
    simpleFileItem: {
      name: 'simpleFileItem',
      description: 'Whether to use simple style'
    },
    showFileList: {
      name: 'showFileList',
      description: 'Whether to show file list'
    },
    showUploadStats: {
      name: 'showUploadStats',
      description: 'Whether to show upload status information'
    },
    showUploadSpeed: {
      name: 'showUploadSpeed',
      description: 'Whether to show upload speed'
    },
    showRemoveButton: {
      name: 'showRemoveButton',
      description: 'Whether to show remove file button'
    },
    showCancelButton: {
      name: 'showCancelButton',
      description: 'Whether to show cancel upload button'
    },
    showPauseButton: {
      name: 'showPauseButton',
      description: 'Whether to show pause upload button'
    },
    fileInputAttrs: {
      name: 'fileInputAttrs',
      description: 'Attributes of the file selection input'
    },
    statusMap: {
      name: 'statusMap',
      description: 'Status mapping table'
    },
    fileIconExtend: {
      name: 'fileIconExtend',
      description: 'File icon extension'
    },
    defaultFileList: {
      name: 'defaultFileList',
      description: 'File list in uncontrolled mode'
    },
    timeRemainingFormatter: {
      name: 'timeRemainingFormatter',
      description: 'Remaining time formatting function'
    },
    previewFile: {
      name: 'previewFile',
      description: 'Custom image, file preview function'
    },
    beforeUpload: {
      name: 'beforeUpload',
      description: `Hook before uploading files, parameter is the uploaded file, if returns false or returns Promise and is rejected, stop uploading.`
    },
    beforeRemove: {
      name: 'beforeRemove',
      description: `Hook before deleting files, parameter is the uploaded file, if returns false or returns Promise and is rejected, it will not be deleted.`
    },
    fileChange: {
      name: 'fileChange',
      description: `Hook when file is selected, parameter is the uploaded file, if returns false or returns Promise and is rejected, it will not be added to the file list.`
    },
    beforeUploadChunk: {
      name: 'beforeUploadChunk',
      description: `Hook before uploading chunks, parameter is the uploaded chunk, if returns false or returns Promise and is rejected, stop uploading.`
    },
    chunkUploadCompleted: {
      name: 'chunkUploadCompleted',
      description: `Hook after all chunks are uploaded, parameter is the uploaded chunks, if returns false or returns Promise and is rejected,
      the file is considered to have failed to upload as a whole, and the file status will be set to error.`
    },

    // Event names
    fileUploadProgress: 'File upload progress event',
    fileUploadCancelled: 'File upload cancelled event',
    fileUploadPaused: 'File upload paused event',
    fileUploadError: 'File upload error event',
    fileUploadComplete: 'File upload complete event',
    fileRemoved: 'File removed event',
    fileError: 'File validation failed event',
    fileAdded: 'File added event',

    // Slot names
    defaultSlot: 'Upload button slot',
    uploadPrepend: 'Content slot before upload button',
    uploadAppend: 'Content slot after upload button',
    fileItemSlot: 'File list item slot',
    fileAppend: 'Content slot after file list item',
    filePreview: 'File preview slot in file list item',
    filePreviewAppend: 'Content slot after file preview in file list item',
    fileUploadProgressSlot: 'File upload progress bar slot in file list item',
    fileListUploadBtn: 'File upload button slot in file list item',
    fileListPauseBtn: 'File pause upload button slot in file list item',
    fileListCancelBtn: 'File cancel upload button slot in file list item',
    fileListRemoveBtn: 'File delete button slot in file list item',
    fileActionAppend: 'Content slot after file action buttons in file list item',
    fileListPreviewBtn: 'File preview button slot in file list item, only valid when listType=picture-card'
  },

  // Status text
  status: {
    pending: 'Pending',
    checking: 'Checking...',
    uploading: 'Uploading',
    completed: 'Completed',
    error: 'Failed',
    cancelled: 'Cancelled',
    paused: 'Paused'
  },

  // Common console and debug text
  debug: {
    fileAdded: 'File added:',
    fileProgress: 'File progress:',
    fileComplete: 'File upload complete:',
    uploadError: 'Upload error:',
    fileValidationError: 'File validation error',
    requestHandler: 'requestHandler',
    respondHandler: 'respondHandler',
    chunkData: 'chunkData',
    chunkUploadComplete: 'All chunks uploaded',
    fileRemove: 'onFileRemove'
  },

  // Alert messages
  alerts: {
    confirmRemove: `Are you sure you want to remove the "{filename}" file?`,
    enterBase64Image: 'Please enter Base64 image string data!',
    base64DataIncorrect: 'Base64 string data is incorrect!',
    enterByteArrayData: 'Please enter file byte array data!',
    enterByteArrayMimeType: 'Please enter MIME type of file byte array data!',
    byteArrayDataIncorrect: 'Entered file byte array data is incorrect, not a correct array string!',
    mimeTypeFormatIncorrect: 'File byte data MIME type format is incorrect!'
  }
}