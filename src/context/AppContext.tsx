import React, { createContext, useContext, useState, useEffect, ReactNode, useDebugValue, useReducer, JSX } from 'react';
import { Socket } from 'socket.io-client';
import { FrontendModel } from '../types';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';
import useLocalStorage from '../utils/useLocalStorage';
import Guest from '../../server/model/guest';
import Sticker from '../../server/model/sticker';
import canvasReducer, { CanvasAction, CanvasState } from '../types/canvas';

interface AppContextType {
  request: (apiUrl: string, init?: RequestInit) => Promise<Response>;
  isAuthenticated: boolean;
  setAdminPassword: (name: string) => Promise<void>;
  login: (name: string) => Promise<Guest>;
  logout: () => void;
  model: FrontendModel;
  guestInfo: Guest | undefined;
  setModel: React.Dispatch<React.SetStateAction<FrontendModel>>;
  updateModel: (updater: (prev: FrontendModel) => FrontendModel) => void;
  canvas: CanvasState;
  updateCanvas: (action: CanvasAction) => void;
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
    rsvpStep: 'enteringName',
    rsvpName: '',
    rsvpAttending: 'attending',
    rsvpPlusOneName: '',
    rsvpPlusOneAttending: 'attending',
    rsvpSubmitted: false,
    rsvpCount: 0,
    adminPasswordInput: '',
    adminLoginError: false,
    adminFormName: '',
    adminFormEmail: '',
    adminFormPlusOne: false,
    selectedSticker: '❤️',
    textInput: '',
    stickerRotation: 0,
    stickerScale: 1.0,
  });

  const [adminPassword, setAdminPassword] = useLocalStorage<string>('adminPassword');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(!!adminPassword);
  }, [adminPassword]);

  const request = (apiUrl: string, init?: RequestInit) => {
    if (adminPassword) {
      init = {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Basic ${btoa(`user:${adminPassword}`)}`,
        }
      }
    }
    const backendUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin;
    return fetch(backendUrl + '/api' + apiUrl, init);
  }

  const [canvas, updateCanvas] = useReducer(canvasReducer, [])
  const [myName, setMyName] = useLocalStorage<string>('guestName');
  const [guestInfo, setGuestInfo] = useState<Guest>();

  const testAdminPassword = (password: string): Promise<void> => {
    return request('/guests', { headers: { Authorization: `Basic ${btoa(`user:${password}`)}` } })
      .then(result => {
        if (result.status !== 200) {
          throw new Error(`Invalid password!`);
        }
        setAdminPassword(password);
      })
  };

  const login = (name: string): Promise<Guest> => {
    if (!socket) {
      return Promise.reject('socket unavailable');
    }
    return socket.emitWithAck('setIdentity', name).then(([info, err]) => {
      if (!info) {
        throw err;
      }

      setGuestInfo(info);
      setMyName(`${info.firstName} ${info.lastName}`);
      return info;
    })
  }

  const logout = () => {
    if (!socket) {
      return Promise.reject('socket unavailable');
    }
    setGuestInfo(undefined);
    setMyName(``);
    return socket.emitWithAck('setIdentity', '');
  }

  useEffect(() => {
    if (socket && myName) {
      login(myName);
    }
  }, [socket, myName]);

  useEffect(() => {
    if (!socket) { return; }

    // TODO typescript makes templates harder than C++
    const listeners = [] as any[];
    const listen = <Ev extends keyof ServerToClientEvents>(ev: Ev, listener: ServerToClientEvents[Ev]) => {
      socket.on(ev, listener as any);
      listeners.push([ev, listener]);
    };

    listen('stickerPlaced', item => {
      updateCanvas({ type: 'add', item });
    });

    listen('stickerMoved', item => {
      updateCanvas({ type: 'replace', item });
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
      updateCanvas({ type: 'set', items });
    })
  }, []);

  const updateModel = (updater: (prev: FrontendModel) => FrontendModel): void => {
    setModel(updater);
  };

  return (
    <AppContext.Provider value={{
      request,
      isAuthenticated,
      setAdminPassword: testAdminPassword,
      login,
      logout,
      model,
      guestInfo,
      setModel,
      updateModel,
      sendToBackend,
      canvas,
      updateCanvas,
    }}>
      {children}
    </AppContext.Provider>
  );
}
