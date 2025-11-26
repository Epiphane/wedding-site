import { Socket } from 'socket.io';
import Guest from './model/guest';

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

// export interface CanvasItem {
//   id: string;
//   owner: string;
//   itemType: CanvasItemType;
//   x: number;
//   y: number;
//   rotation: number;
//   scale: number;
// }

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
  | { type: 'updateCanvasItem'; item: CanvasItem }
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
  | { type: 'canvasItemUpdated'; item: CanvasItem }
  | { type: 'noOpToFrontend' };
