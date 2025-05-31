import { CreateUserCommand } from './commands/CreateUserCommand';
import { UpdateUserProfileCommand } from './commands/UpdateUserProfileCommand';
import { ChangePasswordCommand } from './commands/ChangePasswordCommand';
import { UserDTO } from './dtos/UserDTO';

/**
 * ユーザー管理に関するアプリケーションサービスのインターフェース。
 * ユーザーの作成、取得、更新、パスワード変更などの操作を提供します。
 */
export interface IUserApplicationService {
  /**
   * ユーザーを新規作成します。
   * @param command ユーザー作成に必要な情報を含むコマンドオブジェクト。
   * @returns 作成されたユーザーのDTO。
   */
  createUser(command: CreateUserCommand): Promise<UserDTO>;

  /**
   * ユーザーのプロフィールを取得します。
   * @param userId ユーザーの一意な識別子。
   * @returns ユーザーのDTO。ユーザーが存在しない場合はnullを返す。
   */
  getUserById(userId: string): Promise<UserDTO | null>;

  /**
   * ユーザーのプロフィールを更新します。
   * @param command 更新に必要な情報を含むコマンドオブジェクト。
   * @returns 更新されたユーザーのDTO。ユーザーが存在しない場合はnullを返す。
   */
  updateUserProfile(command: UpdateUserProfileCommand): Promise<UserDTO | null>;

  /**
   * ユーザーのパスワードを変更します。
   * @param command パスワード変更に必要な情報を含むコマンドオブジェクト。
   * @returns void
   */
  changePassword(command: ChangePasswordCommand): Promise<void>;
}