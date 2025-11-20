/**
 * MessageService Contract
 *
 * メッセージ管理サービスのインターフェース定義
 */

/**
 * 全メッセージを削除する
 *
 * @returns 削除されたメッセージの件数
 * @throws Error メッセージ削除に失敗した場合
 *
 * @example
 * const messageService = new MessageService();
 * const deletedCount = await messageService.clearAllMessages();
 * console.log(`${deletedCount} messages deleted`);
 */
export interface ClearAllMessages {
  (): Promise<number>;
}

/**
 * MessageServiceインターフェース（拡張）
 */
export interface MessageService {
  /**
   * 全メッセージを削除
   */
  clearAllMessages: ClearAllMessages;

  // 既存メソッド（参考）
  // create(userId: string | null, userName: string, content: string, type: MessageType): Promise<Message>;
  // getRecentMessages(limit: number): Promise<Message[]>;
}
