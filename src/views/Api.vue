<template>
  <div class="api">
    <aside class="api-side">
      <ul>
        <li
          v-for="item in asideNavList"
          :key="item.id"
          @click="onAsideNavClick(item)">
          {{ item.name }}
          <small :title="$t('api.propCount')" v-if="item.propCount">{{ item.propCount }}</small>
        </li>
      </ul>
    </aside>
    <section class="api-content" ref="apiContent">
      <h4 style="margin-top: 0;" id="props">{{ $t('api.props') }}</h4>
      <table>
        <thead>
        <tr>
          <th>{{ $t('api.columnName') }}</th>
          <th>{{ $t('api.columnDescription') }}</th>
          <th>{{ $t('api.columnType') }}</th>
          <th>{{ $t('api.columnDefault') }}</th>
          <th>{{ $t('api.columnVersion') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td class="required">
            requestHandler
          </td>
          <td>
            {{ $t('api.requestHandler.description') }}
          </td>
          <td>
            <code>
            <pre>
              ({
                // Data returned by beforeUpload function for single file upload, or by beforeChunkUpload for chunked upload
                extraData: undefined || Object;
                file: File; // Upload file
                isUploadChunk: boolean; // Whether to use chunked upload
                chunkData: Object // Chunk data
              }) => Promise&lt;{
                url: string; // API request URL
                method: 'post' | 'put' | 'update';
                data: Object | FormData; // Can be regular object or FormData
                headers?: Object; // Custom request headers
                timeout?: number; // Request timeout
                withCredentials?: true | false
              }&gt;
            </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>
            respondHandler
          </td>
          <td>
            {{ $t('api.respondHandler.description') }}<br>
          </td>
          <td>
            <code>
            <pre>
              ({
                file: File; // Upload file
                isUploadChunk: boolean; // Whether to use chunked upload
                chunkData: Object // Chunk data
              }) => Promise
            </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>
            accept
          </td>
          <td>{{ $t('api.accept.description') }}</td>
          <td><code>string</code></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>
            limit
          </td>
          <td>{{ $t('api.limit.description') }}</td>
          <td><code>number</code></td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>
            multiple
          </td>
          <td>{{ $t('api.multiple.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            maxSize
          </td>
          <td>{{ $t('api.maxSize.description') }}</td>
          <td><code>number</code></td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>
            maxConcurrentUploads
          </td>
          <td>{{ $t('api.maxConcurrentUploads.description') }}</td>
          <td><code>number</code></td>
          <td><code>3</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            showUploadActionBar
          </td>
          <td>{{ $t('api.showUploadActionBar.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            hideUploaderWhenExceedLimit
          </td>
          <td>{{ $t('api.hideUploaderWhenExceedLimit.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            listType
          </td>
          <td>{{ $t('api.listType.description') }}</td>
          <td><code>default | picture-card</code></td>
          <td><code>default</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            useChunkedUpload
          </td>
          <td>{{ $t('api.useChunkedUpload.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            chunkSize
          </td>
          <td>{{ $t('api.chunkSize.description') }}</td>
          <td><code>number</code></td>
          <td><code>5 * 1024 * 1024</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            chunkSizeThreshold
          </td>
          <td>{{ $t('api.chunkSizeThreshold.description') }}</td>
          <td><code>number</code></td>
          <td><code>5 * 1024 * 1024</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            batchFileConcurrentUploads
          </td>
          <td>{{ $t('api.batchFileConcurrentUploads.description') }}</td>
          <td><code>number</code></td>
          <td><code>3</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            batchChunkConcurrentUploads
          </td>
          <td>{{ $t('api.batchChunkConcurrentUploads.description') }}</td>
          <td><code>number</code></td>
          <td><code>5</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            timeout
          </td>
          <td>{{ $t('api.timeout.description') }}</td>
          <td><code>number</code></td>
          <td><code>30000</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            drag
          </td>
          <td>{{ $t('api.drag.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td></td>
        </tr>

        <tr>
          <td>
            disabled
          </td>
          <td>{{ $t('api.disabled.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            autoUpload
          </td>
          <td>{{ $t('api.autoUpload.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            simpleFileItem
          </td>
          <td>{{ $t('api.simpleFileItem.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            showFileList
          </td>
          <td>{{ $t('api.showFileList.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            showUploadStats
          </td>
          <td>{{ $t('api.showUploadStats.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            showUploadSpeed
          </td>
          <td>{{ $t('api.showUploadSpeed.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            showRemoveButton
          </td>
          <td>{{ $t('api.showRemoveButton.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            showCancelButton
          </td>
          <td>{{ $t('api.showCancelButton.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            showPauseButton
          </td>
          <td>{{ $t('api.showPauseButton.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            simpleFileItem
          </td>
          <td>{{ $t('api.simpleFileItem.description') }}</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            fileInputAttrs
          </td>
          <td>{{ $t('api.fileInputAttrs.description') }}</td>
          <td><code>Object</code></td>
          <td><code>{}</code></td>
          <td></td>
        </tr>
        <tr>
          <td>
            statusMap
          </td>
          <td>{{ $t('api.statusMap.description') }}</td>
          <td><code>Object</code></td>
          <td>
            <code style="white-space: nowrap">

              { <br>
                &nbsp;&nbsp; pending: '{{ $t('status.pending') }}', <br>
                &nbsp;&nbsp; checking: '{{ $t('status.checking') }}', <br>
                &nbsp;&nbsp; uploading: '{{ $t('status.uploading') }}', <br>
                &nbsp;&nbsp; completed: '{{ $t('status.completed') }}', <br>
                &nbsp;&nbsp; error: '{{ $t('status.error') }}', <br>
                &nbsp;&nbsp; cancelled: '{{ $t('status.cancelled') }}', <br>
                &nbsp;&nbsp; paused: '{{ $t('status.paused') }}' <br>
              } <br>

            </code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>fileIconExtend</td>
          <td>{{ $t('api.fileIconExtend.description') }}</td>
          <td>
            <code>
            <pre>
              {
                [key: string]: {
                  type: 'emoji' | 'img';
                  value: string; // Supports emoji, image base64 string, url
                }
              }
            </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>defaultFileList</td>
          <td>{{ $t('api.defaultFileList.description') }}</td>
          <td>
            <code>
            <pre>
              {
                id: string;
                name?: string;
                previewUrl?: // Preview url, can be base64 string or url
              }
            </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>timeRemainingFormatter</td>
          <td>{{ $t('api.timeRemainingFormatter.description') }}</td>
          <td>
            <code>
            <pre>
              ({
                timeRemaining: number; // Remaining time in seconds
                hours: number;
                minutes: number;
                seconds: number;
                text: sting;
              }) => string;
             </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>previewFile</td>
          <td>{{ $t('api.previewFile.description') }}</td>
          <td>
            <code>
            <pre>
              (fileData: FileData) => string;
            </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>beforeUpload</td>
          <td>
            {{ $t('api.beforeUpload.description') }}
          </td>
          <td>
            <code>
            <pre>
              (fileData: FileData) => Promise&lt;boolean&gt;
            </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>beforeRemove</td>
          <td>{{ $t('api.beforeRemove.description') }}</td>
          <td>
            <code>
            <pre>
              (file: File, fileList: File[]) => Promise&lt;boolean&gt;
            </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>fileChange</td>
          <td>{{ $t('api.fileChange.description') }}</td>
          <td>
            <code>
            <pre>
              (file: File) => Promise&lt;boolean&gt;
            </pre>
            </code>
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>beforeUploadChunk</td>
          <td>
            {{ $t('api.beforeUploadChunk.description') }}
          </td>
          <td>
            <code>
            <pre>
              (chunkData: {
                chunk: Blob; // Chunk data
                fileData: FileData; // File data
                chunkIndex: number; // Current chunk index
                chunkSize: number; // Chunk size
                chunkStart: number; // Current chunk start position
                chunkEnd: number; // Current chunk end position
              }) => Promise&lt;boolean&gt;
            </pre>
            </code>
          </td>
          <td>--</td>
          <td></td>
        </tr>
        <tr>
          <td>chunkUploadCompleted</td>
          <td>
            {{ $t('api.chunkUploadCompleted.description') }}
          </td>
          <td>
            <code>
            <pre>
              (fileData: FileData) => Promise&lt;boolean&gt;
            </pre>
            </code>
          </td>
          <td></td>
          <td></td>
        </tr>
        </tbody>
      </table>

      <h4 id="types">{{ $t('api.types') }}</h4>
      <dl>
        <dt><code>FileData</code></dt>
        <dd>
          <pre class="language-typescript">
              interface FileData {
                id: string;
                file: File;
                name: string; // File name
                size: number; // File size
                directory: boolean;
                previewUrl: string; // File preview url
                progress: number; // Upload progress
                loaded: number;
                source: 'files' | 'defaultList'; // File source
                // Upload status
                status: 'pending' | 'checking' | 'uploading' | 'completed' | 'error' | 'cancelled' | 'paused;
                speed: string; // Upload speed
                remainingTime: string; // Remaining upload time
                startTime: null | number;
                useChunked: boolean; // Whether to use chunked upload
                chunks: number; // Chunk index list
                currentChunk: number; // Current chunk index
                uploadedChunks: number;
                xhr: null | XMLHttpRequest; // HTTP request
                extendData: Object; // Extension data provided by caller
                chunkQueue: number[]; // Chunk upload queue
                activeChunks: number; // Current active chunk upload count
                uploadedChunkSet: Set&lt;number&gt;; // Record successfully uploaded chunk indexes
                lastUpdateTime: null | number;
                lastUploadedBytes: number;
                chunkProgressMap: Map; // Store real-time upload progress for each chunk
                speedSamples: number[]; // Speed sample array for smooth calculation
                lastSpeedUpdateTime: null | number;
                fileIcon: Object; // File preview icon
              }
            </pre>
        </dd>
      </dl>

      <h4 id="events">{{ $t('api.events') }}</h4>
      <table>
        <thead>
        <tr>
          <th>{{ $t('api.columnEvent') }}</th>
          <th>{{ $t('api.columnDescription') }}</th>
          <th>{{ $t('api.columnParameter') }}</th>
          <th>{{ $t('api.columnVersion') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>file-upload-progress</td>
          <td>{{ $t('api.fileUploadProgress') }}</td>
          <td><code>fileData: FileData</code></td>
          <td></td>
        </tr>
        <tr>
          <td>file-upload-cancelled</td>
          <td>{{ $t('api.fileUploadCancelled') }}</td>
          <td><code>fileData: FileData</code></td>
          <td></td>
        </tr>
        <tr>
          <td>file-upload-paused</td>
          <td>{{ $t('api.fileUploadPaused') }}</td>
          <td><code>fileData: FileData</code></td>
          <td></td>
        </tr>
        <tr>
          <td>file-upload-error</td>
          <td>{{ $t('api.fileUploadError') }}</td>
          <td>
            <code>
              { fileData: FileData, error: error.message }
            </code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-upload-complete</td>
          <td>{{ $t('api.fileUploadComplete') }}</td>
          <td>
            <code>
              fileData: FileData
            </code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-removed</td>
          <td>{{ $t('api.fileRemoved') }}</td>
          <td><code>file: File</code></td>
          <td></td>
        </tr>
        <tr>
          <td>file-error</td>
          <td>{{ $t('api.fileError') }}</td>
          <td>
            <code>
              errorInfo: <pre>
              {
                type: 'limit' | 'maxSize' | 'accept'; // Error type
                message: string; // Error message
                file: File; // File
                limit?: number;
                currentCount?: number;
                maxSize?: number;
                fileSize?: number;
                accept?: string;
              }
            </pre>
            </code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-added</td>
          <td>{{ $t('api.fileAdded') }}</td>
          <td><code>fileData: FileData</code></td>
          <td></td>
        </tr>
        </tbody>
      </table>
      <h4 id="slots">{{ $t('api.slots') }}</h4>
      <table>
        <thead>
        <tr>
          <th>{{ $t('api.columnSlotName') }}</th>
          <th>{{ $t('api.columnDescription') }}</th>
          <th>{{ $t('api.columnParameter') }}</th>
          <th>{{ $t('api.columnVersion') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>default</td>
          <td>{{ $t('api.defaultSlot') }}</td>
          <td>
            <code>files: FileData[]</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>upload-prepend</td>
          <td>{{ $t('api.uploadPrepend') }}</td>
          <td>
            <code>files: FileData[]</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>upload-append</td>
          <td>{{ $t('api.uploadAppend') }}</td>
          <td>
            <code>files: FileData[]</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-item</td>
          <td>{{ $t('api.fileItemSlot') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-append</td>
          <td>{{ $t('api.fileAppend') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>

        <tr>
          <td>file-preview</td>
          <td>{{ $t('api.filePreview') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-preview-append</td>
          <td>{{ $t('api.filePreviewAppend') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-upload-progress</td>
          <td>{{ $t('api.fileUploadProgressSlot') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-list-upload-btn</td>
          <td>{{ $t('api.fileListUploadBtn') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-list-pause-btn</td>
          <td>{{ $t('api.fileListPauseBtn') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-list-cancel-btn</td>
          <td>{{ $t('api.fileListCancelBtn') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-list-remove-btn</td>
          <td>{{ $t('api.fileListRemoveBtn') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-action-append</td>
          <td>{{ $t('api.fileActionAppend') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>file-list-preview-btn</td>
          <td>{{ $t('api.fileListPreviewBtn') }}</td>
          <td>
            <code>fileData: FileData</code>
          </td>
          <td></td>
        </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';
// Import code highlighting plugin CSS
import 'prismjs-themes/dist/midnight.min.css';

export default {
  name: "Api",
  data () {
    return {
      asideNavList: []
    }
  },
  watch: {
    '$i18n.locale': {
      handler () {
        this.$nextTick(() => {
          let preEls = document.querySelectorAll('pre');
          for (let i = 0; i < preEls.length; i++) {
            let preEl = preEls[i];
            if (preEl.className.includes('language-')) {
              prism.highlightElement(preEl);
            }
          }

          let h4Els = this.$refs.apiContent.querySelectorAll('h4');
          this.asideNavList = [];

          for (let i = 0, len = h4Els.length; i < len; i++) {
            let h4El = h4Els[i];
            let id = h4El.id;
            let text = h4El.textContent;
            let siblingTableEl = h4El.nextSibling;
            let asideNavObj = {
              id: id,
              name: text,
              propCount: 0
            };
            console.log('siblingTableEl', siblingTableEl);
            if (siblingTableEl && siblingTableEl.nodeName === 'TABLE') {
              asideNavObj.propCount = siblingTableEl.querySelectorAll('tbody tr').length;
            }
            this.asideNavList.push(asideNavObj);
          }
        });
      },
      immediate: true,
    }
  },
  methods: {
    onAsideNavClick (navItem) {
      let h4El = document.getElementById(navItem.id);
      if (h4El) {
        document.documentElement.scrollTo({
          top: h4El.offsetTop - h4El.offsetHeight - 60,
          behavior: "smooth"
        });
      }
    }
  }
};
</script>

<style scoped lang="scss">
@use "api";
</style>
