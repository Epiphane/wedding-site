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
  scale: number;
  rotation: number;
};

// Socket Types
export interface ServerToClientEvents {
  error: (message: string) => void;
  stickerPlaced: (item: Sticker) => void;
  stickerMoved: (item: Sticker) => void;
  canvasCleared: () => void;
}

export interface ClientToServerEvents {
  setIdentity: (name: string, callback: (info: Guest) => void) => void;
  placeSticker: (item: Partial<StickerProps>) => void;
  updateSticker: (item: Partial<StickerProps>) => void;
  clearCanvas: () => void;
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
