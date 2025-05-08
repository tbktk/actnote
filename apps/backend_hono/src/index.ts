import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

// Honoのミドルウェアでリクエストのログ出力
app.use('*', async (c, next) => {
  console.log(`📢 ${c.req.method} ${c.req.url}`);
  await next();
});

// ルートパスにGETリクエストが来たときのバンドラー
app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.post('/token', async (c) => {
  return c.text('Token received!');
});

// サーバーをポート3000でリッスン
const port = 3000;
serve({
  fetch: app.fetch,
  port,
}, () => {
  console.log(`Honoサーバーが http://localhost:${port} で起動中です！`);
});
