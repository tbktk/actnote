/**
 * ユーザー情報を外部に公開するためのデータ転送オブジェクト (DTO)。
 * APIレスポンスなどで使用されることを想定しています。
 */
export interface UserDTO {
  /**
   * ユーザーの一意な識別子。
   */
  readonly id: string;

  /**
   * ユーザーのメールアドレス。
   */
  readonly email: string;

  /**
   * ユーザーの名前（または表示名）。
   * Userエンティティの userName プロパティからマッピングされることを想定。
   */
  readonly name: string;

  // 必要に応じて、他の公開可能なユーザー情報を追加できます。
  // 例:
  // readonly createdAt?: Date;
  // readonly updatedAt?: Date;
}