// ─── LobbyPage：大廳頁面 ───

import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import { usePlayerStore } from '../stores/player-store';
import { useRoomStore } from '../stores/room-store';
import { useI18nStore } from '../stores/i18n-store';
import { LanguageSwitch } from '../components/LanguageSwitch';
import styles from './LobbyPage.module.css';

const PRESET_COLORS = [
  '#4a9eff', '#818cf8', '#a78bfa', '#f472b6',
  '#fb923c', '#fbbf24', '#4ade80', '#2dd4bf',
  '#f87171', '#e879f9', '#60a5fa', '#34d399',
];

export function LobbyPage(): ReactNode {
  const navigate = useNavigate();
  const { nickname, color, isRegistered, setNickname, setColor, setPlayer } = usePlayerStore();
  const { setRoom, setMySeat } = useRoomStore();
  const { t } = useI18nStore();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ensureRegistered = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isRegistered) {
        resolve(true);
        return;
      }

      if (!nickname.trim()) {
        setError(t('lobby.nicknamePlaceholder'));
        resolve(false);
        return;
      }

      connectSocket();

      const onConnect = (): void => {
        socket.emit('player:setNickname', { nickname: nickname.trim(), color }, (res) => {
          if (res.success && res.playerId && res.reconnectToken) {
            setPlayer(res.playerId, res.reconnectToken);
            setError('');
            resolve(true);
          } else {
            setError(res.error ?? t('common.error'));
            resolve(false);
          }
        });
        socket.off('connect', onConnect);
      };

      if (socket.connected) {
        onConnect();
      } else {
        socket.on('connect', onConnect);
      }
    });
  }, [isRegistered, nickname, color, setPlayer, t]);

  const handleCreateRoom = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');

    const registered = await ensureRegistered();
    if (!registered) {
      setLoading(false);
      return;
    }

    socket.emit('room:create', { gameType: 'bridge' }, (res) => {
      setLoading(false);
      if (res.success && res.roomCode) {
        setRoom(res.roomCode, {
          code: res.roomCode,
          gameType: 'bridge',
          status: 'waiting',
          seats: { N: { player: null, isReady: false }, E: { player: null, isReady: false }, S: { player: null, isReady: false }, W: { player: null, isReady: false } },
          createdAt: Date.now(),
        });
        setMySeat(null);
        navigate(`/room/${res.roomCode}`);
      } else {
        setError(res.error ?? t('common.error'));
      }
    });
  }, [ensureRegistered, setRoom, setMySeat, navigate, t]);

  const handleJoinRoom = useCallback(async (): Promise<void> => {
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) {
      setError(t('lobby.roomCodePlaceholder'));
      return;
    }

    setLoading(true);
    setError('');

    const registered = await ensureRegistered();
    if (!registered) {
      setLoading(false);
      return;
    }

    socket.emit('room:join', { roomCode: code }, (res) => {
      setLoading(false);
      if (res.success && res.room) {
        setRoom(code, res.room);
        setMySeat(null);
        navigate(`/room/${code}`);
      } else {
        setError(res.error ?? t('common.error'));
      }
    });
  }, [roomCodeInput, ensureRegistered, setRoom, setMySeat, navigate, t]);

  return (
    <div className={styles.lobbyContainer}>
      <div className={styles.lobbyCard}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-sm)' }}>
          <LanguageSwitch />
        </div>

        <div className={styles.lobbyTitle}>
          <h1>🃏 {t('lobby.title')}</h1>
          <p>{t('lobby.subtitle')}</p>
        </div>

        {/* 暱稱 */}
        <div className={styles.formGroup}>
          <label htmlFor="nickname-input">{t('lobby.nickname')}</label>
          <input
            id="nickname-input"
            type="text"
            placeholder={t('lobby.nicknamePlaceholder')}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={10}
            disabled={isRegistered}
          />
        </div>

        {/* 顏色選擇 */}
        <div className={styles.formGroup}>
          <label>{t('lobby.color')}</label>
          <div className={styles.colorPicker}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`${styles.colorSwatch} ${c === color ? styles.colorSwatchActive : ''}`}
                style={{ backgroundColor: c, color: c }}
                onClick={() => setColor(c)}
                disabled={isRegistered}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.divider}>{t('room.title')}</div>

        {/* 房間操作 */}
        <div className={styles.roomActions}>
          <button
            className={`btn btn-primary ${styles.fullWidthBtn}`}
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('lobby.createRoom')}
          </button>

          <div className={styles.joinRow}>
            <input
              id="room-code-input"
              type="text"
              placeholder={t('lobby.roomCodePlaceholder')}
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              className="btn btn-outline"
              onClick={handleJoinRoom}
              disabled={loading}
            >
              {t('lobby.join')}
            </button>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>
    </div>
  );
}
