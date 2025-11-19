import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { FrontendModel, ToBackend, ToFrontend, CanvasItem } from '../types';

interface AppContextType {
  model: FrontendModel;
  setModel: React.Dispatch<React.SetStateAction<FrontendModel>>;
  updateModel: (updater: (prev: FrontendModel) => FrontendModel) => void;
  getCanvas: () => void;
  clearCanvas: () => void;
  sendToBackend: (msg: ToBackend) => void;
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
  socket: Socket;
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
    canvasItems: [],
    selectedSticker: '❤️',
    textInput: '',
    stickerRotation: 0,
    stickerScale: 1.0,
    draggingItemId: null,
    canvas: {
      items: [],
      moveable: { state: 'inactive', activeItem: null }
    }
  });

  useEffect(() => {
    if (!socket) return;

    // Send initial request
    socket.emit('toBackend', { type: 'getBackendModel' });

    // Handle messages from backend
    const handleToFrontend = (msg: ToFrontend) => {
      switch (msg.type) {
        case 'guestFound':
          setModel(prev => ({
            ...prev,
            rsvpStep: 'guestConfirmed',
            confirmedGuest: msg.guest
          }));
          break;

        case 'guestNotFoundResponse':
          setModel(prev => ({ ...prev, rsvpStep: 'guestNotFound' }));
          break;

        case 'initialBackend':
          setModel(prev => ({
            ...prev,
            sessionName: msg.sessionInfo.name,
            isAuthenticated: msg.sessionInfo.isAdmin,
            canvasItems: msg.canvasItems || []
          }));
          break;

        case 'rsvpSubmitted':
          setModel(prev => ({
            ...prev,
            rsvpSubmitted: true,
            rsvpCount: msg.count
          }));
          break;

        case 'guestListReceived':
          setModel(prev => ({ ...prev, adminGuestList: msg.guests }));
          break;

        case 'guestSaved':
          socket.emit('toBackend', { type: 'getGuestList' });
          break;

        case 'guestDeleted':
          socket.emit('toBackend', { type: 'getGuestList' });
          break;

        case 'adminLoginSuccess':
          setModel(prev => ({
            ...prev,
            isAuthenticated: true,
            adminPasswordInput: '',
            adminLoginError: false
          }));
          socket.emit('toBackend', { type: 'getGuestList' });
          break;

        case 'adminLoginFailed':
          setModel(prev => ({
            ...prev,
            isAuthenticated: false,
            adminLoginError: true
          }));
          break;

        case 'canvasReceived':
          setModel(prev => ({ ...prev, canvasItems: msg.canvasItems }));
          break;

        case 'canvasItemPlaced':
          setModel(prev => ({
            ...prev,
            canvasItems: [msg.item, ...prev.canvasItems]
          }));
          break;

        case 'canvasItemUpdated':
          setModel(prev => ({
            ...prev,
            canvasItems: prev.canvasItems.map(item =>
              item.id === msg.item.id ? { ...item, ...msg.item } : item
            )
          }));
          break;

        default:
          console.log('Unknown message type:', (msg as ToFrontend).type);
      }
    };

    const handleCanvasItems = (canvasItems: CanvasItem[]) => {
      setModel(prev => ({ ...prev, canvasItems }));
    }

    socket.on('toFrontend', handleToFrontend);
    socket.on('canvasItems', handleCanvasItems);

    return () => {
      socket.off('toFrontend', handleToFrontend);
      socket.off('canvasItems', handleCanvasItems);
    };
  }, [socket]);

  const sendToBackend = (msg: ToBackend): void => {
    if (socket) {
      socket.emit('toBackend', msg);
    }
  };

  const getCanvas = () => socket?.emit('getCanvas');

  const clearCanvas = () => socket?.emit('clearCanvas');

  const updateModel = (updater: (prev: FrontendModel) => FrontendModel): void => {
    setModel(updater);
  };

  return (
    <AppContext.Provider value={{ model, setModel, updateModel, sendToBackend, getCanvas, clearCanvas }}>
      {children}
    </AppContext.Provider>
  );
}
