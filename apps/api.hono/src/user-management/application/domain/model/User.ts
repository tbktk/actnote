import { v4 as uuidv4 } from 'uuid';
import { UserId } from './UserId';
import { Email } from './Email';
import { Password } from './Password';
import { UserName } from './UserName';

/**
 * Userエンティティ。
 */
export class User {
  private readonly _userId: UserId;
  private _email: Email;
  private _password: Password;
  private _userName: UserName;

  private constructor(
    userId: UserId,
    email: Email,
    password: Password,
    userName: UserName,
  ) {
    this._userId = userId;
    this._email = email;
    this._password = password;
    this._userName = userName;
  }

  /**
   * 新規ユーザー作成用のファクトリメソッドです。
   *
   * @param email Email
   * @param password Password
   * @param userName UserName
   * @returns User
   * @throws Error ユーザーの作成に失敗した場合
   */
  public static create(
    email: Email,
    password: Password,
    userName: UserName,
  ): User {
    const userId = new UserId(uuidv4());
    return new User(userId, email, password, userName);
  }

  /**
   * 永続化されたデータよりエンティティを再構築するためのファクトリメソッドです。
   *
   * @param userId UserId
   * @param email Email
   * @param password Password
   * @param userName UserName
   * @returns User
   * @throws Error ユーザーの再構築に失敗した場合
   */
  public static reconstitute(
    userId: UserId,
    email: Email,
    password: Password,
    userName: UserName,
  ): User {
    return new User(userId, email, password, userName);
  }

  /**
   * メールアドレスを変更します。
   *
   * @param newEmail Email
   */
  public changeEmail(newEmail: Email): void {
    this._email = newEmail;
  }

  /**
   * パスワードを変更します。
   *
   * @param newPassword Password
   */
  public changePassword(newPassword: Password): void {
    this._password = newPassword;
  }

  /**
   * ユーザー名を変更します。
   *
   * @param newUserName UserName
   */
  public changeUserName(newUserName: UserName): void {
    this._userName = newUserName;
  }

  // --- ゲッター ---
  get userId(): UserId { return this._userId; }
  get email(): Email { return this._email; }
  get password(): Password { return this._password; }
  get userName(): UserName { return this._userName; }
}