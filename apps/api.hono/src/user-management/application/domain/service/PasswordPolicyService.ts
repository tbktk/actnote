import {
  PasswordTooShortError,
  PasswordMissingUppercaseError,
  PasswordMissingLowercaseError,
  PasswordMissingNumberError,
  PasswordMissingSpecialCharacterError,
  PasswordEmptyError,
} from '../error/PasswordPolicyErrors';

const MIN_LENGTH = 8;
const REQUIRE_UPPERCASE = true;
const REQUIRE_LOWERCASE = true;
const REQUIRE_NUMBER = true;
const REQUIRE_SPECIAL_CHARACTER = false;

/**
 * パスワードポリシーを検証するサービスクラス
 */
export class PasswordPolicyService {
  /**
   * パスワードポリシーを検証します。
   * @param password 検証するパスワード
   * @throws PasswordEmptyError パスワードが空の場合
   * @throws PasswordTooShortError パスワードが短すぎる場合
   * @throws PasswordMissingUppercaseError 大文字が含まれていない場合
   * @throws PasswordMissingLowercaseError 小文字が含まれていない場合
   * @throws PasswordMissingNumberError 数字が含まれていない場合
   * @throws PasswordMissingSpecialCharacterError 特殊文字が含まれていない場合
   */
  public validate(password: string): void {
    if (!password) {
      throw new PasswordEmptyError();
    }

    if (password.length < MIN_LENGTH) {
      throw new PasswordTooShortError(MIN_LENGTH);
    }

    if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      throw new PasswordMissingUppercaseError();
    }

    if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      throw new PasswordMissingLowercaseError();
    }

    if (REQUIRE_NUMBER && !/[0-9]/.test(password)) {
      throw new PasswordMissingNumberError();
    }

    if (REQUIRE_SPECIAL_CHARACTER && !/[^A-Za-z0-9]/.test(password)) {
      throw new PasswordMissingSpecialCharacterError();
    }
  }
}