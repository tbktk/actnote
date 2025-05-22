"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
const app = new hono_1.Hono();
// Honoのミドルウェアでリクエストのログ出力
app.use('*', async (c, next) => {
    console.log(`📢 ${c.req.method} ${c.req.url}`);
    await next();
});
// ルートパスにGETリクエストが来たときのバンドラー
app.get('/', (c) => {
    return c.text('Hello Hono!');
});
app.post('/token', async (c) => {
    return c.text('Token received!');
});
// サーバーをポート3000でリッスン
const port = 3000;
(0, node_server_1.serve)({
    fetch: app.fetch,
    port,
}, () => {
    console.log(`Honoサーバーが http://localhost:${port} で起動中です！`);
});
