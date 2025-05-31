import { Hono } from 'hono';
import { Container } from 'inversify';
import { UserHandler } from './UserHandler';

/**
 * ユーザー管理のコントローラークラス。
 * Honoルーターとハンドラーを組み合わせてエンドポイントを定義します。
 */
export class UserController {
  private readonly app: Hono;
  private readonly userHandler: UserHandler;

  constructor(container: Container) {
    this.app = new Hono();
    this.userHandler = container.get<UserHandler>(UserHandler);
    this.setupRoutes();
  }

  /**
   * ルートの設定。
   */
  private setupRoutes(): void {
    // ユーザー作成
    this.app.post('/users', (c) => this.userHandler.createUser(c));

    // ユーザー取得
    this.app.get('/users/:id', (c) => this.userHandler.getUserById(c));

    // ユーザープロフィール更新
    this.app.put('/users/:id/profile', (c) => this.userHandler.updateUserProfile(c));

    // パスワード変更
    this.app.put('/users/:id/password', (c) => this.userHandler.changePassword(c));

    // ヘルスチェック
    this.app.get('/users/health', (c) => {
      return c.json({
        status: 'ok',
        service: 'user-management',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Honoアプリケーションインスタンスを取得します。
   * @returns Honoアプリケーション
   */
  public getApp(): Hono {
    return this.app;
  }

  /**
   * ルート情報を取得します（デバッグ用）。
   * @returns ルート情報の配列
   */
  public getRoutes(): Array<{ method: string; path: string; description: string }> {
    return [
      { method: 'POST', path: '/users', description: 'ユーザー作成' },
      { method: 'GET', path: '/users/:id', description: 'ユーザー取得' },
      { method: 'PUT', path: '/users/:id/profile', description: 'ユーザープロフィール更新' },
      { method: 'PUT', path: '/users/:id/password', description: 'パスワード変更' },
      { method: 'GET', path: '/users/health', description: 'ヘルスチェック' }
    ];
  }
}