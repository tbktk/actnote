export interface UpdateUserProfileCommand {
  /**
   * 更新対象のユーザーID。
   */
  readonly userId: string;

  /**
   * 更新後のメールアドレス（オプション）。
   * 指定された場合のみ更新されます。
   */
  readonly email?: string;

  /**
   * 更新後のユーザー名（オプション）。
   * 指定された場合のみ更新されます。
   */
  readonly userName?: string;
}