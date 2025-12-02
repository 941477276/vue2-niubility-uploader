export const errorMsgs = {
  beforeUploadRejected: {
    code: 1000,
    message: 'beforeUpload method rejected'
  },
  beforeChunkUploadRejected: {
    code: 1001,
    message: 'beforeUploadChunk method rejected'
  },
  missingRequestHandler: {
    code: 1002,
    message: 'missing requestHandler parameter or requestHandler is ot a function',
  },
  responseHandlerRejected: {
    code: 1004,
    message: 'responseHandler rejected'
  },
  requestHandlerInvalidReturnData: {
    code: 1005,
    message: 'requestHandler must return an object containing "url", "method", and "data" properties',
  }
};

// 默认超时时间
export const defaultTimeout = 60000 * 5;

/**
 * 调用 requestHandler 函数
 * @param requestHandler
 * @param requestHandlerParams 传递给 requestHandler 函数的参数
 * @returns {Promise<{code: number, message: string}|{code: number, message: (string|string)}>}
 */
export async function invokeRequestHandler(requestHandler, requestHandlerParams) {
  let requestHandlerRes = await requestHandler(requestHandlerParams);
  if (!requestHandlerRes || typeof requestHandlerRes !== 'object') {
    return errorMsgs.requestHandlerInvalidReturnData;
  }
  let {
    url,
    method,
    data
  } = requestHandlerRes;
  let missingParameters = [];
  if (!url) {
    missingParameters.push('url');
  }
  if (!method) {
    missingParameters.push('method');
  }
  if (!data) {
    missingParameters.push('data');
  }
  let dataIsObject = typeof data === 'object';
  if (missingParameters.length > 0 || typeof data !== 'object') {
    let msg = missingParameters.length > 0 ? `missing "${missingParameters.join(', ')}" parameters.` : '';
    if (data && !dataIsObject) {
      msg += ' "data" must be an object.';
    }
    msg += '(from requestHandler method).';
    let error = {
      code: 1003,
      message: msg
    };
    return error;
  }
  return {
    code: 0,
    message: '',
    ...requestHandlerRes
  };
}

/**
 * 简单的获取数据hash值函数
 * @param str
 * @returns {string}
 */
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = Math.imul(hash, 31); // 更好的32位整数处理
  }
  return (hash >>> 0).toString(16); // 返回16进制字符串
}

// 单文件上传函数（对象传参）
export function uploadSingleFile({
  file,
  fileData,
  onProgress,
  onComplete,
  onError,
  onBeforeUpload,
  onCancel, // 新增取消回调
  requestHandler,
  responseHandler,
  timeout,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!isFunction(requestHandler)) {
        reject(errorMsgs.missingRequestHandler);
        isFunction(onError) && onError(errorMsgs.missingRequestHandler);
        return;
      }
      // 上传前检查
      let beforeUploadCheckPromise = Promise.resolve();
      if (typeof onBeforeUpload === 'function') {
        beforeUploadCheckPromise = onBeforeUpload(fileData);
      }

      let xhr = null;
      let isCancelled = false;

      // 设置取消回调
      if (onCancel) {
        onCancel(() => {
          isCancelled = true;
          if (xhr && xhr.readyState !== 4) {
            xhr.abort();
          }
          reject(new Error('Upload cancelled'));
        });
      }
      // 等待beforeUpload函数执行完成
      let beforeUploadCheckRes = await beforeUploadCheckPromise;
      if (beforeUploadCheckRes === false) {
        reject(errorMsgs.beforeUploadRejected);
        isFunction(onError) && onError(errorMsgs.beforeUploadRejected);
        return;
      }
      if (isCancelled) return;

      /* let requestHandlerRes = await requestHandler({
        file,
        isUploadChunk: false,
        extraData: beforeUploadCheckRes
      });
      let {
        url,
        method,
        data,
        headers,
        timeout: timeout2,
        withCredentials,
      } = requestHandlerRes;
      let missingParameters = [];
      if (!url) {
        missingParameters.push('url');
      }
      if (!method) {
        missingParameters.push('method');
      }
      if (!data) {
        missingParameters.push('data');
      }
      let dataIsObject = typeof data === 'object';
      if (missingParameters.length > 0 || typeof data !== 'object') {
        let msg = missingParameters.length > 0 ? `missing "${missingParameters.join(', ')}" parameters.` : '';
        if (data && !dataIsObject) {
          msg += ' "data" must be an object.';
        }
        msg += '(from requestHandler method).';
        let error = {
          code: 1003,
          message: msg
        }
        reject(error);
        isFunction(onError) && onError(error);
        return;
      } */
      let requestHandlerRes = await invokeRequestHandler(requestHandler, {
        file,
        name: fileData.name,
        isUploadChunk: false,
        extraData: beforeUploadCheckRes
      });

      if (requestHandlerRes.code !== 0) {
        if (onError) onError(requestHandlerRes);
        reject(requestHandlerRes);
        return;
      }

      let {
        url,
        method,
        data,
        headers,
        timeout: timeout2,
        withCredentials,
      } = requestHandlerRes;

      xhr = new XMLHttpRequest();
      let formData = new FormData();
      if (data instanceof FormData) {
        formData = data;
      } else {
        for (let key in data) {
          formData.append(key, data[key]);
        }
      }

      let startTime = Date.now();
      let lastLoaded = 0;

      xhr.upload.addEventListener('progress', (e) => {
        if (isCancelled) return;

        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          const currentTime = Date.now();
          // const elapsedTime = (currentTime - startTime) / 1000;

          // 计算上传速度
          const speed = (e.loaded - lastLoaded) / (currentTime - startTime) * 1000;
          lastLoaded = e.loaded;

          // 计算剩余时间
          const remainingBytes = e.total - e.loaded;
          const remainingTime = speed > 0 ? remainingBytes / speed : 0;

          if (onProgress) {
            onProgress({
              progress: progress,
              loaded: e.loaded,
              total: e.total,
              speed: formatSpeed(speed),
              remainingTime,
              remainingTimeFormated: formatTime(remainingTime)
            });
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (isCancelled) return;

        if (xhr.status === 200) {
          const doComplete = () => {
            if (onComplete) onComplete();
            resolve(xhr.response);
          }
          if (isFunction(responseHandler)) {
            let responseHandlerRes = responseHandler({
              file,
              isUploadChunk: false,
              xhr,
              response: xhr.response
            });
            if (isPromise(responseHandlerRes)) {
              responseHandlerRes
                .then(() => {
                doComplete();
              })
                .catch((err) => {
                  let error = {
                    xhr,
                    error: err,
                    ...errorMsgs.responseHandlerRejected
                  };
                  if (onError) onError(error);
                  reject(error);
                });
              return;
            }
          }
          doComplete();
        } else {
          if (onError) onError({
            xhr,
            code: xhr.status,
            message: xhr.statusText
          });
          reject(new Error(xhr.statusText));
        }
      });

      xhr.addEventListener('error', (xhr) => {
        if (isCancelled) return;

        if (onError) onError({
          code: xhr.status,
          xhr,
          message: 'Network error'
        });
        reject(new Error('Network error'));
      });

      // xhr.open('POST', 'http://localhost:3001/upload');
      xhr.open(method.toUpperCase(), url);

      if (headers && typeof headers === 'object') {
        for (const key in headers) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }
      if (timeout2 && timeout2 > 0) {
        xhr.timeout = timeout2;
      } else {
        xhr.timeout = (timeout && timeout > 0) ? timeout : defaultTimeout;
      }
      xhr.withCredentials = withCredentials;
      xhr.send(formData);

    } catch (error) {
      console.error('uploadSingleFile error', error);
      if (onError) onError(error);
      reject(error);
    }
  });
}

// 分片上传函数（对象传参）
/* export function uploadFileInChunks({
                                     fileData,
                                     file,
                                     chunkSize,
                                     onProgress,
                                     onComplete,
                                     onError,
                                     onBeforeUpload,
                                     onCancel // 新增取消回调
                                   }) {
  return new Promise(async (resolve, reject) => {
    try {
      // 上传前检查
      let beforeUploadCheckPromise = Promise.resolve();
      if (typeof onBeforeUpload === 'function') {
        beforeUploadCheckPromise = onBeforeUpload(fileData);
      }

      // 存储所有分片的XHR对象
      const activeXHRs = [];
      let isCancelled = false;

      // 设置取消回调
      if (onCancel) {
        onCancel(() => {
          isCancelled = true;
          // 中止所有活跃的XHR请求
          activeXHRs.forEach(xhr => {
            if (xhr && xhr.readyState !== 4) {
              xhr.abort();
            }
          });
          reject(new Error('Upload cancelled'));
        });
      }

      beforeUploadCheckPromise.then(() => {
        if (isCancelled) return;

        const totalChunks = Math.ceil(file.size / chunkSize);
        let uploadedChunks = 0;
        let uploadedBytes = 0;
        let startTime = Date.now();
        let lastUpdateTime = startTime;
        let lastUploadedBytes = 0;

        const uploadChunk = (chunkIndex) => {
          if (isCancelled) return;

          if (chunkIndex >= totalChunks) {
            if (onComplete) onComplete();
            resolve();
            return;
          }

          const start = chunkIndex * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append('file', chunk);
          formData.append('fileName', file.name);
          formData.append('uploadId', fileData.id);
          formData.append('chunkIndex', chunkIndex);
          formData.append('totalChunks', totalChunks);

          const xhr = new XMLHttpRequest();
          activeXHRs.push(xhr);

          // 添加分片上传进度监听
          xhr.upload.addEventListener('progress', (e) => {
            if (isCancelled) return;

            if (e.lengthComputable) {
              const currentTime = Date.now();
              const elapsedTime = (currentTime - startTime) / 1000;

              // 计算当前分片的实时上传字节数
              const currentChunkUploadedBytes = e.loaded;
              const totalUploadedBytes = uploadedBytes + currentChunkUploadedBytes;

              // 计算实时进度
              const progress = (uploadedChunks + (e.loaded / e.total)) / totalChunks * 100;

              // 计算实时上传速度（基于最近一段时间的数据）
              const timeDiff = (currentTime - lastUpdateTime) / 1000;
              if (timeDiff > 0.1) { // 每100ms更新一次速度
                const bytesDiff = totalUploadedBytes - lastUploadedBytes;
                const instantSpeed = bytesDiff / timeDiff;

                // 计算剩余时间
                const remainingBytes = file.size - totalUploadedBytes;
                const remainingTime = instantSpeed > 0 ? remainingBytes / instantSpeed : 0;

                if (onProgress) {
                  onProgress({
                    progress: progress,
                    loaded: totalUploadedBytes,
                    total: file.size,
                    speed: formatSpeed(instantSpeed),
                    remainingTime: formatTime(remainingTime),
                    chunkIndex: chunkIndex,
                    totalChunks: totalChunks
                  });
                }

                lastUpdateTime = currentTime;
                lastUploadedBytes = totalUploadedBytes;
              }
            }
          });

          xhr.addEventListener('load', () => {
            if (isCancelled) return;

            // 从活跃列表中移除
            const index = activeXHRs.indexOf(xhr);
            if (index > -1) {
              activeXHRs.splice(index, 1);
            }

            if (xhr.status === 200) {
              uploadedChunks++;
              uploadedBytes += (end - start);

              // 计算进度
              const progress = (uploadedChunks / totalChunks) * 100;
              const currentTime = Date.now();
              const elapsedTime = (currentTime - startTime) / 1000;

              // 计算上传速度
              const speed = uploadedBytes / elapsedTime;

              // 计算剩余时间
              const remainingBytes = file.size - uploadedBytes;
              const remainingTime = speed > 0 ? remainingBytes / speed : 0;

              if (onProgress) {
                onProgress({
                  progress: progress,
                  loaded: uploadedBytes,
                  total: file.size,
                  speed: formatSpeed(speed),
                  remainingTime: formatTime(remainingTime),
                  chunkIndex: chunkIndex,
                  totalChunks: totalChunks
                });
              }

              // 上传下一个分片
              uploadChunk(chunkIndex + 1);
            } else {
              if (onError) onError(xhr.statusText);
              reject(new Error(xhr.statusText));
            }
          });

          xhr.addEventListener('error', (err) => {
            if (isCancelled) return;

            // 从活跃列表中移除
            const index = activeXHRs.indexOf(xhr);
            if (index > -1) {
              activeXHRs.splice(index, 1);
            }

            console.error('分片上传出错', err);
            if (onError) onError('Network error');
            reject(new Error('Network error'));
          });

          xhr.open('POST', 'http://localhost:3001/upload/chunk');
          xhr.send(formData);
        };

        // 开始上传第一个分片
        uploadChunk(0);
      })
        .catch((error) => {
          if (onError) onError(error.message);
          reject(error);
        });

    } catch (error) {
      if (onError) onError(error.message);
      reject(error);
    }
  });
} */

// 格式化速度
export function formatSpeed(bytesPerSecond) {
  if (bytesPerSecond === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));

  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化时间
export function formatTime(seconds) {
  let result = {
    timeRemaining: seconds,
    hours: 0,
    minutes: 0,
    seconds: 0,
    text: ''
  }
  if (seconds === 0) {
    result.text = '0秒';
    return result;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  result.hours = hours;
  result.minutes = minutes;
  result.seconds = secs;
  if (hours > 0) {
    result.text = `${hours}小时${minutes}分${secs}秒`;
  } else if (minutes > 0) {
    result.text = `${minutes}分${secs}秒`;
  } else {
    result.text = `${secs}秒`;
  }
  return result;
}

// 格式化文件大小
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 检查文件是否为图片
export function isImageFile(file) {
  return file && file.type && file.type.startsWith('image/');
}

// 生成文件预览URL
export function generatePreviewUrl(file, useCreateObjectURL = true) {
  return new Promise((resolve) => {
    if (!isImageFile(file)) {
      resolve(null);
      return;
    }

    const previewImgByFileReader = function () {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    if (file.size < 1024 * 1024 * 2) {
      previewImgByFileReader();
    } else {
      if (useCreateObjectURL) {
        resolve(URL.createObjectURL(file));
        return;
      }
      previewImgByFileReader();
    }
  });
}

// 获取文件图标
export function getFileIcon(fileName, extendIcons) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const iconPdf = '📄';
  const iconDoc = '📝';
  const iconXls = '📊';
  const iconPpt = '📽️';
  const iconImg = '🖼️';
  const iconZip = '📦';
  const iconAudio = '🎵';
  const iconVideo = '🎬';
  const icons = {
    pdf: iconPdf,
    doc: iconDoc,
    docx: iconDoc,
    xls: iconXls,
    xlsx: iconXls,
    ppt: iconPpt,
    pptx: iconPpt,
    jpg: iconImg,
    jpeg: iconImg,
    png: iconImg,
    gif: iconImg,
    txt: '📃',
    zip: iconZip,
    rar: iconZip,
    mp3: iconAudio,
    wma: iconAudio,
    cd: iconAudio,
    midi: iconAudio,
    mp4: iconVideo,
    avi: iconVideo,
    mov: iconVideo,
    asf: iconVideo,
    mpeg: iconVideo,
    rmvb: iconVideo,
  };
  const result = {}
  Object.entries(icons).forEach((entry) => {
    result[entry[0]] = {
      type: 'emoji', // type支持的值emoji、img
      value: entry[1],
    };
  });
  if (extendIcons && typeof extendIcons === 'object') {
    // Object.assign(iconDoc, extendIcons);
    Object.entries(extendIcons).forEach(entry => {
      const [key, value] = entry;
      if (value && typeof key === 'object') {
        result[key] = value;
      }
    });
  }

  return result[ext] || { type: 'emoji', value: iconPdf };
}

// 判断变量是否为函数
export function isFunction (varr) {
  return typeof varr === 'function';
}

/**
 * 判断对象是否为promise对象
 * @param obj
 * @returns {boolean}
 */
export function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || isFunction(obj)) && isFunction(obj.then)
}

/**
 * base64数据转blob
 * @param base64Data
 * @returns {module:buffer.Blob}
 */
export function base64ToBlob(base64Data) {
  // 分离MIME类型和Base64数据
  const parts = base64Data.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const base64 = parts[1];
  console.log('base64ToBlob1', mime, base64)

  // 解码Base64字符串
  const byteString = atob(base64);

  // 创建字节数组
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  // 创建并返回Blob对象
  return new Blob([byteArray], {type: mime});
}
