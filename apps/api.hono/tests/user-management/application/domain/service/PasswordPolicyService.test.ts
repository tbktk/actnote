import { PasswordPolicyService } from '@/user-management/application/domain/service/PasswordPolicyService';
import {
  PasswordEmptyError,
  PasswordTooShortError,
  PasswordMissingUppercaseError,
  PasswordMissingLowercaseError,
  PasswordMissingNumberError,
  PasswordMissingSpecialCharacterError,
  // PasswordPolicyError, // 必要であれば基底クラスもインポート
} from '@/user-management/application/domain/error/PasswordPolicyErrors';

// PasswordPolicyService 内の定数に合わせてテスト値を設定
const MIN_LENGTH = 8;
// REQUIRE_SPECIAL_CHARACTER は false なので、特殊文字なしで通るパスワードを用意

describe('PasswordPolicyService', () => {
  let passwordPolicyService: PasswordPolicyService;

  beforeEach(() => {
    passwordPolicyService = new PasswordPolicyService();
  });

  // --- エラーがスローされるべきケース ---

  it('パスワードが空文字列の場合、PasswordEmptyError をスローするべき', () => {
    expect(() => {
      passwordPolicyService.validate('');
    }).toThrow(PasswordEmptyError);
  });

  it('パスワードがnullの場合、PasswordEmptyError をスローするべき', () => {
    // TypeScriptでは string 型に null を直接渡せないため、型アサーションでテスト
    expect(() => {
      passwordPolicyService.validate(null as any);
    }).toThrow(PasswordEmptyError);
  });

  it(`パスワードが${MIN_LENGTH}文字未満の場合、PasswordTooShortError をスローするべき`, () => {
    const shortPassword = 'a'.repeat(MIN_LENGTH - 1); // 例: "aaaaaaa"
    expect(() => {
      passwordPolicyService.validate(shortPassword);
    }).toThrow(PasswordTooShortError);
    // エラーインスタンスのプロパティも検証可能
    try {
      passwordPolicyService.validate(shortPassword);
    } catch (error) {
      expect(error).toBeInstanceOf(PasswordTooShortError);
      if (error instanceof PasswordTooShortError) { // 型ガード
        expect(error.minLength).toBe(MIN_LENGTH);
      }
    }
  });

  it('パスワードに大文字が含まれていない場合、PasswordMissingUppercaseError をスローするべき', () => {
    const noUppercasePassword = 'password1'; // 大文字なし、他はOK
    expect(() => {
      passwordPolicyService.validate(noUppercasePassword);
    }).toThrow(PasswordMissingUppercaseError);
  });

  it('パスワードに小文字が含まれていない場合、PasswordMissingLowercaseError をスローするべき', () => {
    const noLowercasePassword = 'PASSWORD1'; // 小文字なし、他はOK
    expect(() => {
      passwordPolicyService.validate(noLowercasePassword);
    }).toThrow(PasswordMissingLowercaseError);
  });

  it('パスワードに数字が含まれていない場合、PasswordMissingNumberError をスローするべき', () => {
    const noNumberPassword = 'PasswordWord'; // 数字なし、他はOK
    expect(() => {
      passwordPolicyService.validate(noNumberPassword);
    }).toThrow(PasswordMissingNumberError);
  });

  // REQUIRE_SPECIAL_CHARACTER が true の場合のテスト (現在は false なのでスキップまたは条件分岐)
  // it('パスワードに特殊文字が含まれていない場合 (REQUIRE_SPECIAL_CHARACTER=true の時)、PasswordMissingSpecialCharacterError をスローするべき', () => {
  //   // このテストを実行するには、PasswordPolicyService内の REQUIRE_SPECIAL_CHARACTER を true にするか、
  //   // この定数を外部から注入できるようにサービスを変更する必要があります。
  //   // 現在は false なので、このテストは失敗します。
  //   const REQUIRE_SPECIAL_CHARACTER_FOR_TEST = true; // 仮に true とした場合
  //   if (REQUIRE_SPECIAL_CHARACTER_FOR_TEST) { // 実際の定数値に応じて条件分岐
  //     const noSpecialCharPassword = 'Password123'; // 特殊文字なし
  //     // PasswordPolicyService の REQUIRE_SPECIAL_CHARACTER を true に書き換えるか、
  //     // テスト用にサービスをモック/スタブ化する必要あり。
  //     // ここでは、もし REQUIRE_SPECIAL_CHARACTER が true だったら、という仮定で記述します。
  //     // 実際のテストでは、この定数をテスト可能な形で扱う工夫が必要です。
  //     // (例: コンストラクタで設定値を渡す、など)
  //     // 現状のコードでは、このテストは PasswordPolicyService.ts の REQUIRE_SPECIAL_CHARACTER が false のため、
  //     // パスしてしまいます（エラーがスローされないため）。
  //     // 正しくテストするには、サービスの REQUIRE_SPECIAL_CHARACTER をテスト中に変更できる仕組みが必要です。
  //     // 今回は、現在のコードのままなので、エラーがスローされないことを確認するテストの方が適切かもしれません。
  //     expect(() => {
  //       // PasswordPolicyService の REQUIRE_SPECIAL_CHARACTER が true の場合のみこのテストが意味を持つ
  //       // passwordPolicyService.validate(noSpecialCharPassword);
  //     }).toThrow(PasswordMissingSpecialCharacterError);
  //   }
  // });

  // --- エラーがスローされないべきケース ---

  it('すべてのポリシーを満たすパスワードの場合、エラーをスローしないべき', () => {
    const validPassword = 'Password123'; // 大文字、小文字、数字を含み、8文字以上
    expect(() => {
      passwordPolicyService.validate(validPassword);
    }).not.toThrow();
  });

  it('特殊文字を含まないが、REQUIRE_SPECIAL_CHARACTERがfalseなのでエラーをスローしないべき', () => {
    const validPasswordWithoutSpecial = 'Password123';
    expect(() => {
      passwordPolicyService.validate(validPasswordWithoutSpecial);
    }).not.toThrow();
  });

  it('最小文字数ちょうどのポリシーを満たすパスワードの場合、エラーをスローしないべき', () => {
    const validPasswordMinLength = 'Pass1234'; // 8文字
    expect(() => {
      passwordPolicyService.validate(validPasswordMinLength);
    }).not.toThrow();
  });

  // 複雑な組み合わせのテストケースも追加可能
  it('様々な文字種を含む長いパスワードの場合、エラーをスローしないべき', () => {
    const complexValidPassword = 'AVeryL0ngAndSecureP@sswOrd!';
    // 現在の PasswordPolicyService では REQUIRE_SPECIAL_CHARACTER = false なので、
    // 特殊文字を含まないパスワードでも通ります。
    // もし特殊文字が必須なら、このテストパスワードは適宜変更が必要です。
    // このテストは、現在のポリシー設定（特殊文字不要）ではパスします。
    // もしPasswordPolicyServiceのREQUIRE_SPECIAL_CHARACTERがtrueなら、このテストは失敗します。
    // その場合は、'AVeryL0ngAndSecurePassword123' のようなパスワードでテストします。
    const validPasswordForCurrentPolicy = 'AVeryL0ngAndSecurePassword123';
    expect(() => {
      passwordPolicyService.validate(validPasswordForCurrentPolicy);
    }).not.toThrow();
  });
});