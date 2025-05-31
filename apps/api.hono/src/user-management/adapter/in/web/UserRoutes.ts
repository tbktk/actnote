import { Hono } from 'hono';
import { Container } from 'inversify';
import { UserController } from './UserController';

/**
 * ユーザー管理のルート設定。
 * アプリケーションのルーティング設定を提供します。
 */
export class UserRoutes {
  /**
   * ユーザー管理のルートを設定したHonoアプリケーションを作成します。
   * @param container DIコンテナ
   * @returns 設定済みのHonoアプリケーション
   */
  public static create(container: Container): Hono {
    const userController = new UserController(container);
    const app = new Hono();

    // ユーザー管理ルートを /api/v1 プレフィックスで登録
    app.route('/api/v1', userController.getApp());

    // APIドキュメント用のエンドポイント
    app.get('/api/v1/users/routes', (c) => {
      const routes = userController.getRoutes();
      return c.json({
        service: 'user-management',
        version: '1.0.0',
        routes: routes.map(route => ({
          ...route,
          fullPath: `/api/v1${route.path}`
        }))
      });
    });

    return app;
  }

  /**
   * 開発環境用のテスト用ルートを追加します。
   * @param app Honoアプリケーション
   * @param container DIコンテナ
   */
  public static addDevRoutes(app: Hono, container: Container): void {
    // 開発環境でのみ有効なテスト用エンドポイント
    if (process.env.NODE_ENV === 'development') {
      app.get('/dev/users/test', (c) => {
        return c.json({
          message: 'User management service is running',
          environment: 'development',
          timestamp: new Date().toISOString()
        });
      });

      // DIコンテナの状態確認用エンドポイント
      app.get('/dev/users/container-info', (c) => {
        try {
          const hasUserHandler = container.isBound('UserHandler');
          const hasUserService = container.isBound('IUserApplicationService');
          
          return c.json({
            container: {
              userHandler: hasUserHandler,
              userApplicationService: hasUserService
            }
          });
        } catch (error) {
          return c.json({
            error: 'Failed to check container',
            message: error instanceof Error ? error.message : 'Unknown error'
          }, 500);
        }
      });
    }
  }
}