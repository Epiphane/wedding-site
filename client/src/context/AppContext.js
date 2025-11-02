import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children, socket }) {
  const [model, setModel] = useState({
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
    const handleToFrontend = (msg) => {
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

        case 'canvasItemMoved':
          setModel(prev => ({
            ...prev,
            canvasItems: prev.canvasItems.map(item =>
              item.id === msg.itemId ? { ...item, x: msg.x, y: msg.y } : item
            )
          }));
          break;

        case 'canvasItemRotated':
          setModel(prev => ({
            ...prev,
            canvasItems: prev.canvasItems.map(item =>
              item.id === msg.itemId ? { ...item, rotation: msg.rotation } : item
            )
          }));
          break;

        case 'canvasItemScaled':
          setModel(prev => ({
            ...prev,
            canvasItems: prev.canvasItems.map(item =>
              item.id === msg.itemId ? { ...item, scale: msg.scale } : item
            )
          }));
          break;

        default:
          console.log('Unknown message type:', msg.type);
      }
    };

    socket.on('toFrontend', handleToFrontend);

    return () => {
      socket.off('toFrontend', handleToFrontend);
    };
  }, [socket]);

  const sendToBackend = (msg) => {
    if (socket) {
      socket.emit('toBackend', msg);
    }
  };

  const updateModel = (updater) => {
    setModel(updater);
  };

  return (
    <AppContext.Provider value={{ model, setModel, updateModel, sendToBackend }}>
      {children}
    </AppContext.Provider>
  );
}
