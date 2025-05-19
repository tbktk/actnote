import { User } from '@/user-management/application/domain/model/User';

/**
 * ユーザー コマンドリポジトリインターフェース
 */
export interface UserCommandRepository {
  /**
   * ユーザーを作成します。
   * @param user Userオブジェクト
   * @returns Promise<void>
   */
  createUser(user: User): Promise<void>;

  /**
   * ユーザーを更新します。
   * @param user Userオブジェクト
   * @returns Promise<void>
   */
  updateUser(user: User): Promise<void>;

  /**
   * ユーザーを削除します。
   * @param userId ユーザーID
   * @returns Promise<void>
   */
  deleteUser(userId: string): Promise<void>;
}