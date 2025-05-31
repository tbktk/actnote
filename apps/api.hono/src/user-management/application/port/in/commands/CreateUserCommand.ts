/**
 * 
 */
export interface CreateUserCommand {
  /**
   * 登録するユーザーのメールアドレス。
   * Email値オブジェクトによる検証はアプリケーションサービスまたは値オブジェクトのファクトリで行われます。
   */
  readonly email: string;

  /**
   * 登録するユーザーの平文パスワード。
   * PasswordPolicyServiceによる検証とIPasswordHashingServiceによるハッシュ化は、
   * Password値オブジェクトの生成時またはアプリケーションサービス内で行われます。
   */
  readonly password: string;

  /**
   * 登録するユーザーのユーザー名。
   * UserName値オブジェクトによる検証はアプリケーションサービスまたは値オブジェクトのファクトリで行われます。
   */
  readonly userName: string;
}