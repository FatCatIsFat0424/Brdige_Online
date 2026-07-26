// ─── useReconnect：自動重連 hook ───

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, attemptReconnect } from '../socket';
import { usePlayerStore } from '../stores/player-store';

export function useReconnect(): void {
  const navigate = useNavigate();
  const { reconnectToken, setReconnectToken } = usePlayerStore();

  const handleReconnect = useCallback(async (): Promise<void> => {
    if (!reconnectToken) return;

    const result = await attemptReconnect(reconnectToken);

    if (!result.success) {
      // Token 無效，清除並回到大廳
      setReconnectToken('');
      navigate('/');
      return;
    }

    // 重連成功，恢復狀態
    // response 中包含 room 和 gameState（如果有的話）
    // 這些會透過 socket events 自動更新 stores
  }, [reconnectToken, setReconnectToken, navigate]);

  useEffect(() => {
    const handleConnect = (): void => {
      if (reconnectToken) {
        handleReconnect();
      }
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [reconnectToken, handleReconnect]);
}
