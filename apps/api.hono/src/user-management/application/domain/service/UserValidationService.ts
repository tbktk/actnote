import { Email } from '../model/Email';
import { UserName } from '../model/UserName';
import { Password } from '../model/Password';

/**
 * ユーザー関連のバリデーションサービス。
 * 複数のドメインオブジェクトにまたがる検証ロジックを提供します。
 */
export class UserValidationService {
  /**
   * ユーザー作成時の包括的なバリデーションを実行します。
   * @param email メールアドレス
   * @param password パスワード
   * @param userName ユーザー名
   * @returns バリデーション結果のメッセージ配列（空配列の場合は有効）
   */
  public static validateUserCreation(
    email: string,
    password: string,
    userName: string
  ): string[] {
    const errors: string[] = [];

    try {
      new Email(email);
    } catch (error) {
      errors.push(`メールアドレス: ${error instanceof Error ? error.message : '無効な形式です'}`);
    }

    try {
      new Password(password);
    } catch (error) {
      errors.push(`パスワード: ${error instanceof Error ? error.message : '無効な形式です'}`);
    }

    try {
      new UserName(userName);
    } catch (error) {
      errors.push(`ユーザー名: ${error instanceof Error ? error.message : '無効な形式です'}`);
    }

    return errors;
  }

  /**
   * ユーザープロフィール更新時のバリデーションを実行します。
   * @param email メールアドレス（オプション）
   * @param userName ユーザー名（オプション）
   * @returns バリデーション結果のメッセージ配列（空配列の場合は有効）
   */
  public static validateUserProfileUpdate(
    email?: string,
    userName?: string
  ): string[] {
    const errors: string[] = [];

    if (email !== undefined) {
      try {
        new Email(email);
      } catch (error) {
        errors.push(`メールアドレス: ${error instanceof Error ? error.message : '無効な形式です'}`);
      }
    }

    if (userName !== undefined) {
      try {
        new UserName(userName);
      } catch (error) {
        errors.push(`ユーザー名: ${error instanceof Error ? error.message : '無効な形式です'}`);
      }
    }

    return errors;
  }

  /**
   * パスワード変更時のバリデーションを実行します。
   * @param newPassword 新しいパスワード
   * @param confirmPassword 確認用パスワード
   * @returns バリデーション結果のメッセージ配列（空配列の場合は有効）
   */
  public static validatePasswordChange(
    newPassword: string,
    confirmPassword?: string
  ): string[] {
    const errors: string[] = [];

    try {
      new Password(newPassword);
    } catch (error) {
      errors.push(`新しいパスワード: ${error instanceof Error ? error.message : '無効な形式です'}`);
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      errors.push('確認用パスワードが一致しません');
    }

    return errors;
  }
}