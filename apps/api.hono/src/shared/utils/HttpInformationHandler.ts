import messagesJa from '@locales/ja/messages.json';

/**
 * 指定されたキーとパラメータに基づいて、情報メッセージを取得しフォーマットします。
 * @param key メッセージカタログ内の情報メッセージを指すキー (例: "Info.Common.Saved")
 * @param params メッセージテンプレートに埋め込むための動的な値 (例: { itemName: "ユーザー" })
 * @returns フォーマットされた情報メッセージ文字列。キーが見つからない場合は、キー自体を返すか、
 * またはデフォルトのフォールバックメッセージを返します。
 */
export function getInformationMessage(
  key: string,
  params?: Record<string, string | number>
): string {
  const path = key.split('.');
  let templateCatalog: any = messagesJa;

  for (const p of path) {
    if (templateCatalog && typeof templateCatalog === 'object' && p in templateCatalog) {
      templateCatalog = templateCatalog[p];
    } else {
      templateCatalog = undefined; // キーが見つからない
      break;
    }
  }

  if (typeof templateCatalog === 'string') {
    if (params) {
      return templateCatalog.replace(/{(\w+)}/g, (_, paramKey) =>
        params[paramKey] !== undefined ? String(params[paramKey]) : `{${paramKey}}`
      );
    }
    return templateCatalog; // パラメータなしの場合はそのまま返す
  }

  // キーに対応するメッセージテンプレートが見つからない場合
  console.warn(`Information message template not found for key: ${key}. Returning key as message.`);
  return key; // キーそのものを返すか、あるいは固定のフォールバックメッセージを返す
}