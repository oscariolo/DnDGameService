# WebSocket Documentation

## Connection

### Authentication
To connect to the WebSocket server, clients must authenticate after establishing the connection:

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    userId: 'user-id',
  },
  headers: {
    'Authorization': 'Bearer <token>',
  },
  transports: ['websocket', 'polling'],
});

// After connection, authenticate
socket.emit('authenticate', {
  token: '<jwt-token>',
  userId: '<user-id>',
  gameSessionId: '<session-id>',
});

socket.on('auth-success', (data) => {
  console.log('Authenticated successfully', data);
});

socket.on('auth-error', (error) => {
  console.error('Authentication failed', error);
});
```

## Events

### Client -> Server Events

#### Chat Message
```javascript
socket.emit('chat-message', {
  messageContent: 'Hello everyone!'
});

socket.on('chat-message-sent', (data) => {
  console.log('Message sent:', data);
});
```

**Response:**
```json
{
  "senderId": "user-id",
  "messageContent": "Hello everyone!",
  "timestamp": "2024-01-21T10:00:00Z"
}
```

#### Zone Update
```javascript
socket.emit('zone-update', {
  zoneName: 'Dark Dungeon',
  description: 'A scary underground chamber',
  imgUrl: 'https://example.com/dungeon.jpg'
});

socket.on('zone-updated', (data) => {
  console.log('Zone updated:', data);
});
```

**Response:**
```json
{
  "zoneName": "Dark Dungeon",
  "description": "A scary underground chamber",
  "imgUrl": "https://example.com/dungeon.jpg",
  "timestamp": "2024-01-21T10:00:00Z"
}
```

#### Dice Roll
```javascript
socket.emit('dice-roll', {
  expression: '1d20+3'
});

socket.on('dice-rolled', (data) => {
  console.log('Dice roll result:', data);
});
```

**Response:**
```json
{
  "senderId": "user-id",
  "expression": "1d20+3",
  "result": 18,
  "timestamp": "2024-01-21T10:00:00Z"
}
```

**Supported expressions:**
- Simple: `1d20`, `2d6`, `3d8`
- With modifiers: `1d20+5`, `2d6-1`, `1d20+2d4-1`

#### Character Update
```javascript
socket.emit('character-update', {
  playerId: 'player-id',
  characterId: 'character-id',
  attributes: {
    health: 45,
    mana: 30
  },
  position: {
    x: 100,
    y: 200
  }
});

socket.on('character-updated', (data) => {
  console.log('Character updated:', data);
});
```

#### Level Up
```javascript
socket.emit('level-up', {
  playerId: 'player-id',
  attributeLevelUp: {
    strength: 1,
    constitution: 1
  }
});

socket.on('level-up-success', (data) => {
  console.log('Leveled up:', data);
});
```

#### Player Join
```javascript
socket.emit('player-join', {
  playerId: 'player-id'
});

socket.on('join-success', (data) => {
  console.log('Joined session:', data);
});
```

#### Player Leave
```javascript
socket.emit('player-leave');

// Server will emit 'player-left' to other clients
```

#### Get Session State
```javascript
socket.emit('get-session-state');

socket.on('session-state-requested', (data) => {
  console.log('Session state:', data);
});
```

### Server -> Client Events

#### Chat Message (Broadcast)
Sent to all clients in the room when a player sends a chat message.

```javascript
socket.on('chat-message', (data) => {
  console.log(`${data.senderId}: ${data.messageContent}`);
});
```

#### Zone Update (Broadcast)
Sent to all clients when the zone is updated.

```javascript
socket.on('zone-update', (data) => {
  console.log('Zone changed to:', data.zoneName);
});
```

#### Dice Roll (Broadcast)
Sent to all clients when a dice roll is made.

```javascript
socket.on('dice-roll', (data) => {
  console.log(`${data.senderId} rolled ${data.expression} = ${data.result}`);
});
```

#### Character Update (Broadcast)
```javascript
socket.on('character-update', (data) => {
  console.log('Character updated:', data);
});
```

#### Level Up (Broadcast)
```javascript
socket.on('level-up', (data) => {
  console.log(`${data.playerId} leveled up!`, data.attributeLevelUp);
});
```

#### Player Joined (Broadcast)
```javascript
socket.on('player-joined', (data) => {
  console.log(`${data.playerId} joined the session`);
});
```

#### Player Left (Broadcast)
```javascript
socket.on('player-left', (data) => {
  console.log(`${data.playerId} left the session`);
});
```

#### Player Disconnected
```javascript
socket.on('player-disconnected', (data) => {
  console.log(`${data.userId} disconnected`);
});
```

#### Error
```javascript
socket.on('error', (error) => {
  console.error('Error:', error.message);
});
```

## Complete Example

```javascript
import io from 'socket.io-client';

// Get token from Spring Boot authentication
const token = await getTokenFromSpringBoot();
const userId = getCurrentUserId();
const gameSessionId = 'session-123';

// Connect to game service
const socket = io('http://localhost:3001', {
  auth: { userId },
  headers: { 'Authorization': `Bearer ${token}` },
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected to game service');
  
  // Authenticate with game session
  socket.emit('authenticate', {
    token,
    userId,
    gameSessionId,
  });
});

// Listen for successful authentication
socket.on('auth-success', () => {
  console.log('Authenticated successfully');
  
  // Join the game session
  socket.emit('player-join', { playerId: userId });
});

// Listen for incoming events
socket.on('chat-message', (data) => {
  console.log(`${data.senderId}: ${data.messageContent}`);
});

socket.on('dice-roll', (data) => {
  console.log(`${data.senderId} rolled ${data.expression} = ${data.result}`);
});

socket.on('zone-update', (data) => {
  console.log('New zone:', data.zoneName);
});

// Send a chat message
function sendMessage(messageContent) {
  socket.emit('chat-message', { messageContent });
}

// Roll dice
function rollDice(expression) {
  socket.emit('dice-roll', { expression });
}

// Leave session
function leaveSession() {
  socket.emit('player-leave');
  socket.disconnect();
}
```
