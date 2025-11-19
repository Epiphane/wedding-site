import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import HomePage from './pages/HomePage';
import RsvpPage from './pages/RsvpPage';
import TravelPage from './pages/TravelPage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import CanvasPage from './pages/CanvasPage';
import { AppProvider } from './context/AppContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || `http://${window.location.hostname}:3001`;

function App(): JSX.Element {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (!socket) {
    return <div>Connecting...</div>;
  }

  return (
    <Router
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}>
      <AppProvider socket={socket}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rsvp" element={<RsvpPage />} />
          <Route path="/travel" element={<TravelPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/canvas" element={<CanvasPage />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;
