// src/shared/utils/HttpErrorHandler.ts (または実際のパス)

import {
  PasswordPolicyError,
  PasswordTooShortError,
  // PasswordEmptyError,
  // PasswordMissingUppercaseError,
  // PasswordMissingLowercaseError,
  // PasswordMissingNumberError,
  // PasswordMissingSpecialCharacterError,
} from '@/user-management/application/domain/error/PasswordPolicyErrors';

import messagesJa from '@locales/ja/messages.json';

interface ErrorDetail {
  messageKey: string;
  statusCode: number;
  params: Record<string, string | number>;
}

export interface ResponseMessage {
  message: string;
  statusCode: number;
}

/**
 * 指定されたエラーに基づいて、ユーザーに表示するエラーメッセージを取得します。
 * @param error エラーオブジェクト
 * @returns ユーザーに表示するエラーメッセージとHTTPステータスコード
 */
export const getErrorMessage = (error: Error): ResponseMessage => {
  const { messageKey, statusCode, params } = getErrorDetail(error);

  const message = getMessage(messageKey, params);
  if (message) {
    return { message, statusCode };
  }

  console.warn(`Message template not found for key: ${messageKey}. Falling back to generic error.`);
  return {
    message: (messagesJa as any)?.Error?.Common?.InternalServerError || "エラーが発生しました。",
    statusCode,
  };
};

/**
 * エラーの詳細を取得します。
 * @param error エラーオブジェクト
 * @returns エラーの詳細
 */
const getErrorDetail = (error: Error): ErrorDetail => {
  if (error instanceof PasswordPolicyError) {
    return {
      messageKey: `Error.PasswordPolicy.${error.constructor.name}`,
      statusCode: 400,
      params: error instanceof PasswordTooShortError ? { minLength: error.minLength } : {},
    };
  }

  console.error("Unhandled error type or generic error:", error);
  return {
    messageKey: 'Error.Common.InternalServerError',
    statusCode: 500,
    params: {},
  };
}

/**
 * 指定されたキーとパラメータに基づいて、情報メッセージを取得しフォーマットします。
 * @param key メッセージカタログ内の情報メッセージを指すキー (例: "Info.Common.Saved")
 * @param params メッセージテンプレートに埋め込むための動的な値 (例: { itemName: "ユーザー" })
 * @returns フォーマットされた情報メッセージ文字列。キーが見つからない場合は、キー自体を返すか、
 * またはデフォルトのフォールバックメッセージを返します。
 */
const getMessage = (key: string, params: Record<string, string | number>): string | undefined => {
  const path = key.split('.');
  let templateCatalog: any = messagesJa;

  for (const p of path) {
    if (templateCatalog && typeof templateCatalog === 'object' && p in templateCatalog) {
      templateCatalog = templateCatalog[p];
    } else {
      templateCatalog = undefined;
      break;
    }
  }

  if (typeof templateCatalog === 'string') {
    return templateCatalog.replace(/{(\w+)}/g, (_, key) =>
      params[key] !== undefined ? String(params[key]) : `{${key}}`
    );
  }
  return undefined;
}