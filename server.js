<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// CORS 有効化
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('apk')); // APK フォルダを静的ファイルとして配信

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// アップロードエンドポイント
app.post('/upload', (req, res) => {
  try {
    const { photo, filename, userId } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'ファイル名がありません' });
    }

    if (!photo) {
      return res.status(400).json({ error: '写真データがありません' });
    }

    const buffer = Buffer.from(photo, 'base64');
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);
    const fileSize = fs.statSync(filePath).size;

    console.log(`\n✅ ファイル保存成功`);
    console.log(`   ファイル名: ${filename}`);
    console.log(`   ユーザー: ${userId}`);
    console.log(`   サイズ: ${(fileSize / 1024).toFixed(2)} KB`);
    console.log(`   保存先: ${filePath}\n`);

    res.json({
      success: true,
      message: 'ファイルが保存されました',
      filename: filename,
      size: fileSize,
      savePath: filePath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ エラー:', error.message);
    res.status(500).json({ error: 'ファイル保存エラー: ' + error.message });
  }
});

// APK ダウンロードエンドポイント
app.get('/download/ReceiptApp.apk', (req, res) => {
  const apkPath = path.join(__dirname, 'apk', 'ReceiptApp.apk');
  
  if (!fs.existsSync(apkPath)) {
    return res.status(404).json({ error: 'APK ファイルが見つかりません' });
  }

  console.log(`📥 APK ダウンロード: ${apkPath}`);
  res.download(apkPath, 'ReceiptApp.apk');
});

// ダウンロードページ
app.get('/download', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ReceiptApp ダウンロード</title>
      <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        a { background: #51cf66; color: white; padding: 20px 40px; text-decoration: none; border-radius: 10px; font-size: 18px; }
      </style>
    </head>
    <body>
      <h1>📱 ReceiptApp</h1>
      <p>以下のボタンをタップして、APK をダウンロード・インストールしてください</p>
      <a href="/download/ReceiptApp.apk">📥 APK をダウンロード</a>
    </body>
    </html>
  `;
  res.send(html);
});

// ヘルスチェック
app.get('/', (req, res) => {
  res.json({ 
    message: 'ReceiptApp Backend サーバーが起動しています',
    endpoints: [
      'POST /upload - 写真をアップロード',
      'GET /download - ダウンロードページ',
      'GET /download/ReceiptApp.apk - APK ダウンロード'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 サーバーが起動しました`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   ダウンロード: http://localhost:${PORT}/download\n`);
=======
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// CORS 有効化
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('apk')); // APK フォルダを静的ファイルとして配信

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// アップロードエンドポイント
app.post('/upload', (req, res) => {
  try {
    const { photo, filename, userId } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'ファイル名がありません' });
    }

    if (!photo) {
      return res.status(400).json({ error: '写真データがありません' });
    }

    const buffer = Buffer.from(photo, 'base64');
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);
    const fileSize = fs.statSync(filePath).size;

    console.log(`\n✅ ファイル保存成功`);
    console.log(`   ファイル名: ${filename}`);
    console.log(`   ユーザー: ${userId}`);
    console.log(`   サイズ: ${(fileSize / 1024).toFixed(2)} KB`);
    console.log(`   保存先: ${filePath}\n`);

    res.json({
      success: true,
      message: 'ファイルが保存されました',
      filename: filename,
      size: fileSize,
      savePath: filePath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ エラー:', error.message);
    res.status(500).json({ error: 'ファイル保存エラー: ' + error.message });
  }
});

// APK ダウンロードエンドポイント
app.get('/download/ReceiptApp.apk', (req, res) => {
  const apkPath = path.join(__dirname, 'apk', 'ReceiptApp.apk');
  
  if (!fs.existsSync(apkPath)) {
    return res.status(404).json({ error: 'APK ファイルが見つかりません' });
  }

  console.log(`📥 APK ダウンロード: ${apkPath}`);
  res.download(apkPath, 'ReceiptApp.apk');
});

// ダウンロードページ
app.get('/download', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ReceiptApp ダウンロード</title>
      <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        a { background: #51cf66; color: white; padding: 20px 40px; text-decoration: none; border-radius: 10px; font-size: 18px; }
      </style>
    </head>
    <body>
      <h1>📱 ReceiptApp</h1>
      <p>以下のボタンをタップして、APK をダウンロード・インストールしてください</p>
      <a href="/download/ReceiptApp.apk">📥 APK をダウンロード</a>
    </body>
    </html>
  `;
  res.send(html);
});

// ヘルスチェック
app.get('/', (req, res) => {
  res.json({ 
    message: 'ReceiptApp Backend サーバーが起動しています',
    endpoints: [
      'POST /upload - 写真をアップロード',
      'GET /download - ダウンロードページ',
      'GET /download/ReceiptApp.apk - APK ダウンロード'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 サーバーが起動しました`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   ダウンロード: http://localhost:${PORT}/download\n`);
>>>>>>> 05e5d649755b2958653be36c2993fc0efd8bed12
});