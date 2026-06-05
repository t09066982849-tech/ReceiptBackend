const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Google Drive 認証設定
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// アップロードエンドポイント
app.post('/upload', async (req, res) => {
  console.log('📩 リクエスト受信');
  try {
    const { photo, filename, userId } = req.body;

    if (!filename || !photo) {
      return res.status(400).json({ error: 'ファイル名または写真がありません' });
    }

    const buffer = Buffer.from(photo, 'base64');
    console.log('📸 写真サイズ:', buffer.length, 'bytes');

    // Google Drive にアップロード
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: 'image/jpeg',
        body: stream,
      },
    });

    console.log('✅ Google Drive 保存成功:', filename);

    res.json({
      success: true,
      message: 'Google Drive に保存されました',
      filename,
      size: buffer.length,
      driveFileId: driveResponse.data.id,
    });
  } catch (error) {
    console.log('❌ エラー:', error.message);
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
