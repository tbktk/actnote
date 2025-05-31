import { Context } from 'hono';
import { injectable, inject } from 'inversify';
import type { IUserApplicationService } from '../../../application/port/in/IUserApplicationService';
import type { CreateUserCommand } from '../../../application/port/in/commands/CreateUserCommand';
import type { UpdateUserProfileCommand } from '../../../application/port/in/commands/UpdateUserProfileCommand';
import type { ChangePasswordCommand } from '../../../application/port/in/commands/ChangePasswordCommand';
import { UserValidationService } from '../../../application/domain/service/UserValidationService';

/**
 * ユーザー関連のHTTPリクエストハンドラー。
 * Honoコンテキストを使用してHTTPリクエストとレスポンスを処理します。
 */
@injectable()
export class UserHandler {
  constructor(
    @inject('IUserApplicationService')
    private readonly userApplicationService: IUserApplicationService
  ) {}

  /**
   * ユーザー作成のハンドラー。
   * POST /users
   */
  async createUser(c: Context) {
    try {
      const body = await c.req.json();
      const { email, password, userName } = body;

      // バリデーション
      const validationErrors = UserValidationService.validateUserCreation(email, password, userName);
      if (validationErrors.length > 0) {
        return c.json(
          {
            error: 'Validation failed',
            details: validationErrors
          },
          400
        );
      }

      const command: CreateUserCommand = {
        email,
        password,
        userName
      };

      const user = await this.userApplicationService.createUser(command);

      return c.json(
        {
          message: 'User created successfully',
          data: user
        },
        201
      );
    } catch (error) {
      console.error('Error creating user:', error);
      return c.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  }

  /**
   * ユーザー取得のハンドラー。
   * GET /users/:id
   */
  async getUserById(c: Context) {
    try {
      const userId = c.req.param('id');

      if (!userId) {
        return c.json(
          {
            error: 'User ID is required'
          },
          400
        );
      }

      const user = await this.userApplicationService.getUserById(userId);

      if (!user) {
        return c.json(
          {
            error: 'User not found'
          },
          404
        );
      }

      return c.json({
        data: user
      });
    } catch (error) {
      console.error('Error getting user:', error);
      return c.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  }

  /**
   * ユーザープロフィール更新のハンドラー。
   * PUT /users/:id/profile
   */
  async updateUserProfile(c: Context) {
    try {
      const userId = c.req.param('id');
      const body = await c.req.json();
      const { email, userName } = body;

      if (!userId) {
        return c.json(
          {
            error: 'User ID is required'
          },
          400
        );
      }

      // バリデーション
      const validationErrors = UserValidationService.validateUserProfileUpdate(email, userName);
      if (validationErrors.length > 0) {
        return c.json(
          {
            error: 'Validation failed',
            details: validationErrors
          },
          400
        );
      }

      const command: UpdateUserProfileCommand = {
        userId,
        email,
        userName
      };

      const user = await this.userApplicationService.updateUserProfile(command);

      if (!user) {
        return c.json(
          {
            error: 'User not found'
          },
          404
        );
      }

      return c.json({
        message: 'User profile updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return c.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  }

  /**
   * パスワード変更のハンドラー。
   * PUT /users/:id/password
   */
  async changePassword(c: Context) {
    try {
      const userId = c.req.param('id');
      const body = await c.req.json();
      const { currentPassword, newPassword, confirmPassword } = body;

      if (!userId) {
        return c.json(
          {
            error: 'User ID is required'
          },
          400
        );
      }

      // バリデーション
      const validationErrors = UserValidationService.validatePasswordChange(newPassword, confirmPassword);
      if (validationErrors.length > 0) {
        return c.json(
          {
            error: 'Validation failed',
            details: validationErrors
          },
          400
        );
      }

      const command: ChangePasswordCommand = {
        userId,
        currentPassword,
        newPassword
      };

      await this.userApplicationService.changePassword(command);

      return c.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return c.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  }
}