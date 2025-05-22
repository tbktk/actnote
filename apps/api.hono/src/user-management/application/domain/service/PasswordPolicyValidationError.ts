export class PasswordPolicyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordPolicyValidationError';
  }
}