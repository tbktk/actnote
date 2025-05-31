import { injectable, inject } from 'inversify';
import type { IUserApplicationService } from '../port/in/IUserApplicationService';
import type { CreateUserCommand } from '../port/in/commands/CreateUserCommand';
import type { UpdateUserProfileCommand } from '../port/in/commands/UpdateUserProfileCommand';
import type { ChangePasswordCommand } from '../port/in/commands/ChangePasswordCommand';
import type { UserDTO } from '../port/in/dtos/UserDTO';
import type { IUserCommandRepository } from '../port/out/IUserCommandRepository';
import type { IUserQueryRepository } from '../port/out/IUserQueryRepository';
import type { IPasswordHashingService } from '../port/out/IPasswordHashingService';
import { User } from '../domain/model/User';
import { Email } from '../domain/model/Email';
import { Password } from '../domain/model/Password';
import { UserName } from '../domain/model/UserName';
import { UserId } from '../domain/model/UserId';

/**
 * ユーザー管理に関するアプリケーションサービス。
 * ユーザーの作成、取得、更新、パスワード変更などの操作を提供します。
 */
@injectable()
export class UserApplicationService implements IUserApplicationService {
  constructor(
    @inject('IUserCommandRepository')
    private readonly userCommandRepository: IUserCommandRepository,
    @inject('IUserQueryRepository')
    private readonly userQueryRepository: IUserQueryRepository,
    @inject('IPasswordHashingService')
    private readonly passwordHashingService: IPasswordHashingService
  ) {}

  /**
   * ユーザーを新規作成します。
   * @param command ユーザー作成に必要な情報を含むコマンドオブジェクト。
   * @returns 作成されたユーザーのDTO。
   */
  async createUser(command: CreateUserCommand): Promise<UserDTO> {
    // Emailの重複チェック
    const existingUser = await this.userQueryRepository.findUserByEmail(command.email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    // パスワードのハッシュ化
    const hashedPassword = await this.passwordHashingService.hashPassword(command.password);

    // ドメインオブジェクトの作成
    const email = new Email(command.email);
    const password = new Password(hashedPassword);
    const userName = new UserName(command.userName);

    const user = User.create(email, password, userName);

    // ユーザーの保存
    await this.userCommandRepository.createUser(user);

    // DTOとして返却
    return this.toUserDTO(user);
  }

  /**
   * ユーザーのプロフィールを取得します。
   * @param userId ユーザーの一意な識別子。
   * @returns ユーザーのDTO。ユーザーが存在しない場合はnullを返す。
   */
  async getUserById(userId: string): Promise<UserDTO | null> {
    const user = await this.userQueryRepository.findUserById(userId);
    if (!user) {
      return null;
    }
    return this.toUserDTO(user);
  }

  /**
   * ユーザーのプロフィールを更新します。
   * @param command 更新に必要な情報を含むコマンドオブジェクト。
   * @returns 更新されたユーザーのDTO。ユーザーが存在しない場合はnullを返す。
   */
  async updateUserProfile(command: UpdateUserProfileCommand): Promise<UserDTO | null> {
    const user = await this.userQueryRepository.findUserById(command.userId);
    if (!user) {
      return null;
    }

    // プロフィールの更新
    if (command.userName) {
      const newUserName = new UserName(command.userName);
      user.changeUserName(newUserName);
    }

    if (command.email) {
      const newEmail = new Email(command.email);
      user.changeEmail(newEmail);
    }

    // 更新を保存
    await this.userCommandRepository.updateUser(user);

    return this.toUserDTO(user);
  }

  /**
   * ユーザーのパスワードを変更します。
   * @param command パスワード変更に必要な情報を含むコマンドオブジェクト。
   * @returns void
   */
  async changePassword(command: ChangePasswordCommand): Promise<void> {
    const user = await this.userQueryRepository.findUserById(command.userId);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    // 現在のパスワードの確認（指定されている場合）
    if (command.currentPassword) {
      const isCurrentPasswordValid = await this.passwordHashingService.comparePasswords(
        command.currentPassword,
        user.password.getValue()
      );
      if (!isCurrentPasswordValid) {
        throw new Error('現在のパスワードが正しくありません');
      }
    }

    // 新しいパスワードのハッシュ化
    const hashedNewPassword = await this.passwordHashingService.hashPassword(command.newPassword);
    const newPassword = new Password(hashedNewPassword);

    // パスワードの変更
    user.changePassword(newPassword);

    // 更新を保存
    await this.userCommandRepository.updateUser(user);
  }

  /**
   * UserエンティティをUserDTOに変換します。
   * @param user Userエンティティ
   * @returns UserDTO
   */
  private toUserDTO(user: User): UserDTO {
    return {
      id: user.userId.getValue(),
      email: user.email.getValue(),
      name: user.userName.getValue()
    };
  }
}