import { getErrorMessage } from '@/shared/utils/HttpErrorHandler'; // ★テスト対象の実際のパスに合わせる
import {
  PasswordPolicyError,
  PasswordEmptyError,
  PasswordTooShortError,
  PasswordMissingUppercaseError,
  PasswordMissingLowercaseError,
  PasswordMissingNumberError,
  PasswordMissingSpecialCharacterError,
} from '@/user-management/application/domain/error/PasswordPolicyErrors'; // ★エラークラスの実際のパスに合わせる

// messages.json のモック
// HttpErrorHandler.ts が参照する messages.json の構造に合わせる
jest.mock('@locales/ja/messages.json', () => ({
  Error: {
    Common: {
      InternalServerError: "テスト: サーバー内部でエラーが発生しました。",
      NotFoundError: "テスト: リソースが見つかりませんでした。",
      BadRequestError: "テスト: リクエストが不正です。"
    },
    PasswordPolicy: {
      PasswordEmptyError: "テスト: パスワードを入力してください。",
      PasswordTooShortError: "テスト: パスワードは最低 {minLength} 文字で入力してください。",
      PasswordMissingUppercaseError: "テスト: 大文字がありません。",
      PasswordMissingLowercaseError: "テスト: 小文字がありません。",
      PasswordMissingNumberError: "テスト: 数字がありません。",
      PasswordMissingSpecialCharacterError: "テスト: 特殊文字がありません。",
    }
  },
  Info: { // Info部分もモックに含めておくと、messages.json全体のモックとして整合性が取れます
    Common: {
      Saved: "テスト: 保存しました。",
    },
  },
}), { virtual: true });


describe('getErrorMessage', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // 各テストの前に console.warn と console.error をスパイし、出力を抑制
    // mockImplementation(() => {}) は、関数が呼び出されても何もしないようにします。
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 各テストの後にスパイを元に戻し、他のテストやJest自体のログに影響しないようにします。
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const testCasesForPasswordPolicyErrors = [
    {
      description: 'PasswordEmptyError',
      error: new PasswordEmptyError(),
      expectedMessage: "テスト: パスワードを入力してください。",
      expectedStatusCode: 400,
    },
    {
      description: 'PasswordTooShortError with minLength 8',
      error: new PasswordTooShortError(8),
      expectedMessage: "テスト: パスワードは最低 8 文字で入力してください。",
      expectedStatusCode: 400,
    },
    {
      description: 'PasswordTooShortError with minLength 10',
      error: new PasswordTooShortError(10),
      expectedMessage: "テスト: パスワードは最低 10 文字で入力してください。",
      expectedStatusCode: 400,
    },
    {
      description: 'PasswordMissingUppercaseError',
      error: new PasswordMissingUppercaseError(),
      expectedMessage: "テスト: 大文字がありません。",
      expectedStatusCode: 400,
    },
    {
      description: 'PasswordMissingLowercaseError',
      error: new PasswordMissingLowercaseError(),
      expectedMessage: "テスト: 小文字がありません。",
      expectedStatusCode: 400,
    },
    {
      description: 'PasswordMissingNumberError',
      error: new PasswordMissingNumberError(),
      expectedMessage: "テスト: 数字がありません。",
      expectedStatusCode: 400,
    },
    {
      description: 'PasswordMissingSpecialCharacterError',
      error: new PasswordMissingSpecialCharacterError(),
      expectedMessage: "テスト: 特殊文字がありません。",
      expectedStatusCode: 400,
    },
  ];

  testCasesForPasswordPolicyErrors.forEach(({ description, error, expectedMessage, expectedStatusCode }) => {
    it(`${description} に対して正しいメッセージとステータスコードを返す`, () => {
      const result = getErrorMessage(error);
      expect(result.message).toBe(expectedMessage);
      expect(result.statusCode).toBe(expectedStatusCode);
    });
  });

  it('PasswordPolicyError の基底クラスインスタンスの場合、フォールバックメッセージとステータスコード400を返す (モックに専用キーがない場合)', () => {
    const error = new PasswordPolicyError("Generic policy violation");
    const result = getErrorMessage(error);
    // HttpErrorHandler.ts が `Error.PasswordPolicy.PasswordPolicyError` というキーを生成し、
    // それがモックにない場合、フォールバックで Error.Common.InternalServerError のメッセージが使用される
    expect(result.message).toBe("テスト: サーバー内部でエラーが発生しました。");
    expect(result.statusCode).toBe(400); // PasswordPolicyError なので 400
  });

  it('PasswordPolicyError ではない一般的な Error に対してデフォルトのエラーメッセージと500を返す', () => {
    const error = new Error("Some generic error");
    // console.error をスパイして、テスト中の出力を確認/抑制することも可能
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = getErrorMessage(error);

    expect(result.message).toBe("テスト: サーバー内部でエラーが発生しました。");
    expect(result.statusCode).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Unhandled error type or generic error:", error);

    consoleErrorSpy.mockRestore(); // スパイを元に戻す
  });

  it('メッセージカタログに存在しない未知の PasswordPolicyError サブクラスの場合、フォールバックメッセージを返す', () => {
    class UnknownPasswordPolicyErrorSubclass extends PasswordPolicyError {
      constructor() { super("Unknown subclass policy error"); }
    }
    const error = new UnknownPasswordPolicyErrorSubclass();
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = getErrorMessage(error);

    // HttpErrorHandler.ts が `Error.PasswordPolicy.UnknownPasswordPolicyErrorSubclass` というキーを生成し、
    // それがモックにない場合、フォールバックで Error.Common.InternalServerError のメッセージが使用される
    expect(result.message).toBe("テスト: サーバー内部でエラーが発生しました。");
    expect(result.statusCode).toBe(400); // PasswordPolicyError なので 400
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Message template not found for key: Error.PasswordPolicy.UnknownPasswordPolicyErrorSubclass. Falling back to generic error."
    );

    consoleWarnSpy.mockRestore();
  });
});