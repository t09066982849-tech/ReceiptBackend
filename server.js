const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Web アプリページ
app.get('/app', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ReceiptApp</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 30px 20px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .user-text { color: #666; margin-bottom: 24px; font-size: 14px; }
    .label { font-size: 16px; margin-bottom: 12px; color: #333; }
    input[type="text"] {
      width: 100%;
      padding: 12px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 16px;
      margin-bottom: 16px;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      color: white;
      cursor: pointer;
      margin-bottom: 10px;
    }
    .btn-green { background: #51cf66; }
    .btn-blue { background: #4C6EF5; }
    .btn-red { background: #ff6b6b; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .thumbnails {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .thumb-wrapper { position: relative; }
    .thumb-wrapper img {
      width: 90px;
      height: 90px;
      object-fit: cover;
      border-radius: 8px;
    }
    .remove-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff6b6b;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
    }
    .count-text { color: #666; font-size: 14px; margin-bottom: 12px; }
    .change-name {
      margin-top: 20px;
      background: none;
      border: none;
      color: #999;
      font-size: 13px;
      text-decoration: underline;
      cursor: pointer;
    }
    .result {
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
    }
    .result.success { background: #d3f9d8; color: #2f9e44; }
    .result.error { background: #ffe3e3; color: #c92a2a; }
  </style>
</head>
<body>
<div class="container" id="app">
  <h1>📸 ReceiptApp</h1>
  <p id="loading">読み込み中...</p>
</div>

<script>
const MAX_PHOTOS = 3;
let photos = [];
let userName = localStorage.getItem('userName');

function renderNameForm() {
  document.getElementById('app').innerHTML = \`
    <h1>📸 ReceiptApp</h1>
    <p class="label">名前をローマ字で入力してください</p>
    <input type="text" id="nameInput" placeholder="例：Shimaki" />
    <button class="btn btn-green" onclick="saveName()">登録する</button>
  \`;
}

function saveName() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) { alert('名前を入力してください'); return; }
  localStorage.setItem('userName', name);
  userName = name;
  renderMain();
}

function renderMain() {
  const thumbsHtml = photos.map((uri, i) => \`
    <div class="thumb-wrapper">
      <img src="\${uri}" />
      <button class="remove-btn" onclick="removePhoto(\${i})">✕</button>
    </div>
  \`).join('');

  document.getElementById('app').innerHTML = \`
    <h1>📸 ReceiptApp</h1>
    <p class="user-text">担当者：\${userName}</p>
    \${photos.length > 0 ? \`
      <div class="thumbnails">\${thumbsHtml}</div>
      <p class="count-text">\${photos.length}/\${MAX_PHOTOS}枚</p>
    \` : ''}
    \${photos.length < MAX_PHOTOS ? \`
      <button class="btn btn-green" onclick="takePicture()">
        \${photos.length === 0 ? '写真撮影' : '写真を追加'}
      </button>
    \` : ''}
    \${photos.length > 0 ? \`
      <button class="btn btn-blue" onclick="uploadPhotos()" id="uploadBtn">
        \${photos.length}枚をアップロード
      </button>
      <button class="btn btn-red" onclick="resetPhotos()">やり直し</button>
    \` : ''}
    <div id="result"></div>
    <button class="change-name" onclick="changeName()">名前を変更する</button>
    <input type="file" id="fileInput" accept="image/*" capture="environment" style="display:none" onchange="handleFiles(event)" />
  \`;
}

function takePicture() {
  document.getElementById('fileInput').click();
}

function handleFiles(event) {
  const files = Array.from(event.target.files);
  const remaining = MAX_PHOTOS - photos.length;
  const toAdd = files.slice(0, remaining);

  toAdd.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Canvas で圧縮
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * MAX_SIZE / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * MAX_SIZE / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        photos.push(compressed);
        renderMain();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  event.target.value = '';
}

function removePhoto(index) {
  photos = photos.filter((_, i) => i !== index);
  renderMain();
}

function resetPhotos() {
  photos = [];
  renderMain();
}

function changeName() {
  localStorage.removeItem('userName');
  userName = null;
  photos = [];
  renderNameForm();
}

async function uploadPhotos() {
  if (photos.length === 0) { alert('写真を撮影してください'); return; }

  const btn = document.getElementById('uploadBtn');
  btn.disabled = true;
  btn.textContent = 'アップロード中...';

  const safeName = userName.replace(/[^a-zA-Z0-9]/g, '');
  let successCount = 0;

  for (let i = 0; i < photos.length; i++) {
    try {
      const base64 = photos[i].split(',')[1];
      const filename = 'receipt_' + safeName + '_' + Date.now() + '_' + (i + 1) + '.jpg';

      const res = await fetch('/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: base64, filename, userId: userName })
      });

      if (res.ok) successCount++;
    } catch (e) {
      console.error(e);
    }
  }

  const result = document.getElementById('result');
  if (successCount === photos.length) {
    result.className = 'result success';
    result.textContent = successCount + '枚アップロード成功！';
    photos = [];
    setTimeout(renderMain, 2000);
  } else {
    result.className = 'result error';
    result.textContent = successCount + '/' + photos.length + '枚成功（一部失敗）';
    btn.disabled = false;
    btn.textContent = photos.length + '枚をアップロード';
  }
}

// 初期表示
if (userName) {
  renderMain();
} else {
  renderNameForm();
}
</script>
</body>
</html>`);
});

// アップロードエンドポイント
app.post('/upload', async (req, res) => {
  console.log('リクエスト受信');
  try {
    const { photo, filename, userId } = req.body;

    if (!filename || !photo) {
      return res.status(400).json({ error: 'ファイル名または写真がありません' });
    }

    const buffer = Buffer.from(photo, 'base64');

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(`receipts/${filename}`, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.log('Supabase エラー:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log('保存成功:', filename);

    res.json({
      success: true,
      message: 'Supabase に保存されました',
      filename,
      size: buffer.length,
    });
  } catch (error) {
    console.log('エラー:', error.message);
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
