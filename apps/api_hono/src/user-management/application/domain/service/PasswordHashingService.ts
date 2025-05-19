/**
 * パスワードハッシュ化サービスインターフェース
 */
export interface PasswordHashingService {
  /**
   * パスワードをハッシュ化します。
   * @param password ハッシュ化する平文パスワード
   * @returns ハッシュ化されたパスワード
   * @throws エラーが発生した場合は、エラーメッセージを含む例外をスローします。
   */
  hashPassword(password: string): Promise<string>;

  /**
   * 平文パスワードとハッシュ化されたパスワードを比較します。
   * @param plainPassword 平文パスワード
   * @param hashedPassword ハッシュ化されたパスワード
   * @returns パスワードが一致する場合はtrue、一致しない場合はfalse
   */
  comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean>;
}