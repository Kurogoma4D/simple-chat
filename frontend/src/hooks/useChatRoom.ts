import { useState, useCallback } from 'react';
import { Message, User, ServerMessage } from '../../../shared/types/websocket';

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
    switch (message.type) {
      case 'welcome':
        setState((prev) => ({
          ...prev,
          userId: message.userId,
          messages: message.history,
          error: null,
        }));
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
