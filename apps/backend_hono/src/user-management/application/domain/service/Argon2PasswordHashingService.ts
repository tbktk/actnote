import * as argon from 'argon2';
import { PasswordHashingService } from './PasswordHashingService';

/**
 * Argon2のハッシュ化オプション
 *
 * これらの値は、セキュリティ要件、サーバーリソース、許容される応答時間に応じて調整してください。
 * 例えば、メモリコスト(memoryCost)は、サーバーのRAMに基づいて調整する必要があります。
 * 時間コスト(timeCost)は、ユーザーエクスペリエンスとセキュリティのバランスを考慮して調整してください。
 * 並列処理の度合い(parallelism)は、サーバーのCPUコア数に基づいて調整する必要があります。
 * ハッシュ長(hashLength)は、セキュリティ要件に基づいて調整する必要があります。
 * Salt長(saltLength)は、セキュリティ要件に基づいて調整する必要があります。
 */
const ARGON2_HASHING_OPTIONS = {
  type: argon.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
  saltLength: 16,
};

/**
 * Argon2を使用したパスワードハッシュ化サービスクラス
 *
 * Argon2は、パスワードハッシュ化のための最新のアルゴリズムであり、セキュリティとパフォーマンスのバランスが取れています。
 * このサービスは、パスワードを安全にハッシュ化し、ハッシュと平文パスワードを比較するためのメソッドを提供します。
 * Argon2は、特にGPUやASICによる攻撃に対して強力な防御を提供します。
 * このサービスは、ユーザーのパスワードを安全に保存するための重要なコンポーネントです。
 */
export class Argon2PasswordHashingService implements PasswordHashingService {
  /**
   * パスワードをハッシュ化します。
   * @param password ハッシュ化する平文パスワード
   * @returns ハッシュ化されたパスワード
   * @throws エラーが発生した場合は、エラーメッセージを含む例外をスローします。
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await argon.hash(password, ARGON2_HASHING_OPTIONS);
      return hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password due to an internal error.');
    }
  }

  /**
   * 平文パスワードとハッシュ化されたパスワードを比較します。
   * @param plainPassword 平文パスワード
   * @param hashedPassword ハッシュ化されたパスワード
   * @returns パスワードが一致する場合はtrue、一致しない場合はfalse
   */
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await argon.verify(plainPassword, hashedPassword);
    return isMatch;
  }
}
