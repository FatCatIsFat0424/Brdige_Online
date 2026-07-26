// ─── GamePage：遊戲頁面 ───

import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../socket';
import { useGameStore } from '../stores/game-store';
import { useRoomStore } from '../stores/room-store';
import { useI18nStore } from '../stores/i18n-store';
import { useGameEvents } from '../hooks/use-game-events';
import { CardHand } from '../components/CardHand';
import { BiddingPanel } from '../components/BiddingPanel';
import { TrickArea } from '../components/TrickArea';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { SUIT_SYMBOLS } from '@shared/constants';
import type { Card, Seat, BidSuit } from '@shared/types';
import styles from './GamePage.module.css';

function getSuitLabel(suit: BidSuit): string {
  if (suit === 'nt') return 'NT';
  return SUIT_SYMBOLS[suit];
}

export function GamePage(): ReactNode {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { mySeat } = useRoomStore();
  const { t } = useI18nStore();
  const {
    phase,
    myHand,
    currentTurnSeat,
    validCards,
    contract,
    playing,
    result,
    redealPendingSeat,
    reset: resetGame,
  } = useGameStore();

  useGameEvents();

  const isMyTurn = mySeat === currentTurnSeat;

  const seatLabel = (seat: Seat): string => t(`seat.${seat}` as 'seat.N');

  const handlePlayCard = useCallback((card: Card): void => {
    socket.emit('game:playCard', { card }, () => {});
  }, []);

  const handleRedealResponse = useCallback((accept: boolean): void => {
    socket.emit('game:redealResponse', { accept }, () => {});
  }, []);

  const handleBackToRoom = useCallback((): void => {
    socket.emit('game:continue', () => {
      resetGame();
      navigate(`/room/${roomCode}`);
    });
  }, [resetGame, navigate, roomCode]);

  if (!phase) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.gameBody}>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const phaseKey = `game.${phase}` as 'game.dealing';

  return (
    <div className={styles.gameContainer}>
      {/* Header */}
      <div className={styles.gameHeader}>
        <div className={styles.gameHeaderInfo}>
          <span className={styles.phaseLabel}>{t(phaseKey)}</span>
          {contract && (
            <span className={styles.contractLabel}>
              {t('game.contract')}：{contract.level}{getSuitLabel(contract.suit)} by {seatLabel(contract.declarer)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {t('game.mySeat')}：{mySeat ? seatLabel(mySeat) : '—'}
          </span>
          <LanguageSwitch />
        </div>
      </div>

      {/* Body */}
      <div className={styles.gameBody}>
        {/* 倒牌確認 */}
        {phase === 'redeal_pending' && redealPendingSeat === mySeat && (
          <div className={styles.scoreCard}>
            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>{t('redeal.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              {t('redeal.description')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              <button className="btn btn-success" onClick={() => handleRedealResponse(true)}>
                {t('redeal.accept')}
              </button>
              <button className="btn btn-outline" onClick={() => handleRedealResponse(false)}>
                {t('redeal.decline')}
              </button>
            </div>
          </div>
        )}

        {/* 叫牌面板 */}
        {phase === 'bidding' && (
          <div className={styles.sidePanel}>
            <BiddingPanel />
          </div>
        )}

        {/* 桌面區域 */}
        <div className={styles.tableArea}>
          {(['N', 'E', 'S', 'W'] as Seat[]).map((seat) => {
            const seatStyleMap: Record<Seat, string> = {
              N: styles.seatN,
              E: styles.seatE,
              S: styles.seatS,
              W: styles.seatW,
            };
            return (
              <div
                key={seat}
                className={`${styles.seatIndicator} ${seatStyleMap[seat]} ${currentTurnSeat === seat ? styles.seatIndicatorActive : ''}`}
              >
                <span className={styles.seatName}>{seatLabel(seat)}</span>
                {seat === mySeat && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>{t('common.me')}</span>}
              </div>
            );
          })}

          <div className={styles.tableCenterArea}>
            {phase === 'playing' && playing ? (
              <TrickArea
                currentTrick={playing.currentTrick}
                trickCountEW={playing.trickCountEW}
                trickCountNS={playing.trickCountNS}
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
                {phase === 'bidding' ? `${t('game.bidding')}...` : `${t('common.loading')}`}
              </div>
            )}
          </div>
        </div>

        {/* 出牌提示 */}
        {phase === 'playing' && (
          <div className={`${styles.turnIndicator} ${isMyTurn ? styles.turnIndicatorMyTurn : ''}`}>
            {isMyTurn
              ? t('game.myTurn')
              : t('game.waitingFor', { seat: currentTurnSeat ? seatLabel(currentTurnSeat) : '...' })}
          </div>
        )}

        {/* 手牌區域 */}
        <div className={styles.handArea}>
          <CardHand
            cards={myHand}
            playableCards={isMyTurn ? validCards : []}
            onCardClick={handlePlayCard}
            disabled={!isMyTurn || phase !== 'playing'}
          />
        </div>
      </div>

      {/* 結算彈窗 */}
      {phase === 'scoring' && result && (
        <div className={styles.scoreOverlay}>
          <div className={styles.scoreCard}>
            <h2 className={`${styles.scoreTitle} ${result.declarerTeamWins ? styles.scoreWin : styles.scoreLose}`}>
              {result.declarerTeamWins ? t('score.declarerWins') : t('score.defenderWins')}
            </h2>
            <div className={styles.scoreDetails}>
              <div>{t('game.contract')}：{result.contract.level}{getSuitLabel(result.contract.suit)} by {seatLabel(result.contract.declarer)}</div>
              <div>{t('score.required')}：{result.requiredTricks}</div>
              <div>{t('score.declarerTricks')}：{result.declarerTeamTricks}</div>
              <div>{t('score.defenderTricks')}：{result.defenderTeamTricks}</div>
            </div>
            <button className="btn btn-primary" onClick={handleBackToRoom}>
              {t('score.backToRoom')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
