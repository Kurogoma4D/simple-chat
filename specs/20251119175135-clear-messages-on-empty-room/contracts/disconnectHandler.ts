/**
 * disconnectHandler Contract
 *
 * WebSocket切断時の処理フロー
 */

/**
 * ユーザー切断処理フロー
 *
 * 1. ユーザーをオフライン状態に更新
 * 2. システムメッセージ（退室通知）を作成
 * 3. 全クライアントに退室通知をブロードキャスト
 * 4. オンラインユーザー数をチェック
 * 5. オンラインユーザー数が0の場合、全メッセージを削除
 *
 * @param socketId WebSocketのID
 * @returns Promise<void>
 *
 * @example
 * await handleDisconnect('socket-123');
 */
export interface HandleDisconnect {
  (socketId: string): Promise<void>;
}

/**
 * メッセージクリア処理（内部関数）
 *
 * オンラインユーザー数が0の場合に呼び出され、全メッセージを削除します。
 * この処理は非同期で実行され、ユーザー退出処理をブロックしません。
 *
 * @returns Promise<void>
 * @throws Error メッセージ削除に失敗した場合（エラーはログに記録され、スロー しない）
 *
 * @example
 * // fire-and-forget pattern
 * void clearMessagesIfRoomEmpty();
 */
export interface ClearMessagesIfRoomEmpty {
  (): Promise<void>;
}

/**
 * 処理フロー
 *
 * ```typescript
 * async function handleDisconnect(socketId: string): Promise<void> {
 *   // 1. Get connection info
 *   const connection = connectionManager.remove(socketId);
 *
 *   // 2. Update user to offline
 *   await userService.leave(connection.userId);
 *
 *   // 3. Create system message
 *   const systemMessage = await systemMessageService.createLeaveMessage(connection.userName);
 *
 *   // 4. Broadcast user-left event
 *   broadcastToAll(userLeftMessage);
 *
 *   // 5. Check if room is empty and clear messages (fire-and-forget)
 *   void clearMessagesIfRoomEmpty();
 * }
 *
 * async function clearMessagesIfRoomEmpty(): Promise<void> {
 *   try {
 *     const onlineCount = await userService.getActiveUsers().length;
 *     if (onlineCount === 0) {
 *       const deletedCount = await messageService.clearAllMessages();
 *       console.log(`[MessageClear] Cleared ${deletedCount} messages`);
 *     }
 *   } catch (error) {
 *     console.error('[MessageClear] Failed to clear messages:', error);
 *   }
 * }
 * ```
 */
