/**
 * UploadManager - A comprehensive file upload utility
 * Supports single/multiple files, chunked uploads, folder uploads, progress tracking, speed calculation, and retry mechanisms
 */

class UploadManager {
  /**
   * Default configuration
   * @type {Object}
   */
  static DEFAULT_CONFIG = {
    // Upload endpoint
    endpoint: '/upload',

    // Maximum file size in bytes (default: 10GB)
    maxFileSize: 10 * 1024 * 1024 * 1024,

    // Allowed file types (empty array means all types allowed)
    allowedTypes: [],

    // Chunk size for large files (default: 5MB)
    chunkSize: 5 * 1024 * 1024,

    // Maximum number of concurrent uploads
    concurrentUploads: 3,

    // Retry configuration
    retry: {
      maxRetries: 3,
      baseDelay: 1000, // Base delay in ms for exponential backoff
      randomFactor: 0.1 // Randomization factor to avoid thundering herd
    },

    // HTTP headers to send with requests
    headers: {},

    // Custom data to send with uploads
    formData: {}
  };

  /**
   * Constructor
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = { ...UploadManager.DEFAULT_CONFIG, ...config };
    this.uploads = new Map(); // Store active uploads
    this.queue = []; // Upload queue for concurrency control
    this.activeUploads = 0; // Track currently active uploads
  }

  /**
   * Upload a single file
   * @param {File} file - The file to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, options = {}) {
    const fileId = this._generateFileId(file);
    const uploadConfig = { ...this.config, ...options };

    // Validate file
    this._validateFile(file, uploadConfig);

    // Create upload task
    const uploadTask = this._createUploadTask(file, uploadConfig, fileId);

    // Add to uploads map
    this.uploads.set(fileId, uploadTask);

    // Start upload
    return this._startUpload(uploadTask);
  }

  /**
   * Upload multiple files
   * @param {FileList|Array} files - Files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadFiles(files, options = {}) {
    // Convert FileList to array if needed
    const filesArray = Array.isArray(files) ? files : Array.from(files);

    // Validate all files first
    filesArray.forEach(file => {
      this._validateFile(file, { ...this.config, ...options });
    });

    // Create promises for each file
    const uploadPromises = filesArray.map(file => this.uploadFile(file, options));

    // Wait for all uploads to complete
    return Promise.allSettled(uploadPromises);
  }

  /**
   * Upload a folder
   * @param {DataTransferItem|Array<File>} item - Folder item from drag & drop or array of files
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadFolder(item, options = {}) {
    let files;

    // Handle different input types
    if (Array.isArray(item)) {
      // Array of files provided directly
      files = item;
    } else if (item.webkitGetAsEntry) {
      // DataTransferItem from drag & drop
      const entry = item.webkitGetAsEntry();
      if (!entry || !entry.isDirectory) {
        throw new Error('The provided item is not a directory');
      }

      files = await this._readDirectoryEntry(entry);
    } else {
      throw new Error('Invalid folder input');
    }

    // Filter out any non-file entries that might have slipped through
    const validFiles = files.filter(f => f instanceof File);

    // Validate all files
    validFiles.forEach(file => {
      this._validateFile(file, { ...this.config, ...options });
    });

    // Upload all files
    const uploadPromises = validFiles.map(file => this.uploadFile(file, options));

    return Promise.allSettled(uploadPromises);
  }

  /**
   * Recursively read a directory entry and collect all files
   * @private
   * @param {FileSystemDirectoryEntry} directoryEntry - Directory entry to read
   * @param {string} currentPath - Current path relative to root
   * @returns {Promise<Array<File>>} Array of files with path information
   */
  async _readDirectoryEntry(directoryEntry, currentPath = '') {
    return new Promise((resolve, reject) => {
      const reader = directoryEntry.createReader();
      const fileEntries = [];

      const readEntries = () => {
        reader.readEntries(async (entries) => {
          if (entries.length) {
            // Process all entries in this directory level
            const entryPromises = Array.from(entries).map(async (entry) => {
              const fullPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

              if (entry.isFile) {
                return new Promise((fileResolve) => {
                  entry.file(file => {
                    // Add path property to file for directory structure preservation
                    file.webkitRelativePath = fullPath;
                    fileEntries.push(file);
                    fileResolve();
                  }, fileResolve);
                });
              } else if (entry.isDirectory) {
                // Recursively read subdirectories
                const subFiles = await this._readDirectoryEntry(entry, fullPath);
                fileEntries.push(...subFiles);
              }
            });

            await Promise.all(entryPromises);
            readEntries(); // Continue reading next batch
          } else {
            // All entries have been processed
            resolve(fileEntries);
          }
        }, (error) => {
          reject(error);
        });
      };

      readEntries();
    });
  }

  /**
   * Generate a unique ID for a file
   * @private
   * @param {File} file - The file
   * @returns {string} Unique ID
   */
  _generateFileId(file) {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  /**
   * Validate file against configuration
   * @private
   * @param {File} file - The file to validate
   * @param {Object} config - Configuration to validate against
   * @throws {Error} If validation fails
   */
  _validateFile(file, config) {
    // Check file size
    if (file.size > config.maxFileSize) {
      throw new Error(`File ${file.name} exceeds maximum size of ${this._formatBytes(config.maxFileSize)}`);
    }

    // Check file type if allowedTypes is specified
    if (config.allowedTypes.length > 0) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      const isAllowed = config.allowedTypes.some(type => {
        if (type.startsWith('.')) {
          // Extension check
          return fileName.endsWith(type.toLowerCase());
        } else if (type.endsWith('/*')) {
          // MIME type wildcard (e.g., 'image/*')
          const mimeTypePrefix = type.slice(0, -1);
          return fileType.startsWith(mimeTypePrefix);
        } else {
          // Exact MIME type match
          return fileType === type;
        }
      });

      if (!isAllowed) {
        throw new Error(`File ${file.name} has an unsupported type`);
      }
    }
  }

  /**
   * Create an upload task object
   * @private
   * @param {File} file - The file to upload
   * @param {Object} config - Upload configuration
   * @param {string} fileId - Unique file ID
   * @returns {Object} Upload task
   */
  _createUploadTask(file, config, fileId) {
    return {
      id: fileId,
      file,
      config,
      status: 'pending',
      progress: 0,
      speed: 0,
      remainingTime: 0,
      uploadedBytes: 0,
      totalBytes: file.size,
      startTime: null,
      endTime: null,
      error: null,
      retries: 0,
      controller: new AbortController(),
      onProgress: null,
      onSuccess: null,
      onError: null,
      onCancel: null
    };
  }

  /**
   * Start an upload task
   * @private
   * @param {Object} task - Upload task
   * @returns {Promise<Object>} Upload result
   */
  async _startUpload(task) {
    task.status = 'uploading';
    task.startTime = Date.now();

    try {
      // Determine if we need chunked upload
      const useChunkedUpload = task.file.size > task.config.chunkSize;

      let result;
      if (useChunkedUpload) {
        result = await this._uploadInChunks(task);
      } else {
        result = await this._uploadSingleRequest(task);
      }

      task.status = 'completed';
      task.endTime = Date.now();
      task.onSuccess && task.onSuccess(result);

      return {
        success: true,
        file: task.file,
        response: result,
        timeElapsed: task.endTime - task.startTime,
        finalSpeed: task.totalBytes / (task.endTime - task.startTime) * 1000
      };
    } catch (error) {
      task.status = 'failed';
      task.error = error;
      task.onError && task.onError(error);

      throw error;
    }
  }

  /**
   * Set progress callback for a specific upload
   * @param {string} uploadId - The upload ID
   * @param {Function} callback - The progress callback function
   */
  onProgress(uploadId, callback) {
    const task = this.uploads.get(uploadId);
    console.log('UploaderManage, onProgress', uploadId, task);
    if (task) {
      task.onProgress = callback;
    }
  }

  /**
   * Set success callback for a specific upload
   * @param {string} uploadId - The upload ID
   * @param {Function} callback - The success callback function
   */
  onSuccess(uploadId, callback) {
    const task = this.uploads.get(uploadId);
    if (task) {
      task.onSuccess = callback;
    }
  }

  /**
   * Set error callback for a specific upload
   * @param {string} uploadId - The upload ID
   * @param {Function} callback - The error callback function
   */
  onError(uploadId, callback) {
    const task = this.uploads.get(uploadId);
    if (task) {
      task.onError = callback;
    }
  }

  /**
   * Set cancel callback for a specific upload
   * @param {string} uploadId - The upload ID
   * @param {Function} callback - The cancel callback function
   */
  onCancel(uploadId, callback) {
    const task = this.uploads.get(uploadId);
    if (task) {
      task.onCancel = callback;
    }
  }

  /**
   * Upload file in chunks
   * @private
   * @param {Object} task - Upload task
   * @returns {Promise<any>} Server response
   */
  async _uploadInChunks(task) {
    const { file, config } = task;
    const chunkSize = config.chunkSize;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = task.id;

    // Initialize chunk upload state
    task.totalChunks = totalChunks;
    task.uploadedChunks = 0;

    // Send initial request to create upload session (if supported by server)
    let uploadId;
    try {
      const initResponse = await this._initializeChunkedUpload(file, task);
      uploadId = initResponse.uploadId;
    } catch (error) {
      console.error('_uploadInChunks', error);
      // If initialization fails, fall back to single request if file is small enough
      if (file.size <= UploadManager.DEFAULT_CONFIG.maxFileSize) {
        return this._uploadSingleRequest(task);
      }
      throw error;
    }

    // Upload chunks sequentially
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Check if upload was canceled
      if (task.controller.signal.aborted) {
        throw new Error('Upload canceled');
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      // Create form data for this chunk
      const formData = new FormData();
      formData.append('file', chunk, file.name);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size);
      formData.append('uploadId', uploadId);

      // Add custom form data
      Object.keys(config.formData).forEach(key => {
        formData.append(key, config.formData[key]);
      });

      // Upload this chunk with retry logic
      let chunkSuccess = false;
      let lastError;

      for (let attempt = 0; attempt <= config.retry.maxRetries; attempt++) {
        try {
          await this._uploadChunk(formData, config, task, chunkIndex, totalChunks);
          chunkSuccess = true;
          break;
        } catch (error) {
          lastError = error;
          task.retries++;

          if (attempt < config.retry.maxRetries) {
            // Exponential backoff with jitter
            const delay = config.retry.baseDelay * Math.pow(2, attempt);
            const jitter = delay * config.retry.randomFactor * (Math.random() - 0.5) * 2;
            const totalDelay = delay + jitter;

            await this._sleep(Math.max(totalDelay, 0));
          }
        }
      }

      if (!chunkSuccess) {
        throw lastError;
      }

      // Update progress
      task.uploadedChunks++;
      task.uploadedBytes = Math.min(end, file.size);
      task.progress = Math.round((task.uploadedBytes * 100) / file.size);

      // Calculate speed and remaining time
      const currentTime = Date.now();
      const timeElapsed = (currentTime - task.startTime) / 1000;
      task.speed = timeElapsed > 0 ? task.uploadedBytes / timeElapsed : 0;
      task.remainingTime = task.speed > 0 ? (file.size - task.uploadedBytes) / task.speed : 0;

      console.log('_uploadInChunks执行onProgress', task, task.onProgress);
      // Call progress callback
      task.onProgress && task.onProgress({
        loaded: task.uploadedBytes,
        total: file.size,
        progress: task.progress,
        speed: task.speed,
        remainingTime: task.remainingTime,
        timeElapsed,
        chunkIndex,
        totalChunks
      });
    }

    // Finalize upload
    return this._finalizeChunkedUpload(uploadId, file, task);
  }

  /**
   * Initialize chunked upload session
   * @private
   * @param {File} file - The file being uploaded
   * @param {Object} task - Upload task
   * @returns {Promise<Object>} Initialization response
   */
  async _initializeChunkedUpload(file, task) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      const data = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }

      // Append file metadata
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size);
      formData.append('fileType', file.type);

      // Add custom form data
      Object.keys(task.config.formData).forEach(key => {
        formData.append(key, task.config.formData[key]);
        data[key] = task.config.formData[key];
      });

      // Open connection to initialization endpoint
      xhr.open('POST', `${task.config.endpoint}/init`);

      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      // Set headers
      Object.keys(task.config.headers).forEach(key => {
        xhr.setRequestHeader(key, task.config.headers[key]);
      });

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

      // Set abort signal
      if (task.controller.signal) {
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload initialization canceled'));
        });
      }

      // Send request
      // xhr.send(formData);
      xhr.send(JSON.stringify(data));
    });
  }

  /**
   * Upload a single chunk
   * @private
   * @param {FormData} formData - Form data containing the chunk
   * @param {Object} config - Upload configuration
   * @param {Object} task - Upload task
   * @param {number} chunkIndex - Current chunk index
   * @param {number} totalChunks - Total number of chunks
   * @returns {Promise<any>} Server response
   */
  async _uploadChunk(formData, config, task, chunkIndex, totalChunks) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set up event listeners
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && task.onProgress) {
          // Calculate overall progress including this chunk
          const chunkProgress = (e.loaded * 100) / e.total;
          const overallProgress = ((chunkIndex * 100) + chunkProgress) / totalChunks;

          const currentTime = Date.now();
          const timeElapsed = (currentTime - task.startTime) / 1000;
          const uploadedSoFar = task.uploadedBytes + e.loaded;
          const speed = timeElapsed > 0 ? uploadedSoFar / timeElapsed : 0;
          const remainingTime = speed > 0 ? (task.totalBytes - uploadedSoFar) / speed : 0;

          task.onProgress({
            loaded: uploadedSoFar,
            total: task.totalBytes,
            progress: Math.round(overallProgress),
            speed,
            remainingTime,
            timeElapsed,
            chunkIndex,
            totalChunks,
            chunkProgress: Math.round(chunkProgress)
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve({}); // Return empty object if response is not JSON
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred during chunk upload'));
      });

      // Open connection
      // xhr.open('POST', config.endpoint);
      xhr.open('POST', `${config.endpoint}/chunk`);

      // Set headers
      Object.keys(config.headers).forEach(key => {
        xhr.setRequestHeader(key, config.headers[key]);
      });

      // Set abort signal
      if (task.controller.signal) {
        xhr.addEventListener('progress', () => {
          if (task.controller.signal.aborted) {
            xhr.abort();
          }
        });
      }

      // Send request
      xhr.send(formData);
    });
  }

  /**
   * Finalize chunked upload
   * @private
   * @param {string} uploadId - Upload session ID
   * @param {File} file - The original file
   * @param {Object} task - Upload task
   * @returns {Promise<any>} Server response
   */
  async _finalizeChunkedUpload(uploadId, file, task) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      const data = {
        uploadId: uploadId,
        fileName: file.name,
        fileSize: file.size,
      };

      // Append finalization data
      formData.append('uploadId', uploadId);
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size);

      // Add custom form data
      Object.keys(task.config.formData).forEach(key => {
        formData.append(key, task.config.formData[key]);
        data[key] = task.config.formData[key];
      });

      // Open connection to finalization endpoint
      xhr.open('POST', `${task.config.endpoint}/finalize`);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

      // Set headers
      Object.keys(task.config.headers).forEach(key => {
        xhr.setRequestHeader(key, task.config.headers[key]);
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve({}); // Return empty object if response is not JSON
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred during upload finalization'));
      });

      // Set abort signal
      if (task.controller.signal) {
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload finalization canceled'));
        });
      }

      // Send request
      // xhr.send(formData);
      xhr.send(JSON.stringify(data));
    });
  }

  /**
   * Sleep for a specified amount of time
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Upload file in a single request
   * @private
   * @param {Object} task - Upload task
   * @returns {Promise<any>} Server response
   */
  async _uploadSingleRequest(task) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      // Append file
      formData.append('file', task.file, task.file.name);

      // Append custom form data
      Object.keys(task.config.formData).forEach(key => {
        formData.append(key, task.config.formData[key]);
      });

      // Set up event listeners
      xhr.upload.addEventListener('progress', (e) => {
        console.log('Upload progress event:', e);

        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          const currentTime = Date.now();
          const timeElapsed = (currentTime - task.startTime) / 1000;

          // Update task progress
          task.progress = progress;
          task.uploadedBytes = e.loaded;
          task.speed = timeElapsed > 0 ? e.loaded / timeElapsed : 0;
          task.remainingTime = task.speed > 0 ? (task.totalBytes - e.loaded) / task.speed : 0;

          console.log('Progress data:', { progress, speed: task.speed, remainingTime: task.remainingTime });

          // Call progress callback
          if (task.onProgress) {
            task.onProgress({
              loaded: e.loaded,
              total: e.total,
              progress,
              speed: task.speed,
              remainingTime: task.remainingTime,
              timeElapsed
            });
          } else {
            console.log('No onProgress callback set');
          }
        }
      }, false);

      xhr.addEventListener('load', () => {
        console.log('Upload load event:', xhr.status, xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve({}); // Return empty object if response is not JSON
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }, false);

      xhr.addEventListener('error', (e) => {
        console.error('Upload error event:', e);
        reject(new Error('Network error occurred during upload'));
      }, false);

      xhr.addEventListener('abort', () => {
        console.log('Upload abort event');
        task.status = 'canceled';
        if (task.onCancel) {
          task.onCancel();
        }
        reject(new Error('Upload canceled'));
      }, false);

      // Open connection
      xhr.open('POST', task.config.endpoint, true);

      // Set headers
      Object.keys(task.config.headers).forEach(key => {
        xhr.setRequestHeader(key, task.config.headers[key]);
      });

      // Set Content-Type header properly
      // Let browser set Content-Type for FormData

      // Send request
      xhr.send(formData);

      // Store xhr reference for potential cancellation
      task.xhr = xhr;
    });
  }

  /**
   * Format bytes to human readable string
   * @private
   * @param {number} bytes - Number of bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted string
   */
  _formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

export default UploadManager;
