import 'reflect-metadata';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { AppContainer } from './shared/container/Container';
import { UserRoutes } from './user-management/adapter/in/web/UserRoutes';
import { getErrorMessage } from './shared/utils/HttpErrorHandler';
import { getInformationMessage } from './shared/utils/HttpInformationHandler';

// DIコンテナの初期化
const container = AppContainer.getInstance();

// Honoアプリケーションの作成
const app = new Hono();

// ミドルウェアの設定
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use('*', logger());
app.use('*', prettyJSON());

// カスタムミドルウェア
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  
  console.log(`📢 ${c.req.method} ${c.req.url} - ${c.res.status} (${ms}ms)`);
});

// ルートエンドポイント
app.get('/', (c) => {
  return c.json({
    message: 'ActNote API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    services: [
      'user-management',
      // 将来的に他のサービスも追加予定
      // 'project-management',
      // 'task-worklog'
    ]
  });
});

// ヘルスチェックエンドポイント
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// APIドキュメントエンドポイント
app.get('/api-docs', (c) => {
  return c.json({
    title: 'ActNote API Documentation',
    version: '1.0.0',
    description: 'RESTful API for ActNote application',
    baseUrl: `${c.req.url.split('/api-docs')[0]}`,
    endpoints: {
      userManagement: '/api/v1/users',
      health: '/health',
      apiInfo: '/api-docs'
    }
  });
});

// ユーザー管理ルートの追加
const userApp = UserRoutes.create(container);
app.route('/', userApp);

// 開発環境用のルート追加
if (process.env.NODE_ENV === 'development') {
  UserRoutes.addDevRoutes(app, container);
  
  // 開発環境用の追加エンドポイント
  app.get('/dev/container-status', (c) => {
    try {
      return c.json({
        containerServices: {
          userApplicationService: container.isBound('IUserApplicationService'),
          userCommandRepository: container.isBound('IUserCommandRepository'),
          userQueryRepository: container.isBound('IUserQueryRepository'),
          passwordHashingService: container.isBound('IPasswordHashingService'),
          userHandler: container.isBound(Symbol.for('UserHandler'))
        },
        environment: process.env.NODE_ENV,
        databaseMode: process.env.USE_IN_MEMORY_DB === 'true' ? 'in-memory' : 'prisma'
      });
    } catch (error) {
      return c.json({
        error: 'Failed to check container status',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  });
}

// 404ハンドラー
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: c.req.url,
    method: c.req.method
  }, 404);
});

// エラーハンドラー
app.onError((err, c) => {
  console.error('Global error handler:', err);
  
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

// サーバー起動
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || 'localhost';

serve({
  fetch: app.fetch,
  port,
  hostname: host,
}, () => {
  console.log(`🚀 ActNote API Server が起動しました!`);
  console.log(`🌐 URL: http://${host}:${port}`);
  console.log(`📚 API Docs: http://${host}:${port}/api-docs`);
  console.log(`💊 Health Check: http://${host}:${port}/health`);
  console.log(`👤 User API: http://${host}:${port}/api/v1/users`);
  console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.USE_IN_MEMORY_DB === 'true' ? 'In-Memory' : 'Prisma/PostgreSQL'}`);
});
