export type AttendanceStatus = 'attending' | 'notAttending';

export type RsvpStep = 'enteringName' | 'guestConfirmed' | 'guestNotFound';

export type Route = 'HomePage' | 'RsvpPage' | 'TravelPage' | 'SchedulePage' | 'AdminPage' | 'CanvasPage';

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
  rsvpStep: RsvpStep;
  rsvpName: string;
  rsvpAttending: AttendanceStatus;
  rsvpPlusOneName: string;
  rsvpPlusOneAttending: AttendanceStatus;
  rsvpSubmitted: boolean;
  rsvpCount: number;
  adminPasswordInput: string;
  adminLoginError: boolean;
  adminFormName: string;
  adminFormEmail: string;
  adminFormPlusOne: boolean;
  selectedSticker: string;
  textInput: string;
  stickerRotation: number;
  stickerScale: number;
}
