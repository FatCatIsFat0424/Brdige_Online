// ─── ChatPanel 元件：聊天面板 ───

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { socket } from '../socket';
import { useChatStore } from '../stores/chat-store';
import { usePlayerStore } from '../stores/player-store';
import { useI18nStore } from '../stores/i18n-store';
import type { ChatMessage } from '@shared/types';
import styles from './ChatPanel.module.css';

export function ChatPanel(): ReactNode {
  const { messages, addMessage } = useChatStore();
  const { nickname } = usePlayerStore();
  const { t } = useI18nStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 監聽聊天訊息
  useEffect(() => {
    const handleReceived = (payload: { message: ChatMessage }): void => {
      addMessage(payload.message);
    };

    socket.on('chat:received', handleReceived);
    return () => {
      socket.off('chat:received', handleReceived);
    };
  }, [addMessage]);

  // 自動捲動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback((): void => {
    const trimmed = input.trim();
    if (!trimmed) return;

    socket.emit('chat:send', { message: trimmed }, (res) => {
      if (res.success) {
        // 自己的訊息不會從 server 廣播回來，手動加入
        addMessage({
          id: `local-${Date.now()}`,
          sender: { id: '', nickname, color: '' },
          content: trimmed,
          timestamp: Date.now(),
        });
        setInput('');
      }
    });
  }, [input, nickname, addMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>{t('chat.title')}</div>

      <div className={styles.chatMessages}>
        {messages.map((msg) => (
          <div key={msg.id} className={styles.chatMessage}>
            <span className={styles.chatSender} style={{ color: msg.sender.color || 'var(--color-primary)' }}>
              {msg.sender.nickname}
            </span>
            <span className={styles.chatContent}>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInputRow}>
        <input
          className={styles.chatInput}
          type="text"
          placeholder={t('chat.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={styles.chatSendBtn}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          {t('chat.send')}
        </button>
      </div>
    </div>
  );
}
