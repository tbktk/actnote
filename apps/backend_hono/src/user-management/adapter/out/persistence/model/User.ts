export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    id: string,
    name: string,
    email: string,
    password: string
  ): User {
    const now = new Date();
    return new User(id, name, email, password, now, now);
  }
}