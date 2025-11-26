import Guest from "../server/model/guest";
import Sticker from "../server/model/sticker";

export interface StickerId {
  id: number;
  ownerId: number;
}

export interface StickerProps {
  type: 'image' | 'text';
  content: string;
  x: number;
  y: number;
  rotation: number;
};
// export interface Sticker {
//   id: number;
//   owner: string;
//   type: 'image' | 'text';
//   content: string;
//   x: number;
//   y: number;
//   rotation: number;
//   scale: number;
// }

// Socket Types

export interface ServerToClientEvents {
  stickerPlaced: (item: Sticker) => void;
  stickerMoved: (item: Sticker) => void;
}

export interface ClientToServerEvents {
  setIdentity: (name: string, callback: (info: Guest) => void) => void;
  placeSticker: (item: Partial<Sticker>) => void;
  updateSticker: (item: Partial<Sticker>) => void;
}

export interface SocketData {
  guestId?: number;
  name: string;
  isAdmin: boolean;
}

export interface ToBackendMsg {
  'placeSticker': Sticker,
  'updateSticker': Sticker
};
