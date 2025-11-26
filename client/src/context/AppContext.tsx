import React, { createContext, useContext, useState, useEffect, ReactNode, useDebugValue, useReducer } from 'react';
import { Socket } from 'socket.io-client';
import { FrontendModel } from '../types';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';
import useLocalStorage from '../utils/useLocalStorage';
import Guest from '../../../server/model/guest';
import Sticker from '../../../server/model/sticker';
import canvasReducer from '../types/canvas';

const BACKEND_URL = process.env.REACT_APP_SOCKET_URL || `http://${window.location.hostname}:3001`;

interface AppContextType {
  request: (apiUrl: string, init?: RequestInit) => Promise<Response>;
  model: FrontendModel;
  guestInfo: Guest | undefined;
  setModel: React.Dispatch<React.SetStateAction<FrontendModel>>;
  updateModel: (updater: (prev: FrontendModel) => FrontendModel) => void;
  canvas: Sticker[];
  setCanvas: (items: Sticker[]) => void;
  clearCanvas: () => void;
  sendToBackend: <K extends keyof ClientToServerEvents>(msg: K, ...args: Parameters<ClientToServerEvents[K]>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export function AppProvider({ children, socket }: AppProviderProps): JSX.Element {
  const [model, setModel] = useState<FrontendModel>({
    coupleNames: ['Thomas Steinke', 'Liz Petersen'],
    weddingDate: 'August 22, 2026',
    venue: 'Ampitheatre of the Redwoods',
    sessionName: '',
    isAuthenticated: false,
    rsvpStep: 'enteringName',
    rsvpName: '',
    rsvpAttending: 'attending',
    rsvpPlusOneName: '',
    rsvpPlusOneAttending: 'attending',
    rsvpSubmitted: false,
    rsvpCount: 0,
    adminPasswordInput: '',
    adminLoginError: false,
    adminGuestList: [],
    adminEditingGuest: null,
    adminFormName: '',
    adminFormEmail: '',
    adminFormPlusOne: false,
    selectedSticker: '❤️',
    textInput: '',
    stickerRotation: 0,
    stickerScale: 1.0,
  });

  const request = (apiUrl: string, init?: RequestInit) => fetch(BACKEND_URL + '/api' + apiUrl, init);

  const [canvas2, modifyCanvas] = useReducer(canvasReducer, [])

  const [canvas, setCanvas] = useState<Sticker[]>([]);
  const [myName, setMyName] = useLocalStorage<string>('guestName');
  const [guestInfo, setGuestInfo] = useState<Guest>();

  useEffect(() => {
    if (socket && myName) {
      socket.emitWithAck('setIdentity', myName).then(info => {
        setGuestInfo(info);
      })
    }
  }, [socket, myName])

  useEffect(() => {
    if (!socket) { return; }

    // TODO typescript makes templates harder than C++
    const listeners = [] as any[];
    const listen = <Ev extends keyof ServerToClientEvents>(ev: Ev, listener: ServerToClientEvents[Ev]) => {
      socket.on(ev, listener as any);
      listeners.push([ev, listener]);
    };

    listen('stickerPlaced', item => {
      modifyCanvas({ type: 'add', item });
    });

    listen('stickerMoved', item => {
      modifyCanvas({ type: 'replace', item });
    })

    return () => {
      if (socket) {
        for (const [ev, listener] of listeners) {
          socket.off(ev, listener);
        }
      }
    };
  }, [socket]);

  const sendToBackend = <K extends keyof ClientToServerEvents>(msg: K, ...args: Parameters<ClientToServerEvents[K]>) => {
    if (socket) {
      socket.emit(msg, ...args);
    }
  }

  useEffect(() => {
    request('/canvas').then(async response => {
      const items = await response.json();
      setCanvas(items);
    })
  }, []);
  const clearCanvas = () => { };//socket?.emit('clearCanvas');

  const updateModel = (updater: (prev: FrontendModel) => FrontendModel): void => {
    setModel(updater);
  };

  return (
    <AppContext.Provider value={{
      request,
      model,
      guestInfo,
      setModel,
      updateModel,
      sendToBackend,
      canvas,
      setCanvas,
      clearCanvas
    }}>
      {children}
    </AppContext.Provider>
  );
}
