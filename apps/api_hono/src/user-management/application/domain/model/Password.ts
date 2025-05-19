export class Password {
  private readonly value: string;

  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid password format.');
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    if (
      typeof value !== 'string' ||
      value.length < Password.MIN_LENGTH ||
      value.length > Password.MAX_LENGTH
    ) {
      return false;
    }
    // 英大文字・小文字・数字・記号を含むかの例
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);
    return hasUpper && hasLower && hasNumber && hasSymbol;
  }

  public getValue(): string {
    return this.value;
  }
}