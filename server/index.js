const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (similar to Elm Dict)
let guests = new Map();
let rsvps = new Map();
let sessions = new Map();
let canvasItems = [];

// Initialize with default guest
guests.set('thomas steinke', {
  name: 'Thomas Steinke',
  email: 'exyphnos@gmail.com',
  plusOne: true
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'thomas';

// Get or create session
function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { name: '', isAdmin: false });
  }
  return sessions.get(sessionId);
}

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const sessionId = socket.id;
  
  console.log(`Client connected: ${sessionId}`);
  
  // Send initial data
  const session = getSession(sessionId);
  socket.emit('initialBackend', {
    sessionInfo: session,
    canvasItems: canvasItems
  });

  // Handle messages from frontend
  socket.on('toBackend', (msg) => {
    handleBackendMessage(socket, sessionId, msg);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${sessionId}`);
    sessions.delete(sessionId);
  });
});

function handleBackendMessage(socket, sessionId, msg) {
  switch (msg.type) {
    case 'lookupGuestByName':
      {
        const normalizedName = msg.name.toLowerCase().trim();
        const guest = guests.get(normalizedName);
        if (guest) {
          socket.emit('toFrontend', { type: 'guestFound', guest });
        } else {
          socket.emit('toFrontend', { type: 'guestNotFoundResponse' });
        }
        break;
      }

    case 'submitRsvpToBackend':
      {
        const rsvp = msg.rsvp;
        rsvps.set(rsvp.email, rsvp);
        socket.emit('toFrontend', {
          type: 'rsvpSubmitted',
          count: rsvps.size
        });
        break;
      }

    case 'getBackendModel':
      {
        const session = getSession(sessionId);
        socket.emit('toFrontend', {
          type: 'initialBackend',
          sessionInfo: session,
          canvasItems: canvasItems
        });
        break;
      }

    case 'adminLogin':
      {
        if (msg.password === ADMIN_PASSWORD) {
          const prevSession = getSession(sessionId);
          sessions.set(sessionId, { ...prevSession, isAdmin: true });
          socket.emit('toFrontend', { type: 'adminLoginSuccess' });
        } else {
          socket.emit('toFrontend', { type: 'adminLoginFailed' });
        }
        break;
      }

    case 'logoutBackend':
      {
        sessions.delete(sessionId);
        break;
      }

    case 'getGuestList':
      {
        const guestList = Array.from(guests.values());
        socket.emit('toFrontend', {
          type: 'guestListReceived',
          guests: guestList
        });
        break;
      }

    case 'addOrUpdateGuest':
      {
        const guest = msg.guest;
        const normalizedName = guest.name.toLowerCase().trim();
        guests.set(normalizedName, guest);
        socket.emit('toFrontend', { type: 'guestSaved' });
        break;
      }

    case 'deleteGuestByEmail':
      {
        const email = msg.email;
        for (const [key, guest] of guests.entries()) {
          if (guest.email === email) {
            guests.delete(key);
            break;
          }
        }
        socket.emit('toFrontend', { type: 'guestDeleted' });
        break;
      }

    case 'getCanvas':
      {
        socket.emit('toFrontend', {
          type: 'canvasReceived',
          canvasItems: canvasItems
        });
        break;
      }

    case 'placeCanvasItem':
      {
        const item = msg.item;
        canvasItems.push(item);
        io.emit('toFrontend', {
          type: 'canvasItemPlaced',
          item: item
        });
        break;
      }

    case 'updateCanvasItemPosition':
      {
        const { itemId, x, y } = msg;
        canvasItems = canvasItems.map(item =>
          item.id === itemId ? { ...item, x, y } : item
        );
        io.emit('toFrontend', {
          type: 'canvasItemMoved',
          itemId,
          x,
          y
        });
        break;
      }

    case 'updateCanvasItemRotation':
      {
        const { itemId, rotation } = msg;
        canvasItems = canvasItems.map(item =>
          item.id === itemId ? { ...item, rotation } : item
        );
        io.emit('toFrontend', {
          type: 'canvasItemRotated',
          itemId,
          rotation
        });
        break;
      }

    case 'updateCanvasItemScale':
      {
        const { itemId, scale } = msg;
        canvasItems = canvasItems.map(item =>
          item.id === itemId ? { ...item, scale } : item
        );
        io.emit('toFrontend', {
          type: 'canvasItemScaled',
          itemId,
          scale
        });
        break;
      }

    default:
      console.log('Unknown message type:', msg.type);
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
