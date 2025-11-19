export interface Guest {
  name: string;
  email: string;
  plusOne: boolean;
}

export interface SessionInfo {
  name: string;
  isAdmin: boolean;
}

export type AttendanceStatus = 'attending' | 'notAttending';

export type RsvpStep = 'enteringName' | 'guestConfirmed' | 'guestNotFound';

export type Route = 'HomePage' | 'RsvpPage' | 'TravelPage' | 'SchedulePage' | 'AdminPage' | 'CanvasPage';

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

export interface RsvpResponse {
  guestName: string;
  email: string;
  attending: AttendanceStatus;
  plusOneName: string | null;
  plusOneAttending: AttendanceStatus | null;
}

export interface FrontendModel {
  coupleNames: [string, string];
  weddingDate: string;
  venue: string;
  sessionName: string;
  isAuthenticated: boolean;
  rsvpStep: RsvpStep;
  rsvpName: string;
  rsvpAttending: AttendanceStatus;
  rsvpPlusOneName: string;
  rsvpPlusOneAttending: AttendanceStatus;
  rsvpSubmitted: boolean;
  rsvpCount: number;
  adminPasswordInput: string;
  adminLoginError: boolean;
  adminGuestList: Guest[];
  adminEditingGuest: Guest | null;
  adminFormName: string;
  adminFormEmail: string;
  adminFormPlusOne: boolean;
  canvasItems: CanvasItem[];
  selectedSticker: string;
  textInput: string;
  stickerRotation: number;
  stickerScale: number;
  draggingItemId: string | null;
  canvas: {
    items: CanvasItem[];
    moveable: {
      state: string;
      activeItem: string | null;
    };
  };
  confirmedGuest?: Guest;
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
