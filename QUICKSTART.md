# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance running
- Spring Boot backend running on http://localhost:8080
- Frontend running on http://localhost:3000

## Setup

### 1. Install Dependencies

```bash
cd dndgameService
npm install
```

### 2. Environment Configuration

Create `.env` file from template:

```bash
cp .env.example .env
```

**Edit `.env` with your configuration:**

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB (Game Service)
MONGO_URI=mongodb://admin:adminpassword@localhost:27017/dnd_game_service?authSource=admin
MONGO_DB_NAME=dnd_game_service

# Spring Boot Backend (for token validation)
SPRINGBOOT_AUTH_URL=http://localhost:8080/api/auth/validate-token
SPRINGBOOT_URL=http://localhost:8080

# CORS
CORS_ORIGIN=http://localhost:3000

# WebSocket
WS_PING_INTERVAL=30000
WS_PING_TIMEOUT=5000

# Game Sessions
SESSION_TIMEOUT=3600000
MAX_PLAYERS_PER_SESSION=10

# Logging
LOG_LEVEL=debug
```

### 3. Database Setup

Ensure MongoDB is running with authentication:

```bash
# Example MongoDB setup (if using Docker)
docker run -d \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=adminpassword \
  -p 27017:27017 \
  mongo:latest
```

Create the game service database (MongoDB will create it automatically).

### 4. Start the Server

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

### 5. Verify Installation

Check health endpoint:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "message": "Game Service is running",
  "timestamp": "2024-01-21T10:00:00Z"
}
```

## Usage

### Creating a Game Session (HTTP)

```bash
curl -X POST http://localhost:3001/api/game-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-ID: user-123" \
  -d '{
    "baseCampaignId": "campaign-123",
    "dungeonMasterId": "dm-user-id",
    "playerIds": ["player1", "player2"],
    "currentZone": "Tavern"
  }'
```

### Connecting WebSocket Client (JavaScript)

```javascript
import io from 'socket.io-client';

// Connect to game service
const socket = io('http://localhost:3001', {
  auth: { userId: 'user-123' },
  headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' },
});

// Authenticate
socket.emit('authenticate', {
  token: 'YOUR_JWT_TOKEN',
  userId: 'user-123',
  gameSessionId: 'session-id-from-api',
});

// Listen for auth success
socket.on('auth-success', () => {
  console.log('Connected to game session!');
  
  // Send a chat message
  socket.emit('chat-message', {
    messageContent: 'Hello, adventurers!'
  });
});

// Listen for messages
socket.on('chat-message', (data) => {
  console.log(`${data.senderId}: ${data.messageContent}`);
});

// Roll dice
socket.emit('dice-roll', { expression: '1d20+3' });

// Listen for dice rolls
socket.on('dice-roll', (data) => {
  console.log(`${data.senderId} rolled ${data.expression} = ${data.result}`);
});
```

## Project Structure

```
dndgameService/
├── src/
│   ├── config/              # Configuration (database, env, cors)
│   ├── models/              # MongoDB schemas
│   ├── services/            # Business logic
│   ├── middleware/          # Express middleware
│   ├── controllers/         # HTTP handlers
│   ├── websocket/           # WebSocket handlers
│   ├── utils/               # Utilities & constants
│   └── server.js            # Server entry point
├── bin/
│   └── www.js               # CLI entry point
├── .env.example             # Environment template
├── package.json             # Dependencies
├── README.md                # Main documentation
├── API_DOCS.md              # HTTP API documentation
├── WEBSOCKET_DOCS.md        # WebSocket documentation
└── ARCHITECTURE.md          # Architecture details
```

## Common Commands

### Development
```bash
# Start with hot reload
npm run dev

# Start production
npm start

# Run tests (when available)
npm test
```

### Testing Endpoints

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Get Active Sessions (requires auth)
```bash
curl http://localhost:3001/api/game-sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-ID: user-123"
```

#### Create Session (requires auth)
```bash
curl -X POST http://localhost:3001/api/game-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-ID: user-123" \
  -d '{
    "baseCampaignId": "camp1",
    "dungeonMasterId": "dm1",
    "playerIds": ["p1", "p2"]
  }'
```

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection failed
```
**Solution:** Ensure MongoDB is running and credentials in `.env` are correct.

```bash
# Test MongoDB connection
mongosh "mongodb://admin:adminpassword@localhost:27017" --authenticationDatabase admin
```

### Token Validation Error
```
Error: Token validation failed
```
**Solution:** Ensure Spring Boot backend is running and `SPRINGBOOT_AUTH_URL` is correct.

### WebSocket Connection Failed
```
Socket connection timeout
```
**Solution:** Check that game service is running on the correct port and CORS is configured properly.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Change PORT in `.env` or kill process using port 3001:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

## Documentation

- [API Documentation](./API_DOCS.md) - REST endpoint reference
- [WebSocket Documentation](./WEBSOCKET_DOCS.md) - Real-time events reference
- [Architecture](./ARCHITECTURE.md) - System design details
- [README](./README.md) - General overview

## Support

For issues or questions, refer to the architecture documentation or check logs:

```bash
# Logs are printed to console in development
# In production, redirect to file:
npm start > logs.txt 2>&1
```

## Next Steps

1. ✅ Server is running
2. ✅ WebSocket working
3. Integrate with frontend
4. Configure CI/CD pipeline
5. Set up monitoring/logging
6. Performance testing
