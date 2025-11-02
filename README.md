# Wedding Site - Node.js Version

This is a wedding website converted from Elm/Lamdera to a Node.js application using Express and React.

## Features

- **Home Page**: Welcome page with wedding details
- **RSVP System**: Guest lookup and RSVP submission
- **Travel Information**: Accommodation and transportation details
- **Schedule**: Wedding timeline and events
- **Admin Panel**: Guest management and admin authentication
- **Canvas**: Interactive canvas for placing stickers and text
- **Real-time Updates**: WebSocket communication for live canvas updates

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.io
- **Frontend**: React, React Router
- **Communication**: WebSocket (Socket.io)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
cd ..
```

Or run both at once:
```bash
npm run install-all
```

### Configuration

Create a `.env` file in the root directory:

```
PORT=3001
CLIENT_URL=http://localhost:3000
ADMIN_PASSWORD=thomas
```

### Running the Application

#### Development Mode

Run both server and client in development mode:
```bash
npm run dev
```

Or run them separately:

**Terminal 1 - Server:**
```bash
npm run server
```

**Terminal 2 - Client:**
```bash
npm run client
```

#### Production Mode

1. Build the client:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Project Structure

```
wedding-site/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable components
│       ├── context/       # React context for state
│       └── pages/         # Page components
├── server/                # Express backend
│   └── index.js          # Server entry point
├── package.json          # Root package.json
└── README.md            # This file
```

## API Endpoints

### WebSocket Events

**Client to Server (`toBackend`):**
- `lookupGuestByName`: Look up a guest by name
- `submitRsvpToBackend`: Submit an RSVP
- `getBackendModel`: Get initial backend state
- `adminLogin`: Admin authentication
- `logoutBackend`: Logout admin
- `getGuestList`: Get all guests
- `addOrUpdateGuest`: Add or update a guest
- `deleteGuestByEmail`: Delete a guest
- `getCanvas`: Get canvas items
- `placeCanvasItem`: Place item on canvas
- `updateCanvasItemPosition`: Update item position
- `updateCanvasItemRotation`: Update item rotation
- `updateCanvasItemScale`: Update item scale

**Server to Client (`toFrontend`):**
- `guestFound`: Guest found response
- `guestNotFoundResponse`: Guest not found
- `initialBackend`: Initial backend data
- `rsvpSubmitted`: RSVP submission confirmation
- `adminLoginSuccess`: Admin login success
- `adminLoginFailed`: Admin login failure
- `guestListReceived`: Guest list data
- `guestSaved`: Guest save confirmation
- `guestDeleted`: Guest delete confirmation
- `canvasReceived`: Canvas items
- `canvasItemPlaced`: Canvas item placed broadcast
- `canvasItemMoved`: Canvas item moved broadcast
- `canvasItemRotated`: Canvas item rotated broadcast
- `canvasItemScaled`: Canvas item scaled broadcast

## Default Admin Credentials

- **Password**: `thomas` (can be changed in `.env`)

## Converting from Elm

This project was converted from an Elm/Lamdera application. Key differences:

1. **State Management**: Elm's pure functional model → React state and context
2. **Type Safety**: Elm's type system → JavaScript (can add TypeScript later)
3. **WebSocket**: Lamdera's built-in WebSocket → Socket.io
4. **Routing**: Elm navigation → React Router
5. **UI**: Elm HTML → React JSX

## Development Notes

- The backend uses in-memory storage (Map data structures) similar to Elm's Dict
- Canvas items are synchronized in real-time across all connected clients
- Admin authentication is session-based using Socket.io session IDs

## License

ISC
