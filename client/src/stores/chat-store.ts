// ─── Chat Store：聊天狀態管理 ───

import { create } from 'zustand';
import type { ChatMessage } from '@shared/types';

interface ChatStoreState {
  messages: ChatMessage[];
}

interface ChatStoreActions {
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStoreState & ChatStoreActions>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
