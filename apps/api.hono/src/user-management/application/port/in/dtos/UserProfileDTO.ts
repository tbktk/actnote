/**
 * ユーザープロフィール情報を表すDTO。
 * 詳細なユーザー情報の表示や編集に使用されます。
 */
export interface UserProfileDTO {
  /**
   * ユーザーの一意な識別子。
   */
  readonly id: string;

  /**
   * ユーザーのメールアドレス。
   */
  readonly email: string;

  /**
   * ユーザー名。
   */
  readonly name: string;

  /**
   * ユーザーの作成日時（ISO 8601形式）。
   */
  readonly createdAt: string;

  /**
   * ユーザーの最終更新日時（ISO 8601形式）。
   */
  readonly updatedAt: string;
}