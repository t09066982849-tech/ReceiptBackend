const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Fileforce S3 クライアント設定
const s3Client = new S3Client({
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.FILEFORCE_ACCESS_KEY,
    secretAccessKey: process.env.FILEFORCE_SECRET_KEY,
  },
  endpoint: process.env.FILEFORCE_ENDPOINT,
  forcePathStyle: true,
});

app.post('/upload', async (req, res) => {
  console.log('📩 リクエスト受信');

  try {
    const { photo, filename, userId } = req.body;

    if (!filename || !photo) {
      return res.status(400).json({ error: 'ファイル名または写真がありません' });
    }

    const buffer = Buffer.from(photo, 'base64');
    console.log('📸 写真サイズ:', buffer.length, 'bytes');

    // Fileforce にアップロード
    const uploadParams = {
      Bucket: process.env.FILEFORCE_BUCKET,
      Key: `領収書/${filename}`,
      Body: buffer,
      ContentType: 'image/jpeg',
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    console.log('✅ Fileforce 保存成功:', filename);

    res.json({
      success: true,
      message: 'Fileforce に保存されました',
      filename,
      size: buffer.length,
    });
  } catch (error) {
    console.log('❌ エラー:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/download', (req, res) => {
  const apkPath = path.join(__dirname, 'apk', 'ReceiptApp.apk');
  if (!fs.existsSync(apkPath)) {
    return res.status(404).json({ error: 'APK ファイルが見つかりません' });
  }
  res.download(apkPath, 'ReceiptApp.apk');
});

app.get('/', (req, res) => {
  res.json({ message: 'ReceiptApp Backend サーバーが起動しています' });
});

app.listen(PORT, () => {
  console.log(`サーバーが起動: ポート ${PORT}`);
});
