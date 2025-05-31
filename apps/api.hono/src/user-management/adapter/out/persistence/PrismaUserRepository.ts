import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import type { IUserCommandRepository } from '../../../application/port/out/IUserCommandRepository';
import type { IUserQueryRepository } from '../../../application/port/out/IUserQueryRepository';
import { User } from '../../../application/domain/model/User';
import { UserId } from '../../../application/domain/model/UserId';
import { Email } from '../../../application/domain/model/Email';
import { Password } from '../../../application/domain/model/Password';
import { UserName } from '../../../application/domain/model/UserName';

// Prismaの生成されたUser型
type PrismaUser = {
  id: string;
  email: string;
  password: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/**
 * Prismaを使用したユーザーリポジトリの実装。
 * IUserCommandRepositoryとIUserQueryRepositoryの両方を実装します。
 */
@injectable()
export class PrismaUserRepository implements IUserCommandRepository, IUserQueryRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // === Command Repository Implementation ===

  /**
   * ユーザーを作成します。
   * @param user Userオブジェクト
   * @returns Promise<void>
   */
  async createUser(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.userId.getValue(),
        email: user.email.getValue(),
        password: user.password.getValue(),
        name: user.userName.getValue()
      }
    });
  }

  /**
   * ユーザーを更新します。
   * @param user Userオブジェクト
   * @returns Promise<void>
   */
  async updateUser(user: User): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: user.userId.getValue()
      },
      data: {
        email: user.email.getValue(),
        password: user.password.getValue(),
        name: user.userName.getValue(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * ユーザーを削除します（論理削除）。
   * @param userId ユーザーID
   * @returns Promise<void>
   */
  async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        deletedAt: new Date()
      }
    });
  }

  // === Query Repository Implementation ===

  /**
   * ユーザーIDでユーザーを取得します。
   * @param userId ユーザーID
   * @returns Promise<User | null>
   */
  async findUserById(userId: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null
      }
    });

    return prismaUser ? this.toDomainUser(prismaUser) : null;
  }

  /**
   * メールアドレスでユーザーを取得します。
   * @param email メールアドレス
   * @returns Promise<User | null>
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: {
        email: email,
        deletedAt: null
      }
    });

    return prismaUser ? this.toDomainUser(prismaUser) : null;
  }

  /**
   * ユーザー名でユーザーを取得します。
   * @param name ユーザー名
   * @returns Promise<User | null>
   */
  async findUserByName(name: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findFirst({
      where: {
        name: name,
        deletedAt: null
      }
    });

    return prismaUser ? this.toDomainUser(prismaUser) : null;
  }

  /**
   * すべてのユーザーを取得します。
   * @returns Promise<User[]>
   */
  async findAllUsers(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return prismaUsers.map((prismaUser: PrismaUser) => this.toDomainUser(prismaUser));
  }

  /**
   * 検索条件に基づいてユーザーを取得します。
   * @param criteria 検索条件
   * @returns Promise<User[]>
   */
  async findUsersByCriteria(criteria: any): Promise<User[]> {
    const where: any = {
      deletedAt: null
    };

    // 検索条件の組み立て
    if (criteria.email) {
      where.email = {
        contains: criteria.email,
        mode: 'insensitive'
      };
    }

    if (criteria.name) {
      where.name = {
        contains: criteria.name,
        mode: 'insensitive'
      };
    }

    if (criteria.createdAfter) {
      where.createdAt = {
        gte: new Date(criteria.createdAfter)
      };
    }

    if (criteria.createdBefore) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(criteria.createdBefore)
      };
    }

    const prismaUsers = await this.prisma.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: criteria.limit || 100,
      skip: criteria.offset || 0
    });

    return prismaUsers.map((prismaUser: PrismaUser) => this.toDomainUser(prismaUser));
  }

  // === Private Helper Methods ===

  /**
   * PrismaのUserオブジェクトをドメインのUserオブジェクトに変換します。
   * @param prismaUser PrismaのUserオブジェクト
   * @returns ドメインのUserオブジェクト
   */
  private toDomainUser(prismaUser: PrismaUser): User {
    const userId = new UserId(prismaUser.id);
    const email = new Email(prismaUser.email);
    const password = new Password(prismaUser.password);
    const userName = new UserName(prismaUser.name || '');

    return User.reconstitute(userId, email, password, userName);
  }

  /**
   * リソースのクリーンアップを行います。
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}