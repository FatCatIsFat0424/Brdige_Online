// ─── Room Store：房間狀態管理 ───

import { create } from 'zustand';
import type { RoomCode, RoomInfo, Seat } from '@shared/types';

interface RoomStoreState {
  currentRoomCode: RoomCode | null;
  roomInfo: RoomInfo | null;
  mySeat: Seat | null;
}

interface RoomStoreActions {
  setRoom: (roomCode: RoomCode, roomInfo: RoomInfo) => void;
  updateRoomInfo: (roomInfo: RoomInfo) => void;
  setMySeat: (seat: Seat | null) => void;
  leaveRoom: () => void;
}

const initialState: RoomStoreState = {
  currentRoomCode: null,
  roomInfo: null,
  mySeat: null,
};

export const useRoomStore = create<RoomStoreState & RoomStoreActions>((set) => ({
  ...initialState,
  setRoom: (roomCode, roomInfo) => set({ currentRoomCode: roomCode, roomInfo }),
  updateRoomInfo: (roomInfo) => set({ roomInfo }),
  setMySeat: (seat) => set({ mySeat: seat }),
  leaveRoom: () => set(initialState),
}));
