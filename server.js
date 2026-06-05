const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Supabase クライアント設定
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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

    // Supabase Storage にアップロード
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(`領収書/${filename}`, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.log('❌ Supabase エラー:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Supabase 保存成功:', filename);

    res.json({
      success: true,
      message: 'Supabase に保存されました',
      filename,
      size: buffer.length,
      path: data.path,
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
