export class UserName {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid user name');
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    const minLength = 2;
    const maxLength = 50;
    return typeof value === 'string' && value.length >= minLength && value.length <= maxLength;
  }

  public getValue(): string {
    return this.value;
  }
}