import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { DataSource } from "typeorm";
import { development } from './db-settings';
import GuestRouter from './routes';
import Guest from './model/guest';
import RSVP from './model/rsvp';
import Sticker from './model/sticker';

dotenv.config();

const AppDataSource = new DataSource({
  ...development,
  entities: [Guest, RSVP, Sticker],
})

AppDataSource.initialize()
  .then(async connection => {
    connection.setOptions({ logging: ['query'] })

    const app = new Koa()
    app.use(bodyParser())
    app.use(GuestRouter.routes()).use(GuestRouter.allowedMethods());

    const server = http.createServer(app.callback());
    const io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => console.log("ERROR: ", error));

/*

// In-memory storage (similar to Elm Dict)
const guests = new Map<string, Guest>();
const rsvps = new Map<string, RsvpResponse>();
const sessions = new Map<string, SessionInfo>();
let canvasItems: CanvasItem[] = [];

// Initialize with default guest
// guests.set('thomas steinke', {
//   name: 'Thomas Steinke',
//   email: 'exyphnos@gmail.com',
//   plusOne: true
// });

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'thomas';

// Get or create session
function getSession(sessionId: string): SessionInfo {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { name: '', isAdmin: false });
  }
  return sessions.get(sessionId)!;
}

// Socket.io connection handling
io.on('connection', (socket: CustomSocket) => {
  const sessionId = socket.id;

  console.log(`Client connected: ${sessionId}`);

  // Send initial data
  const session = getSession(sessionId);
  socket.emit('toFrontend', {
    type: 'initialBackend',
    sessionInfo: session,
    canvasItems: canvasItems
  } as ToFrontend);

  // Handle messages from frontend
  socket.on('toBackend', (msg: ToBackend) => {
    handleBackendMessage(socket, sessionId, msg);
  });

  socket.on('clearCanvas', () => {
    canvasItems = [];
    socket.emit('canvasItems', canvasItems);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${sessionId}`);
    sessions.delete(sessionId);
  });
});

function handleBackendMessage(socket: CustomSocket, sessionId: string, msg: ToBackend): void {
  switch (msg.type) {
    case 'lookupGuestByName': {
      const normalizedName = msg.name.toLowerCase().trim();
      const guest = guests.get(normalizedName);
      if (guest) {
        socket.emit('toFrontend', { type: 'guestFound', guest } as ToFrontend);
      } else {
        socket.emit('toFrontend', { type: 'guestNotFoundResponse' } as ToFrontend);
      }
      break;
    }

    case 'submitRsvpToBackend': {
      const rsvp = msg.rsvp;
      rsvps.set(rsvp.email, rsvp);
      socket.emit('toFrontend', {
        type: 'rsvpSubmitted',
        count: rsvps.size
      } as ToFrontend);
      break;
    }

    case 'getBackendModel': {
      const session = getSession(sessionId);
      socket.emit('toFrontend', {
        type: 'initialBackend',
        sessionInfo: session,
        canvasItems: canvasItems
      } as ToFrontend);
      break;
    }

    case 'adminLogin': {
      if (msg.password === ADMIN_PASSWORD) {
        const prevSession = getSession(sessionId);
        sessions.set(sessionId, { ...prevSession, isAdmin: true });
        socket.emit('toFrontend', { type: 'adminLoginSuccess' } as ToFrontend);
      } else {
        socket.emit('toFrontend', { type: 'adminLoginFailed' } as ToFrontend);
      }
      break;
    }

    case 'logoutBackend': {
      sessions.delete(sessionId);
      break;
    }

    case 'getGuestList': {
      const guestList = Array.from(guests.values());
      socket.emit('toFrontend', {
        type: 'guestListReceived',
        guests: guestList
      } as ToFrontend);
      break;
    }

    case 'addOrUpdateGuest': {
      const guest = msg.guest;
      const normalizedName = guest.name.toLowerCase().trim();
      guests.set(normalizedName, guest);
      socket.emit('toFrontend', { type: 'guestSaved' } as ToFrontend);
      break;
    }

    case 'deleteGuestByEmail': {
      const email = msg.email;
      for (const [key, guest] of guests.entries()) {
        // if (guest.email === email) {
        //   guests.delete(key);
        //   break;
        // }
      }
      socket.emit('toFrontend', { type: 'guestDeleted' } as ToFrontend);
      break;
    }

    case 'getCanvas': {
      socket.emit('canvasItems', canvasItems);
      break;
    }

    case 'placeCanvasItem': {
      const item = msg.item;
      canvasItems.push(item);
      io.emit('toFrontend', {
        type: 'canvasItemPlaced',
        item
      } as ToFrontend);
      break;
    }

    case 'updateCanvasItem': {
      const item = msg.item;
      canvasItems = canvasItems.map(prev =>
        prev.id === item.id ? { ...prev, ...item } : prev
      );
      io.emit('toFrontend', {
        type: 'canvasItemUpdated',
        item
      } as ToFrontend);
      break;
    }

    default:
      console.log('Unknown message type:', (msg as ToBackend).type);
  }
}

*/
