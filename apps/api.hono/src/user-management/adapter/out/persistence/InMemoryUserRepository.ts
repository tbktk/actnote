import { injectable } from 'inversify';
import type { IUserCommandRepository } from '../../../application/port/out/IUserCommandRepository';
import type { IUserQueryRepository } from '../../../application/port/out/IUserQueryRepository';
import { User } from '../../../application/domain/model/User';

/**
 * インメモリユーザーリポジトリの実装。
 * テスト環境や開発環境で使用する簡易的なリポジトリです。
 */
@injectable()
export class InMemoryUserRepository implements IUserCommandRepository, IUserQueryRepository {
  private users: Map<string, User> = new Map();

  // === Command Repository Implementation ===

  /**
   * ユーザーを作成します。
   * @param user Userオブジェクト
   * @returns Promise<void>
   */
  async createUser(user: User): Promise<void> {
    const userId = user.userId.getValue();
    
    // メールアドレスの重複チェック
    const existingUserByEmail = Array.from(this.users.values())
      .find(u => u.email.getValue() === user.email.getValue());
    
    if (existingUserByEmail) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    this.users.set(userId, user);
  }

  /**
   * ユーザーを更新します。
   * @param user Userオブジェクト
   * @returns Promise<void>
   */
  async updateUser(user: User): Promise<void> {
    const userId = user.userId.getValue();
    
    if (!this.users.has(userId)) {
      throw new Error('ユーザーが見つかりません');
    }

    // メールアドレスの重複チェック（自分以外）
    const existingUserByEmail = Array.from(this.users.values())
      .find(u => u.email.getValue() === user.email.getValue() && u.userId.getValue() !== userId);
    
    if (existingUserByEmail) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    this.users.set(userId, user);
  }

  /**
   * ユーザーを削除します。
   * @param userId ユーザーID
   * @returns Promise<void>
   */
  async deleteUser(userId: string): Promise<void> {
    if (!this.users.has(userId)) {
      throw new Error('ユーザーが見つかりません');
    }

    this.users.delete(userId);
  }

  // === Query Repository Implementation ===

  /**
   * ユーザーIDでユーザーを取得します。
   * @param userId ユーザーID
   * @returns Promise<User | null>
   */
  async findUserById(userId: string): Promise<User | null> {
    const user = this.users.get(userId);
    return user || null;
  }

  /**
   * メールアドレスでユーザーを取得します。
   * @param email メールアドレス
   * @returns Promise<User | null>
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.users.values())
      .find(u => u.email.getValue() === email);
    return user || null;
  }

  /**
   * ユーザー名でユーザーを取得します。
   * @param name ユーザー名
   * @returns Promise<User | null>
   */
  async findUserByName(name: string): Promise<User | null> {
    const user = Array.from(this.users.values())
      .find(u => u.userName.getValue() === name);
    return user || null;
  }

  /**
   * すべてのユーザーを取得します。
   * @returns Promise<User[]>
   */
  async findAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * 検索条件に基づいてユーザーを取得します。
   * @param criteria 検索条件
   * @returns Promise<User[]>
   */
  async findUsersByCriteria(criteria: any): Promise<User[]> {
    let users = Array.from(this.users.values());

    // メールアドレスでフィルタリング
    if (criteria.email) {
      users = users.filter(user => 
        user.email.getValue().toLowerCase().includes(criteria.email.toLowerCase())
      );
    }

    // ユーザー名でフィルタリング
    if (criteria.name) {
      users = users.filter(user => 
        user.userName.getValue().toLowerCase().includes(criteria.name.toLowerCase())
      );
    }

    // 結果の制限
    if (criteria.limit) {
      const offset = criteria.offset || 0;
      users = users.slice(offset, offset + criteria.limit);
    }

    return users;
  }

  // === Utility Methods ===

  /**
   * リポジトリをクリアします（テスト用）。
   */
  clear(): void {
    this.users.clear();
  }

  /**
   * 現在保存されているユーザー数を取得します。
   * @returns ユーザー数
   */
  getUserCount(): number {
    return this.users.size;
  }

  /**
   * 指定されたユーザーIDが存在するかチェックします。
   * @param userId ユーザーID
   * @returns 存在する場合はtrue
   */
  hasUser(userId: string): boolean {
    return this.users.has(userId);
  }

  /**
   * すべてのユーザーIDを取得します。
   * @returns ユーザーIDの配列
   */
  getAllUserIds(): string[] {
    return Array.from(this.users.keys());
  }
}