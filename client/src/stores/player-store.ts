// ─── Player Store：玩家自身狀態管理 ───

import { create } from 'zustand';
import type { PlayerId, ReconnectToken, PlayerColor } from '@shared/types';

interface PlayerStoreState {
  playerId: PlayerId | null;
  reconnectToken: ReconnectToken | null;
  nickname: string;
  color: PlayerColor;
  isRegistered: boolean;
}

interface PlayerStoreActions {
  setPlayer: (playerId: PlayerId, reconnectToken: ReconnectToken) => void;
  setNickname: (nickname: string) => void;
  setColor: (color: PlayerColor) => void;
  setReconnectToken: (token: ReconnectToken) => void;
  reset: () => void;
}

const initialState: PlayerStoreState = {
  playerId: null,
  reconnectToken: null,
  nickname: '',
  color: '#4a9eff',
  isRegistered: false,
};

export const usePlayerStore = create<PlayerStoreState & PlayerStoreActions>((set) => ({
  ...initialState,
  setPlayer: (playerId, reconnectToken) =>
    set({ playerId, reconnectToken, isRegistered: true }),
  setNickname: (nickname) => set({ nickname }),
  setColor: (color) => set({ color }),
  setReconnectToken: (token) => set({ reconnectToken: token }),
  reset: () => set(initialState),
}));
