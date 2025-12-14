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
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || `http://${window.location.hostname}:3001`;

function App(): JSX.Element {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    try {
      const socket = io(SOCKET_URL);
      socket.on('connect', () => {
        setSocket(socket);
      });

      socket.on('disconnect', () => {
        setSocket(null);
      });

      return () => {
        socket.close();
      };
    }
    catch (e) {
      console.log(e);
    }
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
        <React.StrictMode>
          <Header />
          <NavigationBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rsvp" element={<RsvpPage />} />
            <Route path="/travel" element={<TravelPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/canvas" element={<CanvasPage />} />
          </Routes>
          <Footer />
        </React.StrictMode>
      </AppProvider>
    </Router>
  );
}

export default App;
