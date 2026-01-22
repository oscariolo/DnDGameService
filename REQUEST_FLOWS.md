# Request Flow Diagrams

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                               │
│                                                                           │
│  1. User logs in with credentials                                        │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │
                       │ POST /api/users/login
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT BACKEND                                  │
│                    (Port 8080)                                           │
│                                                                           │
│  - Validate credentials                                                  │
│  - Generate JWT token                                                    │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │
                       │ JWT Token + User Info
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                               │
│                                                                           │
│  2. Stores JWT in localStorage/sessionStorage                            │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
         │ GET /api/game-sessions     │ WebSocket + Token
         ▼                            ▼
┌──────────────────────────┐  ┌────────────────────────┐
│  Express Game Service    │  │  Express Game Service  │
│  (Port 3001)             │  │  (Port 3001)           │
│                          │  │                        │
│  1. Extract token        │  │  1. Extract token      │
│  2. Send to Spring Boot  │  │  2. Send to Spring Boot│
└──────────────┬───────────┘  └────────────┬───────────┘
               │                           │
               │ POST /api/auth/validate   │
               │        (token)            │
               ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT BACKEND                                  │
│                    Endpoint: /api/auth/validate-token                    │
│                                                                           │
│  - Verify JWT signature                                                  │
│  - Check expiration                                                      │
│  - Extract user info                                                     │
│  - Return valid/invalid                                                  │
└──────────────┬───────────────────────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │ Valid Token │ Invalid Token
        ▼             ▼
    Proceed      Return 401
```

## HTTP Request Flow (Create Game Session)

```
┌─────────────────────────────────────────────────────────────────────┐
│ CLIENT REQUEST                                                       │
│                                                                       │
│ POST /api/game-sessions                                              │
│ Headers:                                                             │
│   Authorization: Bearer <jwt-token>                                  │
│   X-User-ID: user-123                                                │
│   Content-Type: application/json                                     │
│                                                                       │
│ Body:                                                                │
│ {                                                                    │
│   "baseCampaignId": "campaign-123",                                  │
│   "dungeonMasterId": "dm-123",                                       │
│   "playerIds": ["p1", "p2"],                                         │
│   "currentZone": "Tavern"                                            │
│ }                                                                    │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Express Middleware                                                  │
│                                                                       │
│ 1. cors() - Check CORS headers                                      │
│ 2. express.json() - Parse JSON body                                 │
│ 3. authenticateRequest - Validate JWT                               │
└───────────────────────┬────────────────────────────────────────────┘
                        │ Token valid
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Route Handler                                                        │
│                                                                       │
│ gameSessionRoutes (POST /api/game-sessions)                         │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Controller                                                           │
│                                                                       │
│ gameSessionController.createGameSession()                           │
│ - Validate request data                                             │
│ - Check required fields                                             │
│ - Call service                                                      │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Service (Business Logic)                                            │
│                                                                       │
│ GameSessionService.createGameSession()                              │
│ - Create GameSession object                                         │
│ - Save to MongoDB                                                   │
│ - Return saved session                                              │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ MongoDB                                                              │
│                                                                       │
│ dnd_game_service.gamesessions collection                            │
│ - Insert document                                                   │
│ - Generate _id                                                      │
│ - Return document                                                   │
└───────────────────────┬────────────────────────────────────────────┘
                        │ Document + _id
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Response (201 Created)                                              │
│                                                                       │
│ {                                                                    │
│   "success": true,                                                  │
│   "message": "Game session created successfully",                   │
│   "data": {                                                          │
│     "_id": "507f1f77bcf86cd799439011",                              │
│     "baseCampaignId": "campaign-123",                                │
│     "dungeonMasterId": "dm-123",                                     │
│     "playerIds": ["p1", "p2"],                                       │
│     "currentZone": "Tavern",                                         │
│     "status": "active",                                              │
│     "createdAt": "2024-01-21T10:00:00Z",                             │
│     "updatedAt": "2024-01-21T10:00:00Z"                              │
│   }                                                                  │
│ }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## WebSocket Connection Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ CLIENT                                                               │
│                                                                       │
│ const socket = io('http://localhost:3001', {                       │
│   auth: { userId: 'user-123' },                                     │
│   headers: { 'Authorization': 'Bearer <token>' }                    │
│ });                                                                  │
│                                                                       │
│ socket.on('connect', () => {                                        │
│   socket.emit('authenticate', {                                     │
│     token: '<jwt-token>',                                            │
│     userId: 'user-123',                                              │
│     gameSessionId: 'session-123'                                     │
│   });                                                                │
│ });                                                                  │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        │ WebSocket connection + auth event
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Socket.IO Server                                                     │
│                                                                       │
│ socketManager.initializeSocket(io)                                  │
│ - io.on('connection', socket => {...})                              │
│ - socket.on('authenticate', data => {...})                          │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ handleAuthentication()                                              │
│                                                                       │
│ 1. Extract token from data                                           │
│ 2. Call AuthService.validateToken()                                 │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        │ POST /api/auth/validate-token (to Spring Boot)
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Spring Boot Backend                                                 │
│                                                                       │
│ - Verify JWT                                                         │
│ - Return user data                                                  │
└───────────────────────┬────────────────────────────────────────────┘
                        │ User data
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ handleAuthentication() [continued]                                  │
│                                                                       │
│ 3. Store userId in socket                                           │
│ 4. socket.join(`game-session-${sessionId}`)                        │
│ 5. registerEventListeners(socket, io)                               │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        │ socket.emit('auth-success', {...})
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CLIENT                                                               │
│                                                                       │
│ socket.on('auth-success', (data) => {                               │
│   console.log('Connected to game session!');                        │
│ });                                                                  │
│                                                                       │
│ Ready to send/receive game events                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Chat Message Event Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ CLIENT 1                                                          │
│                                                                    │
│ socket.emit('chat-message', {                                     │
│   messageContent: 'Hello, adventurers!'                           │
│ });                                                               │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ WebSocket event
              ▼
┌──────────────────────────────────────────────────────────────────┐
│ Socket.IO Server                                                 │
│                                                                    │
│ socket.on('chat-message', (data) => {                            │
│   GameEventHandlers.handleChatMessage(socket, sessionId, data);  │
│ });                                                              │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────────┐
│ GameEventHandlers.handleChatMessage()                            │
│                                                                    │
│ 1. Validate message content                                       │
│ 2. Get senderId from socket                                       │
│ 3. Call GameEventService.saveChatMessage()                        │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────────┐
│ GameEventService.saveChatMessage()                               │
│                                                                    │
│ 1. Create ChatMessage object                                      │
│ 2. Save to MongoDB                                               │
│ 3. Return saved message                                          │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ Message saved to DB
              ▼
┌──────────────────────────────────────────────────────────────────┐
│ GameEventHandlers.handleChatMessage() [continued]               │
│                                                                    │
│ Broadcast to all clients in room:                                │
│ socket.to(`game-session-${sessionId}`)                           │
│   .emit('chat-message', eventData);                              │
└─────────────┬───────────────────────────────────────────────────┘
              │
     ┌────────┴───────┬────────────┐
     │                │            │
     ▼                ▼            ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│CLIENT 2 │   │CLIENT 3 │   │CLIENT 4 │
│         │   │         │   │         │
│receives │   │receives │   │receives │
│message  │   │message  │   │message  │
└─────────┘   └─────────┘   └─────────┘

All clients in game-session-123 room receive the message event
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────┐
│ REQUEST                                                   │
│                                                           │
│ POST /api/game-sessions (missing required fields)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ MIDDLEWARE & ROUTES                                      │
│                                                           │
│ - Pass authentication                                    │
│ - Reach controller                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ CONTROLLER VALIDATION                                    │
│                                                           │
│ if (!baseCampaignId || !dungeonMasterId) {               │
│   return res.status(400).json({                          │
│     success: false,                                      │
│     message: 'Missing required fields'                   │
│   });                                                    │
│ }                                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ RESPONSE (400 Bad Request)                              │
│                                                           │
│ {                                                         │
│   "success": false,                                      │
│   "message": "Missing required fields: ..."             │
│ }                                                         │
└─────────────────────────────────────────────────────────┘
```

## Database Operation Flow

```
┌──────────────────────────────────────────────────────┐
│ SERVICE CALLS DB METHOD                              │
│                                                        │
│ const session = new GameSession(data);               │
│ await session.save();                                │
└────────────┬──────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│ MONGOOSE                                              │
│                                                        │
│ 1. Validate against schema                           │
│ 2. Process middleware                                │
│ 3. Prepare query                                     │
└────────────┬──────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│ MONGODB DRIVER                                        │
│                                                        │
│ 1. Send insert command                               │
│ 2. Execute in database                               │
│ 3. Generate _id                                      │
│ 4. Return result                                     │
└────────────┬──────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│ MONGOOSE CALLBACK                                     │
│                                                        │
│ 1. Return saved document                             │
│ 2. Include _id and timestamps                        │
└────────────┬──────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│ SERVICE                                               │
│                                                        │
│ return session; // with _id and all fields           │
└────────────┬──────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│ CONTROLLER                                            │
│                                                        │
│ Returns formatted response with session data         │
└──────────────────────────────────────────────────────┘
```
