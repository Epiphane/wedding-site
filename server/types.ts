import { Socket } from 'socket.io';

export interface Guest {
  name: string;
  email: string;
  plusOne: boolean;
}

export interface SessionInfo {
  name: string;
  isAdmin: boolean;
}

export interface RsvpResponse {
  guestName: string;
  email: string;
  attending: 'attending' | 'notAttending';
  plusOneName: string | null;
  plusOneAttending: 'attending' | 'notAttending' | null;
}

export interface CanvasItemType {
  type: 'sticker' | 'textBox';
  value: string;
}

export interface CanvasItem {
  id: string;
  owner: string;
  itemType: CanvasItemType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export type ToBackend =
  | { type: 'lookupGuestByName'; name: string }
  | { type: 'submitRsvpToBackend'; rsvp: RsvpResponse }
  | { type: 'getBackendModel' }
  | { type: 'adminLogin'; password: string }
  | { type: 'logoutBackend' }
  | { type: 'getGuestList' }
  | { type: 'addOrUpdateGuest'; guest: Guest }
  | { type: 'deleteGuestByEmail'; email: string }
  | { type: 'placeCanvasItem'; item: CanvasItem }
  | { type: 'updateCanvasItemPosition'; itemId: string; x: number; y: number }
  | { type: 'updateCanvasItemRotation'; itemId: string; rotation: number }
  | { type: 'updateCanvasItemScale'; itemId: string; scale: number }
  | { type: 'getCanvas' };

export type ToFrontend =
  | { type: 'guestFound'; guest: Guest }
  | { type: 'guestNotFoundResponse' }
  | { type: 'initialBackend'; sessionInfo: SessionInfo; canvasItems: CanvasItem[] }
  | { type: 'rsvpSubmitted'; count: number }
  | { type: 'adminLoginSuccess' }
  | { type: 'adminLoginFailed' }
  | { type: 'adminAuthStatus'; isAuthenticated: boolean }
  | { type: 'guestListReceived'; guests: Guest[] }
  | { type: 'guestSaved' }
  | { type: 'guestDeleted' }
  | { type: 'canvasReceived'; canvasItems: CanvasItem[] }
  | { type: 'canvasItemPlaced'; item: CanvasItem }
  | { type: 'canvasItemMoved'; itemId: string; x: number; y: number }
  | { type: 'canvasItemRotated'; itemId: string; rotation: number }
  | { type: 'canvasItemScaled'; itemId: string; scale: number }
  | { type: 'noOpToFrontend' };

export interface CustomSocket extends Socket {
  sessionId?: string;
}
