export class PasswordPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PasswordTooShortError extends PasswordPolicyError {
  constructor(public readonly minLength: number) {
    super(`パスワードは最低 ${minLength} 文字以上である必要があります。`); 
  }
}

export class PasswordMissingUppercaseError extends PasswordPolicyError {
  constructor() {
    super('パスワードには少なくとも1つの大文字を含める必要があります。');
  }
}

export class PasswordMissingLowercaseError extends PasswordPolicyError {
  constructor() {
    super('パスワードには少なくとも1つの小文字を含める必要があります。');
  }
}

export class PasswordMissingNumberError extends PasswordPolicyError {
  constructor() {
    super('パスワードには少なくとも1つの数字を含める必要があります。');
  }
}

export class PasswordMissingSpecialCharacterError extends PasswordPolicyError {
  constructor() {
    super('パスワードには少なくとも1つの特殊文字を含める必要があります。');
  }
}

export class PasswordEmptyError extends PasswordPolicyError {
  constructor() {
    super('パスワードは空であってはなりません。');
  }
}