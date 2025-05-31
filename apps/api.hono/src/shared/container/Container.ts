import { Container } from 'inversify';
import 'reflect-metadata';

// Application Services
import { UserApplicationService } from '../../user-management/application/usecase/UserApplicationService';
import type { IUserApplicationService } from '../../user-management/application/port/in/IUserApplicationService';

// Repositories
import { PrismaUserRepository } from '../../user-management/adapter/out/persistence/PrismaUserRepository';
import { InMemoryUserRepository } from '../../user-management/adapter/out/persistence/InMemoryUserRepository';
import type { IUserCommandRepository } from '../../user-management/application/port/out/IUserCommandRepository';
import type { IUserQueryRepository } from '../../user-management/application/port/out/IUserQueryRepository';

// Services
import { Argon2PasswordHashingService } from '../../user-management/adapter/out/security/Argon2PasswordHashingService';
import type { IPasswordHashingService } from '../../user-management/application/port/out/IPasswordHashingService';

// Handlers
import { UserHandler } from '../../user-management/adapter/in/web/UserHandler';

/**
 * アプリケーション全体のDIコンテナ設定
 */
export class AppContainer {
  private static instance: Container;

  /**
   * DIコンテナのシングルトンインスタンスを取得します。
   * @returns Container
   */
  public static getInstance(): Container {
    if (!AppContainer.instance) {
      AppContainer.instance = AppContainer.createContainer();
    }
    return AppContainer.instance;
  }

  /**
   * DIコンテナを作成して設定します。
   * @returns Container
   */
  private static createContainer(): Container {
    const container = new Container();

    // 環境変数に基づいてリポジトリを選択
    const useInMemoryRepository = process.env.NODE_ENV === 'test' || process.env.USE_IN_MEMORY_DB === 'true';

    if (useInMemoryRepository) {
      // インメモリリポジトリを使用（テスト環境）
      const inMemoryRepo = new InMemoryUserRepository();
      container.bind<IUserCommandRepository>('IUserCommandRepository').toConstantValue(inMemoryRepo);
      container.bind<IUserQueryRepository>('IUserQueryRepository').toConstantValue(inMemoryRepo);
    } else {
      // Prismaリポジトリを使用（本番環境）
      const prismaRepo = new PrismaUserRepository();
      container.bind<IUserCommandRepository>('IUserCommandRepository').toConstantValue(prismaRepo);
      container.bind<IUserQueryRepository>('IUserQueryRepository').toConstantValue(prismaRepo);
    }

    // パスワードハッシュサービス
    container.bind<IPasswordHashingService>('IPasswordHashingService').to(Argon2PasswordHashingService);

    // アプリケーションサービス
    container.bind<IUserApplicationService>('IUserApplicationService').to(UserApplicationService);

    // ハンドラー
    container.bind<UserHandler>(UserHandler).toSelf();

    return container;
  }

  /**
   * テスト用にコンテナをリセットします。
   */
  public static reset(): void {
    AppContainer.instance = AppContainer.createContainer();
  }

  /**
   * 本番用の設定を行います。
   */
  public static configureForProduction(): Container {
    const container = new Container();

    // 本番環境では必ずPrismaリポジトリを使用
    const prismaRepo = new PrismaUserRepository();
    container.bind<IUserCommandRepository>('IUserCommandRepository').toConstantValue(prismaRepo);
    container.bind<IUserQueryRepository>('IUserQueryRepository').toConstantValue(prismaRepo);

    // パスワードハッシュサービス
    container.bind<IPasswordHashingService>('IPasswordHashingService').to(Argon2PasswordHashingService);

    // アプリケーションサービス
    container.bind<IUserApplicationService>('IUserApplicationService').to(UserApplicationService);

    // ハンドラー
    container.bind<UserHandler>(UserHandler).toSelf();

    AppContainer.instance = container;
    return container;
  }

  /**
   * テスト用の設定を行います。
   */
  public static configureForTesting(): Container {
    const container = new Container();

    // テスト環境では必ずインメモリリポジトリを使用
    const inMemoryRepo = new InMemoryUserRepository();
    container.bind<IUserCommandRepository>('IUserCommandRepository').toConstantValue(inMemoryRepo);
    container.bind<IUserQueryRepository>('IUserQueryRepository').toConstantValue(inMemoryRepo);

    // パスワードハッシュサービス
    container.bind<IPasswordHashingService>('IPasswordHashingService').to(Argon2PasswordHashingService);

    // アプリケーションサービス
    container.bind<IUserApplicationService>('IUserApplicationService').to(UserApplicationService);

    // ハンドラー
    container.bind<UserHandler>(UserHandler).toSelf();

    AppContainer.instance = container;
    return container;
  }
}
