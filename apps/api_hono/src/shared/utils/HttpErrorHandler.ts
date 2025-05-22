import {
  PasswordPolicyError,
  PasswordTooShortError,
  // PasswordMissingUppercaseError,
  // PasswordMissingLowercaseError,
  // PasswordMissingNumberError,
  // PasswordMissingSpecialCharacterError,
  // PasswordEmptyError,
} from '@/user-management/application/domain/error/PasswordPolicyErrors';

import messagesJa from '@locales/ja/messages.json';

interface ResponseMessage {
  message: string;
  statusCode: number;
}

/**
 * エラーオブジェクトからユーザー向けのメッセージとHTTPステータスコードを取得します。
 * @param error 発生したエラーオブジェクト
 * @returns ユーザー向けメッセージとHTTPステータスコード
 */
export const getErrorMessage = (error: Error): ResponseMessage => {
  let messageKey: string | undefined;
  let params: Record<string, string | number> = {};
  let statusCode = 500; // デフォルトは Internal Server Error

  // PasswordPolicyError のサブクラスに対する処理
  if (error instanceof PasswordPolicyError) {
    messageKey = `PasswordPolicyErrors.${error.constructor.name}`;
    statusCode = 400; // PasswordPolicyError は通常 Bad Request

    if (error instanceof PasswordTooShortError) {
      params = { minLength: error.minLength };
    }
  }
  else {
    // 予期せぬエラーや一般的なエラー
    console.error("Unhandled error type or generic error:", error); // サーバーログには詳細を残す
    messageKey = 'CommonErrors.InternalServerError'; // デフォルトの内部サーバーエラーメッセージ
    statusCode = 500;
  }

  let userMessage = "エラーが発生しました。"; // 最終的なフォールバックメッセージ
  if (messageKey) {
    const path = messageKey.split('.');
    let templateCatalog: any = messagesJa; // 型アサーションでアクセスしやすくする

    for (const p of path) {
      if (templateCatalog && typeof templateCatalog === 'object' && p in templateCatalog) {
        templateCatalog = templateCatalog[p];
      } else {
        templateCatalog = undefined; // キーが見つからない
        break;
      }
    }

    if (typeof templateCatalog === 'string') {
      userMessage = templateCatalog.replace(/{(\w+)}/g, (_, key) =>
        params[key] !== undefined ? String(params[key]) : `{${key}}`
      );
    } else if (messageKey !== 'CommonErrors.InternalServerError') {
      // メッセージキーに対応するテンプレートが見つからない場合 (InternalServerError以外)
      console.warn(`Message template not found for key: ${messageKey}. Falling back to generic error.`);
      // CommonErrors.InternalServerErrorのメッセージをフォールバックとして使用
      userMessage = messagesJa.Error.Common.InternalServerError;
    }
  }

  return { message: userMessage, statusCode };
}