const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// アップロード先フォルダ
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// アップロードエンドポイント
app.post('/upload', (req, res) => {
  try {
    const { photo, filename, userId } = req.body;

    if (!filename || !photo) {
      return res.status(400).json({ error: 'ファイル名または写真がありません' });
    }

    // Base64を Buffer に変換
    const buffer = Buffer.from(photo, 'base64');

    // ローカルに保存
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      message: 'ファイルが保存されました',
      filename: filename,
      size: buffer.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ヘルスチェック
app.get('/', (req, res) => {
  res.json({ message: 'ReceiptApp Backend サーバーが起動しています' });
});

app.listen(PORT, () => {
  console.log(`サーバーが起動: ポート ${PORT}`);
});
