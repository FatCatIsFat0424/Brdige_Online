// ─── Game Store：遊戲狀態管理 ───

import { create } from 'zustand';
import type {
  Card,
  Seat,
  BidAction,
  Contract,
  BiddingState,
  PlayingState,
  GamePhase,
  GameResult,
  GameLogEntry,
} from '@shared/types';

interface GameStoreState {
  phase: GamePhase | null;
  myHand: Card[];
  dealerSeat: Seat | null;
  currentTurnSeat: Seat | null;
  validCards: Card[];
  bidding: BiddingState | null;
  contract: Contract | null;
  playing: PlayingState | null;
  result: GameResult | null;
  log: GameLogEntry[];
  redealPendingSeat: Seat | null;
}

interface GameStoreActions {
  setPhase: (phase: GamePhase) => void;
  setMyHand: (hand: Card[]) => void;
  setDealerSeat: (seat: Seat) => void;
  setCurrentTurn: (seat: Seat, validCards?: Card[]) => void;
  setBidding: (bidding: BiddingState | null) => void;
  addBid: (seat: Seat, action: BidAction) => void;
  setContract: (contract: Contract) => void;
  setPlaying: (playing: PlayingState | null) => void;
  setResult: (result: GameResult) => void;
  addLogEntry: (entry: GameLogEntry) => void;
  setRedealPendingSeat: (seat: Seat | null) => void;
  updateTrickEnd: (trickCountEW: number, trickCountNS: number) => void;
  playCard: (seat: Seat, card: Card) => void;
  reset: () => void;
}

const initialState: GameStoreState = {
  phase: null,
  myHand: [],
  dealerSeat: null,
  currentTurnSeat: null,
  validCards: [],
  bidding: null,
  contract: null,
  playing: null,
  result: null,
  log: [],
  redealPendingSeat: null,
};

export const useGameStore = create<GameStoreState & GameStoreActions>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setMyHand: (hand) => set({ myHand: hand }),
  setDealerSeat: (seat) => set({ dealerSeat: seat }),
  setCurrentTurn: (seat, validCards) => set({ currentTurnSeat: seat, validCards: validCards ?? [] }),
  setBidding: (bidding) => set({ bidding }),
  addBid: (seat, action) =>
    set((state) => ({
      bidding: state.bidding
        ? {
            ...state.bidding,
            bids: [...state.bidding.bids, { seat, action }],
            currentBidderSeat: seat,
          }
        : null,
    })),
  setContract: (contract) => set({ contract, phase: 'playing' }),
  setPlaying: (playing) => set({ playing }),
  setResult: (result) => set({ result, phase: 'scoring' }),
  addLogEntry: (entry) =>
    set((state) => ({ log: [...state.log, entry] })),
  setRedealPendingSeat: (seat) => set({ redealPendingSeat: seat }),
  updateTrickEnd: (trickCountEW, trickCountNS) =>
    set((state) => ({
      playing: state.playing ? { ...state.playing, trickCountEW, trickCountNS, currentTrick: {} } : null,
    })),
  playCard: (seat, card) =>
    set((state) => {
      // 如果是自己的牌，從手牌移除
      const newHand = state.myHand.filter(
        (c) => !(c.suit === card.suit && c.rank === card.rank),
      );
      const newTrick = { ...(state.playing?.currentTrick ?? {}), [seat]: card };
      return {
        myHand: newHand.length < state.myHand.length ? newHand : state.myHand,
        playing: state.playing ? { ...state.playing, currentTrick: newTrick } : null,
      };
    }),
  reset: () => set(initialState),
}));
