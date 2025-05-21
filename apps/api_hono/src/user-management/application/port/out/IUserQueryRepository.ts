import { User } from '@/user-management/application/domain/model/User';

export interface IUserQueryRepository {
  findUserById(userId: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByName(name: string): Promise<User | null>;
  findAllUsers(): Promise<User[]>;
  findUsersByCriteria(criteria: any): Promise<User[]>;
}