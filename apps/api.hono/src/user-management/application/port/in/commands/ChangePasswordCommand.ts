export interface ChangePasswordCommand {
  /**
   * パスワード変更対象のユーザーID。
   * ユーザーIDは文字列として扱われますが、必要に応じて UserId 型を使用することも可能です。
   */
  readonly userId: string;

  /**
   * 現在のパスワード（本人確認用）。
   * 省略可能な場合もありますが、セキュリティ上の理由から通常は必要です。
   */
  readonly currentPassword?: string;

  /**
   * 新しいパスワード。
   * PasswordPolicyService による検証は、Password 値オブジェクトの生成時またはアプリケーションサービス内で行われます。
   */
  readonly newPassword: string;
}