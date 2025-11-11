import { useState, useCallback } from 'react';
import { Message } from '../../../shared/types/message';
import { User } from '../../../shared/types/user';
import { ServerMessage } from '../../../shared/types/websocket';

interface ChatRoomState {
  userId: string | null;
  messages: Message[];
  activeUsers: User[];
  error: string | null;
}

export function useChatRoom() {
  const [state, setState] = useState<ChatRoomState>({
    userId: null,
    messages: [],
    activeUsers: [],
    error: null,
  });

  const handleServerMessage = useCallback((message: ServerMessage) => {
    console.log('[useChatRoom] Handling message type:', message.type);
    switch (message.type) {
      case 'welcome':
        console.log('[useChatRoom] Welcome message received, userId:', message.userId);
        setState((prev) => ({
          ...prev,
          userId: message.userId,
          messages: message.history,
          error: null,
        }));
        console.log('[useChatRoom] State updated with userId');
        break;

      case 'message':
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, message.message],
        }));
        break;

      case 'user-joined':
        setState((prev) => ({
          ...prev,
          activeUsers: [...prev.activeUsers, message.user],
          messages: [...prev.messages, message.systemMessage],
        }));
        break;

      case 'user-left':
        setState((prev) => ({
          ...prev,
          activeUsers: prev.activeUsers.filter((u) => u.id !== message.userId),
          messages: [...prev.messages, message.systemMessage],
        }));
        break;

      case 'active-users':
        setState((prev) => ({
          ...prev,
          activeUsers: message.users,
        }));
        break;

      case 'error':
        setState((prev) => ({
          ...prev,
          error: message.message,
        }));
        break;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    handleServerMessage,
    clearError,
  };
}
