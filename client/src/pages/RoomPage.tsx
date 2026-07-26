// ─── RoomPage：房間等待頁面 ───

import { useEffect, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { usePlayerStore } from '../stores/player-store';
import { useRoomStore } from '../stores/room-store';
import { useI18nStore } from '../stores/i18n-store';
import { ChatPanel } from '../components/ChatPanel';
import { LanguageSwitch } from '../components/LanguageSwitch';
import type { Seat, RoomInfo } from '@shared/types';
import styles from './RoomPage.module.css';

const SEAT_STYLE_MAP: Record<Seat, string> = {
  N: styles.seatNorth,
  E: styles.seatEast,
  S: styles.seatSouth,
  W: styles.seatWest,
};

export function RoomPage(): ReactNode {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { playerId } = usePlayerStore();
  const { roomInfo, mySeat, updateRoomInfo, setMySeat, leaveRoom } = useRoomStore();
  const { t } = useI18nStore();
  const [isReady, setIsReady] = useState(false);

  const seatLabel = (seat: Seat): string => t(`seat.${seat}` as 'seat.N');

  // 監聽房間更新
  useEffect(() => {
    const handleRoomUpdated = (payload: { room: RoomInfo }): void => {
      updateRoomInfo(payload.room);
    };

    const handlePlayerLeft = (): void => {
      // Room state 會在 room:updated 中更新
    };

    // 遊戲開始時自動跳轉到遊戲頁面
    const handleGameDealt = (): void => {
      navigate(`/game/${roomCode}`);
    };

    socket.on('room:updated', handleRoomUpdated);
    socket.on('room:playerLeft', handlePlayerLeft);
    socket.on('game:dealt', handleGameDealt);

    return () => {
      socket.off('room:updated', handleRoomUpdated);
      socket.off('room:playerLeft', handlePlayerLeft);
      socket.off('game:dealt', handleGameDealt);
    };
  }, [updateRoomInfo, navigate, roomCode]);

  // 如果沒有房間資訊，返回大廳
  useEffect(() => {
    if (!roomCode || !playerId) {
      navigate('/');
    }
  }, [roomCode, playerId, navigate]);

  const handleChangeSeat = useCallback((seat: Seat): void => {
    socket.emit('room:changeSeat', { seat }, (res) => {
      if (res.success) {
        setMySeat(seat);
        setIsReady(false);
      }
    });
  }, [setMySeat]);

  const handleReady = useCallback((): void => {
    if (!mySeat) return;

    if (isReady) {
      socket.emit('room:unready', (res) => {
        if (res.success) setIsReady(false);
      });
    } else {
      socket.emit('room:ready', (res) => {
        if (res.success) setIsReady(true);
      });
    }
  }, [mySeat, isReady]);

  const handleLeave = useCallback((): void => {
    socket.emit('room:leave', () => {
      leaveRoom();
      navigate('/');
    });
  }, [leaveRoom, navigate]);

  if (!roomInfo || !roomCode) {
    return null;
  }

  const seats = roomInfo.seats;

  return (
    <div className={styles.roomContainer}>
      {/* Header */}
      <div className={styles.roomHeader}>
        <div>
          <div className={styles.roomCodeLabel}>{t('room.code')}</div>
          <div className={styles.roomCode}>{roomCode}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <LanguageSwitch />
          <button className="btn btn-outline" onClick={handleLeave}>
            {t('room.leave')}
          </button>
        </div>
      </div>

      {/* Seat Grid */}
      <div className={styles.seatLayout}>
        {(['N', 'E', 'S', 'W'] as Seat[]).map((seat) => {
          const seatInfo = seats[seat];
          const isOccupied = seatInfo.player !== null;
          const isMine = seatInfo.player?.id === playerId;

          return (
            <div
              key={seat}
              className={[
                styles.seatSlot,
                SEAT_STYLE_MAP[seat],
                isOccupied ? styles.seatSlotOccupied : '',
                isMine ? styles.seatSlotMine : '',
              ].filter(Boolean).join(' ')}
              onClick={() => !isOccupied && handleChangeSeat(seat)}
            >
              <div className={styles.seatLabel}>{seatLabel(seat)}</div>

              {isOccupied ? (
                <>
                  {seatInfo.player && (
                    <div
                      className={styles.seatColorDot}
                      style={{ backgroundColor: seatInfo.player.color }}
                    />
                  )}
                  <div className={styles.seatPlayerName} style={{ color: seatInfo.player?.color }}>
                    {seatInfo.player?.nickname}
                  </div>
                  <div className={seatInfo.isReady ? styles.seatReadyBadge : styles.seatNotReadyBadge}>
                    {seatInfo.isReady ? t('room.ready.status') : t('room.seatTaken')}
                  </div>
                </>
              ) : (
                <div className={styles.seatEmpty}>{t('room.seatEmpty')}</div>
              )}
            </div>
          );
        })}

        <div className={styles.tableCenter}>
          <div className={styles.tableCenterText}>
            {t('room.waiting')}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.roomFooter}>
        <button
          className={`btn ${isReady ? 'btn-danger' : 'btn-success'} ${styles.readyBtn}`}
          onClick={handleReady}
          disabled={!mySeat}
        >
          {isReady ? t('room.unready') : t('room.ready')}
        </button>
      </div>

      {/* Chat */}
      <div style={{ width: '100%', maxWidth: '800px', marginTop: 'var(--spacing-md)' }}>
        <ChatPanel />
      </div>
    </div>
  );
}
