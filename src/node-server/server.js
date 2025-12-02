const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { formidable } = require('formidable');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Temporary directory for chunked uploads
const tempDir = path.join(__dirname, 'chunk-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for regular file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use original filename with timestamp to avoid conflicts
    const mimeType = file.mimetype;
    const fileName = 'img.' + mimeType.split('/').pop().toLowerCase();
    console.log('multer.diskStorage, filename', fileName, file);
    const ext = path.extname(file.originalname || fileName);
    const name = path.basename(file.originalname || fileName, ext);
    const filename = `${name}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024 // 10GB max file size
  }
});

// In-memory storage for upload sessions (in production, use Redis or database)
const uploadSessions = new Map();


/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * POST /upload - Single file upload endpoint
 */
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let name = req.name;
    // Return success response with file info
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename || name,
        originalName: req.file.originalname || name,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * POST /upload/init - Initialize a chunked upload session
 */
app.post('/upload/init', async (req, res) => {
  try {
    const { fileName, fileSize, fileType, uploadId } = req.body;
    console.log('/upload/init', req.body);

    if (!fileName || !fileSize) {
      return res.status(400).json({ error: 'Missing required fields: fileName, fileSize' });
    }

    // Create session data
    const session = {
      uploadId,
      fileName,
      fileSize: parseInt(fileSize),
      fileType: fileType || '',
      uploadedSize: 0,
      totalChunks: 0,
      uploadedChunks: new Set(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hours
      tempFilePath: path.join(tempDir, uploadId)
    };

    const tempFilePath = path.resolve(__dirname, `./chunk-temp/${uploadId}`)
    console.log('/upload/init, tempFilePath', fs.existsSync(session.tempFilePath), session.tempFilePath, tempFilePath);
    // Create temporary directory for this upload
    if (!fs.existsSync(tempFilePath)) {
      try {
        fs.mkdirSync(tempFilePath, { recursive: true });
      } catch (err) {
        console.error('创建文件夹失败', err);
      }

    }

    // Store session
    uploadSessions.set(uploadId, session);

    // Clean up expired sessions periodically
    if (uploadSessions.size > 100) { // Clean up if we have too many sessions
      console.log('/upload/init 清空session')
      const now = Date.now();
      for (const [id, session] of uploadSessions) {
        if (new Date(session.expiresAt).getTime() < now) {
          cleanupUploadSession(id);
        }
      }
    }

    // Return session info
    res.json({
      success: true,
      uploadId,
      message: 'Upload session initialized successfully'
    });

  } catch (error) {
    console.error('Init upload error:', error);
    res.status(500).json({ error: 'Failed to initialize upload session' });
  }
});

/**
 * 跨分区移动文件
 * @param sourcePath 源文件地址
 * @param targetPath 目标文件地址
 * @returns {Promise<void>}
 */
async function moveFileAcrossPartitions(sourcePath, targetPath) {
  try {
    // 确保目标目录存在
    const targetDir = path.dirname(targetPath);
    fs.mkdirSync(targetDir, { recursive: true });

    // 创建可读流和可写流
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(targetPath);

    // 管道传输数据
    await new Promise((resolve, reject) => {
      readStream.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    // 删除源文件
    fs.unlinkSync(sourcePath);

    console.log(`文件移动成功（跨分区），源文件：${sourcePath}，目标文件：${targetPath}`);
  } catch (err) {
    console.error('移动文件失败:', err);
  }
}

app.post('/upload/chunk', async (req, res) => {
  try {

    const form = formidable({
      multiples: false,
      // maxFileSize: 100 * 1024 * 1024 // 100MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '解析表单失败: ' + err.message
        });
      }

      try {
        // console.log('fields', fields);
        const { uploadId, chunkIndex, filename, chunk, totalChunks } = fields;
        const chunkFiles = files.file || [];

        const chunkIndexInt = parseInt(chunkIndex[0]);
        const totalChunksInt = parseInt(totalChunks[0]);
        // console.log('chunkFiles', chunkFiles);
        if (chunkFiles.length == 0) {
          return res.status(400).json({
            success: false,
            message: '未收到分片文件'
          });
        }


        if (!uploadId[0] || isNaN(chunkIndexInt) || isNaN(totalChunks)) {
          return res.status(400).json({ error: 'Missing required fields: uploadId, chunkIndex, totalChunks' });
        }

        // Check if upload session exists
        const session = uploadSessions.get(uploadId[0]);
        if (!session) {
          return res.status(404).json({ error: 'Upload session not found' });
        }

        // Check if chunk was already uploaded
        if (session.uploadedChunks.has(chunkIndexInt)) {
          return res.json({
            success: true,
            message: 'Chunk already uploaded',
            chunkIndex: chunkIndexInt,
            status: 'duplicate'
          });
        }

        // 移动临时文件到目标位置
        const chunkPath = path.join(session.tempFilePath, `chunk_${chunkIndexInt}.tmp`);
        // fs.renameSync(chunkFiles[0].filepath, chunkPath);
        await moveFileAcrossPartitions(chunkFiles[0].filepath, chunkPath);


        // Update session with chunk info
        session.uploadedChunks.add(chunkIndexInt);
        // session.uploadedSize += req.file.size;
        session.uploadedSize += chunkFiles[0].length || 0;
        session.totalChunks = totalChunksInt;

        // Update expiration time
        session.expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        // Return success response
        res.json({
          success: true,
          message: 'Chunk uploaded successfully',
          chunkIndex: chunkIndexInt,
          totalChunks: totalChunksInt,
          uploadedSize: session.uploadedSize,
          progress: Math.round((session.uploadedSize / session.fileSize) * 100)
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          message: '分片上传失败: ' + error.message
        });
      }
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    res.status(500).json({ error: 'Failed to upload chunk' });
  }
});

/**
 * POST /upload/finalize - Finalize a chunked upload
 */
app.post('/upload/finalize', async (req, res) => {
  try {
    const { uploadId, fileName, fileSize } = req.body;

    if (!uploadId) {
      return res.status(400).json({ error: 'Missing required field: uploadId' });
    }

    // Check if upload session exists
    const session = uploadSessions.get(uploadId);
    // console.log('/upload/finalize, session', uploadId, session, uploadSessions);
    if (!session) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    // Verify all chunks were uploaded
    if (session.uploadedChunks.size !== session.totalChunks) {
      const missingChunks = [];
      for (let i = 0; i < session.totalChunks; i++) {
        if (!session.uploadedChunks.has(i)) {
          missingChunks.push(i);
        }
      }

      return res.status(400).json({
        error: 'Not all chunks have been uploaded',
        missingChunks,
        uploadedChunks: Array.from(session.uploadedChunks),
        totalChunks: session.totalChunks
      });
    }

    // Verify file size matches
    if (fileSize && parseInt(fileSize) !== session.fileSize) {
      return res.status(400).json({
        error: 'File size mismatch',
        expected: session.fileSize,
        actual: fileSize
      });
    }

    // Reassemble the file from chunks
    const finalFilePath = path.join(tempDir, session.fileName);
    const writeStream = fs.createWriteStream(finalFilePath);

    // Sort chunks by index and pipe them in order
    const chunkFiles = fs.readdirSync(session.tempFilePath);
    const sortedChunks = chunkFiles
      .filter(f => f.startsWith('chunk_'))
      .sort((a, b) => {
        const indexA = parseInt(a.split('_')[1]);
        const indexB = parseInt(b.split('_')[1]);
        return indexA - indexB;
      });

    let chunksProcessed = 0;

    // console.log('/upload/finalize, sortedChunks', sortedChunks);
    // Process each chunk in sequence
    for (const chunkFile of sortedChunks) {
      const chunkPath = path.join(session.tempFilePath, chunkFile);
      const chunkData = fs.readFileSync(chunkPath);

      if (!writeStream.write(chunkData)) {
        // If the stream wants us to wait, wait until it's ready
        await new Promise(resolve => writeStream.once('drain', resolve));
      }

      chunksProcessed++;
    }

    // Close the write stream
    writeStream.end();

    // Wait for the stream to finish writing
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Verify the final file size
    const finalStats = fs.statSync(finalFilePath);
    if (finalStats.size !== session.fileSize) {
      // Clean up and return error
      fs.unlinkSync(finalFilePath);
      cleanupUploadSession(uploadId);
      return res.status(500).json({
        error: 'Final file size does not match expected size',
        expected: session.fileSize,
        actual: finalStats.size,
        finalFilePath
      });
    }

    // Clean up temporary files
    cleanupUploadSession(uploadId);

    // Return success response
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: session.fileName,
        size: finalStats.size,
        path: finalFilePath
      }
    });

  } catch (error) {
    console.error('Finalize upload error:', error);
    res.status(500).json({ error: 'Failed to finalize upload' });
  }
});

/**
 * Clean up upload session and temporary files
 * @param {string} uploadId - The upload session ID
 */
function cleanupUploadSession(uploadId) {
  const session = uploadSessions.get(uploadId);
  // console.log('cleanupUploadSession', uploadId, session);
  if (session) {
    // Remove temporary directory
    if (fs.existsSync(session.tempFilePath)) {
      console.log('cleanupUploadSession删除临时目录', session.tempFilePath);
      try {
        fs.rmSync(session.tempFilePath, { recursive: true });
      } catch (error) {
        console.error(`Failed to remove temp directory for ${uploadId}:`, error);
      }
    }

    // Remove session from map
    uploadSessions.delete(uploadId);
  }
}

// Periodic cleanup of expired sessions (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of uploadSessions) {
    if (new Date(session.expiresAt).getTime() < now) {
      console.log(`Cleaning up expired upload session: ${id}`);
      cleanupUploadSession(id);
    }
  }
}, 60 * 60 * 1000); // Every hour

// Start server
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
  console.log(`文件上传服务器运行在端口 ${PORT}`)
  console.log(`服务地址: http://localhost:${PORT}`)
  console.log(`Upload directory: ${uploadDir}`);
  console.log(`Temp directory: ${tempDir}`);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
});

module.exports = app;
