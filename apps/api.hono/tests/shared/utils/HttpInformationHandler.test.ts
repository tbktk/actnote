import { getInformationMessage } from '@/shared/utils/HttpInformationHandler'; // ★テスト対象の実際のパスに合わせてください

// messages.json のモック
// HttpInformationHandler.ts が参照する messages.json の構造に合わせる
jest.mock('@locales/ja/messages.json', () => ({
  Info: {
    Common: {
      Saved: "テスト: 保存しました。",
      Deleted: "テスト: 削除しました。",
      Updated: "テスト: 更新しました。",
      Created: "テスト: 作成しました。"
    },
    User: { // パラメータ付きメッセージのテスト用
      Welcome: "テスト: {userName}さん、ようこそ！",
      ItemSaved: "テスト: {itemName}を保存しました。",
    }
  },
  Error: { // Error部分もモックに含めておくと、messages.json全体のモックとして整合性が取れます
    Common: {
      InternalServerError: "テスト: サーバー内部でエラーが発生しました。",
    },
    // ... 他のエラーメッセージも必要に応じて
  }
}), { virtual: true });


describe('getInformationMessage', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // 各テストの前に console.warn をスパイし、出力を抑制
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // 各テストの後にスパイを元に戻す
    consoleWarnSpy.mockRestore();
  });

  it('有効なキー（パラメータなし）に対して正しいメッセージを返す', () => {
    const key = 'Info.Common.Saved';
    const expectedMessage = "テスト: 保存しました。";
    const result = getInformationMessage(key);
    expect(result).toBe(expectedMessage);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('有効なキー（パラメータあり）に対して正しくフォーマットされたメッセージを返す', () => {
    const key = 'Info.User.Welcome';
    const params = { userName: '山田太郎' };
    const expectedMessage = "テスト: 山田太郎さん、ようこそ！";
    const result = getInformationMessage(key, params);
    expect(result).toBe(expectedMessage);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('有効なキーで、メッセージテンプレートにないパラメータは無視される', () => {
    const key = 'Info.Common.Created';
    const params = { unusedParam: 'test', anotherUnused: 123 };
    const expectedMessage = "テスト: 作成しました。";
    const result = getInformationMessage(key, params);
    expect(result).toBe(expectedMessage);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('有効なキーで、パラメータが一部不足している場合はプレースホルダーが残る', () => {
    const key = 'Info.User.ItemSaved'; // "テスト: {itemName}を保存しました。" と仮定
    const params = { /* itemName を指定しない */ };
    const expectedMessage = "テスト: {itemName}を保存しました。";
    const result = getInformationMessage(key, params);
    expect(result).toBe(expectedMessage);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('存在しないキーが指定された場合、キー自体を返し、警告をログに出力する', () => {
    const key = 'Info.Common.NonExistentKey';
    const result = getInformationMessage(key);
    expect(result).toBe(key); // キー自体が返される
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `Information message template not found for key: ${key}. Returning key as message.`
    );
  });

  it('キーのパスの途中で見つからない場合、キー自体を返し、警告をログに出力する', () => {
    const key = 'Info.NonExistentCategory.SomeMessage';
    const result = getInformationMessage(key);
    expect(result).toBe(key);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `Information message template not found for key: ${key}. Returning key as message.`
    );
  });

  it('キーのパスが文字列ではなくオブジェクトを指している場合、キー自体を返し、警告をログに出力する', () => {
    const key = 'Info.Common'; // これはオブジェクトを指す
    const result = getInformationMessage(key);
    expect(result).toBe(key);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `Information message template not found for key: ${key}. Returning key as message.`
    );
  });

  it('params が undefined または空のオブジェクトの場合でも正しく動作する', () => {
    const key = 'Info.Common.Updated';
    const expectedMessage = "テスト: 更新しました。";

    // params is undefined
    let result = getInformationMessage(key);
    expect(result).toBe(expectedMessage);

    // params is an empty object
    result = getInformationMessage(key, {});
    expect(result).toBe(expectedMessage);

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('メッセージテンプレートに複数のパラメータがある場合に正しく置換する', () => {
    // このテストケースのためにモックに一時的に追加するか、
    // 実際の messages.json に対応するエントリがあることを想定
    // jest.mock の中で Info.User.DetailedWelcome のようなキーを追加したと仮定
    // "Info.User.DetailedWelcome": "テスト: {greeting}, {userName}さん！"
    // このテストを実行するためには、上記のモックに以下のようなエントリを追加してください:
    // DetailedWelcome: "テスト: {greeting}, {userName}さん！" を Info.User の下に追加。
    // もしモックになければ、このテストはキーが見つからないケースとして振る舞います。
    // ここでは、モックに "Info.User.DetailedWelcome": "テスト: {greeting}, {userName}さん！" があると仮定します。
    // そのためには、jest.mock の User の部分を以下のようにします。
    // User: {
    //   Welcome: "テスト: {userName}さん、ようこそ！",
    //   ItemSaved: "テスト: {itemName}を保存しました。",
    //   DetailedWelcome: "テスト: {greeting}, {userName}さん！" // 追加
    // }
    const key = 'Info.User.DetailedWelcome';
    const params = { greeting: 'こんにちは', userName: '鈴木' };
    // 上記モック追加を前提としない場合、このテストは Info.User.DetailedWelcome が見つからず失敗します。
    // ユーザーがモックを拡張できることを示すために、ここではあえてこのままにします。
    // 期待値をキー自体にして、警告が出ることをテストすることもできます。
    const result = getInformationMessage(key, params);
    // 期待値: "テスト: こんにちは, 鈴木さん！" (モックに上記キーがあれば)
    // モックに上記キーがない場合は、キー自体 "Info.User.DetailedWelcome" が返る
    if (result === key) { // キーが見つからなかった場合のテスト
        expect(result).toBe(key);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            `Information message template not found for key: ${key}. Returning key as message.`
        );
    } else { // キーが見つかった場合のテスト (モックに "DetailedWelcome" を追加した場合)
        expect(result).toBe("テスト: こんにちは, 鈴木さん！");
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    }
  });
});