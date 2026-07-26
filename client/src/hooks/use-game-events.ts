// ─── useGameEvents：監聽遊戲相關 Socket 事件 ───

import { useEffect } from 'react';
import { socket } from '../socket';
import { useGameStore } from '../stores/game-store';
import { useRoomStore } from '../stores/room-store';
import type {
  Card,
  Seat,
  BidAction,
  Contract,
  GameResult,
  GameLogEntry,
} from '@shared/types';

export function useGameEvents(): void {
  const {
    setPhase,
    setMyHand,
    setCurrentTurn,
    setContract,
    setResult,
    addLogEntry,
    setRedealPendingSeat,
    updateTrickEnd,
    playCard,
  } = useGameStore();

  const { updateRoomInfo } = useRoomStore();

  useEffect(() => {
    const handleDealt = (payload: { hand: Card[] }): void => {
      setMyHand(payload.hand);
      setPhase('dealing');
    };

    const handleRedealAvailable = (payload: { seat: Seat }): void => {
      setRedealPendingSeat(payload.seat);
      setPhase('redeal_pending');
    };

    const handleRedealt = (payload: { hand: Card[] }): void => {
      setMyHand(payload.hand);
    };

    const handleBiddingStart = (payload: { startSeat: Seat }): void => {
      setPhase('bidding');
      setCurrentTurn(payload.startSeat);
    };

    const handleBidMade = (payload: { seat: Seat; action: BidAction }): void => {
      addLogEntry({ type: 'bid', seat: payload.seat, action: payload.action, timestamp: Date.now() });
    };

    const handleBiddingEnd = (payload: { contract: Contract }): void => {
      setContract(payload.contract);
    };

    const handleTurnStart = (payload: { seat: Seat; validCards?: Card[] }): void => {
      setCurrentTurn(payload.seat, payload.validCards);
    };

    const handleCardPlayed = (payload: { seat: Seat; card: Card }): void => {
      playCard(payload.seat, payload.card);
    };

    const handleTrickEnd = (payload: {
      winner: Seat;
      cards: Record<Seat, Card>;
      trickCountEW: number;
      trickCountNS: number;
    }): void => {
      updateTrickEnd(payload.trickCountEW, payload.trickCountNS);
    };

    const handleGameEnded = (payload: { result: GameResult }): void => {
      setResult(payload.result);
    };

    const handleGameAborted = (_payload: { reason: string }): void => {
      setPhase('scoring');
    };

    const handleLogEntry = (payload: { entry: GameLogEntry }): void => {
      addLogEntry(payload.entry);
    };

    socket.on('game:dealt', handleDealt);
    socket.on('game:redealAvailable', handleRedealAvailable);
    socket.on('game:redealt', handleRedealt);
    socket.on('game:biddingStart', handleBiddingStart);
    socket.on('game:bidMade', handleBidMade);
    socket.on('game:biddingEnd', handleBiddingEnd);
    socket.on('game:turnStart', handleTurnStart);
    socket.on('game:cardPlayed', handleCardPlayed);
    socket.on('game:trickEnd', handleTrickEnd);
    socket.on('game:ended', handleGameEnded);
    socket.on('game:aborted', handleGameAborted);
    socket.on('game:logEntry', handleLogEntry);

    return () => {
      socket.off('game:dealt', handleDealt);
      socket.off('game:redealAvailable', handleRedealAvailable);
      socket.off('game:redealt', handleRedealt);
      socket.off('game:biddingStart', handleBiddingStart);
      socket.off('game:bidMade', handleBidMade);
      socket.off('game:biddingEnd', handleBiddingEnd);
      socket.off('game:turnStart', handleTurnStart);
      socket.off('game:cardPlayed', handleCardPlayed);
      socket.off('game:trickEnd', handleTrickEnd);
      socket.off('game:ended', handleGameEnded);
      socket.off('game:aborted', handleGameAborted);
      socket.off('game:logEntry', handleLogEntry);
    };
  }, [
    setPhase, setMyHand, setCurrentTurn, setContract, setResult,
    addLogEntry, setRedealPendingSeat, updateTrickEnd, playCard,
    updateRoomInfo,
  ]);
}
