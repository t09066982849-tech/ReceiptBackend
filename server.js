const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.post('/upload', (req, res) => {
  console.log('📩 リクエスト受信');
  console.log('Body keys:', Object.keys(req.body));

  try {
    const { photo, filename, userId } = req.body;

    console.log('filename:', filename);
    console.log('photo length:', photo ? photo.length : 'なし');

    if (!filename || !photo) {
      console.log('❌ ファイル名または写真がありません');
      return res.status(400).json({ error: 'ファイル名または写真がありません' });
    }

    const buffer = Buffer.from(photo, 'base64');
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    console.log('✅ 保存成功:', filename, buffer.length, 'bytes');

    res.json({
      success: true,
      message: 'ファイルが保存されました',
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
