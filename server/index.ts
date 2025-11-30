import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { DataSource } from "typeorm";
import { development } from './db-settings';
import GuestRouter from './routes';
import Guest from './model/guest';
import RSVP from './model/rsvp';
import Sticker from './model/sticker';
import DataSeeder from './seed/seed';
import cors from '@koa/cors';
import { ClientToServerEvents, ServerToClientEvents, SocketData, StickerProps } from '../shared/types';
import GuestController from './controller/guest';

dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'thomas';

const AppDataSource = new DataSource({
  ...development,
  entities: [Guest, RSVP, Sticker],
})

AppDataSource.initialize()
  .then(async connection => {
    const numGuests = await Guest.count();
    if (numGuests === 0) {
      await new DataSeeder().run(connection);
    }

    // connection.setOptions({ logging: ['query'] })

    const app = new Koa()
    app.use(cors())
    app.use(bodyParser())
    app.use(GuestRouter.routes()).use(GuestRouter.allowedMethods());

    const server = http.createServer(app.callback());
    const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Socket.io connection handling
    io.on('connection', (socket) => {
      const sessionId = socket.id;

      console.log(`Client connected: ${sessionId}`);

      // Handle messages from frontend
      // socket.on('toBackend', (msg: ToBackend) => {
      //   handleBackendMessage(socket, sessionId, msg);
      // });

      socket.on('setIdentity', async (name, callback) => {
        const guest = await Guest.findByName(name);
        if (guest) {
          socket.data.guestId = guest.id;
          callback(guest);
        }
      })

      socket.on('placeSticker', async (msg: Partial<StickerProps>) => {
        if (!socket.data.guestId) {
          socket.emit('error', 'Not logged in');
          return;
        }

        const sticker = await GuestController.addSticker(socket.data.guestId, msg);
        socket.broadcast.emit('stickerPlaced', sticker);
      })

      socket.on('updateSticker', async (msg: Partial<StickerProps>) => {
        if (socket.data.guestId) {
          const newSticker = await GuestController.updateSticker(socket.data.guestId, msg);
          socket.broadcast.emit('stickerMoved', newSticker);
        }
      })

      // socket.on('clearCanvas', () => {
      //   canvasItems = [];
      //   socket.emit('canvasItems', canvasItems);
      // });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${sessionId}`);
      });
    });

    /*
    
    // In-memory storage (similar to Elm Dict)
    const guests = new Map<string, Guest>();
    const rsvps = new Map<string, RsvpResponse>();
    let canvasItems: CanvasItem[] = [];
    
    // Initialize with default guest
    // guests.set('thomas steinke', {
    //   name: 'Thomas Steinke',
    //   email: 'exyphnos@gmail.com',
    //   plusOne: true
    // });
    
    
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
  })
  .catch(error => console.log("ERROR: ", error));
