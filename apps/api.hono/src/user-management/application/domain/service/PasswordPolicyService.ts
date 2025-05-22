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

export class PasswordPolicyService {
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