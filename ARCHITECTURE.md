# Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                        │
│                    - Game UI & WebSocket Client                     │
└──────────────────────┬─────────────────────┬─────────────────────────┘
                       │ REST API (Auth)     │ WebSocket
                       │                     │
        ┌──────────────▼──────┐  ┌───────────▼───────────┐
        │ Spring Boot Backend  │  │  Express Game Service │
        │ - Authentication    │  │  - Real-time Events   │
        │ - Campaign CRUD     │  │  - Game Sessions      │
        │ - User Management   │  │  - Event Streaming    │
        └──────────┬─────────┘  └─────────┬──────────────┘
                   │                       │
        ┌──────────▼──────────────────────▼─────────┐
        │      MongoDB (Separate Instances)         │
        │  - Spring Boot DB (campaigns, users)      │
        │  - Game Service DB (sessions, events)     │
        └─────────────────────────────────────────┘
```

## Project Structure

### `/src/config`
Handles application configuration and initialization.

**Files:**
- `environment.js` - Environment variables and config management
- `database.js` - MongoDB connection setup
- `cors.js` - CORS configuration

### `/src/models`
MongoDB schemas using Mongoose.

**Files:**
- `GameSession.js` - Game session model (stores active game state)
- `GameEvent.js` - Game events model (logs all events)
- `ChatMessage.js` - Chat messages model
- `DiceRoll.js` - Dice rolls model

**Relationships:**
```
GameSession
  ├── playerIds: [String]
  ├── currentZone: String
  ├── gameState: Object
  ├── playersProgress: Object
  └── availableCharacters: Object

GameEvent
  ├── gameSessionId → GameSession
  ├── type: enum (chat, dice-roll, zone-update, character-update, level-up)
  └── data: Object (event-specific data)

ChatMessage
  ├── gameSessionId → GameSession
  ├── senderId: String
  └── messageContent: String

DiceRoll
  ├── gameSessionId → GameSession
  ├── senderId: String
  ├── expression: String (validated)
  └── result: Number
```

### `/src/services`
Business logic layer for game operations.

**Files:**
- `AuthService.js` - Token validation with Spring Boot
- `GameSessionService.js` - Game session CRUD and management
- `GameEventService.js` - Event recording and retrieval

**Key Responsibilities:**
- Database operations
- Business logic validation
- Spring Boot integration for authentication
- Event processing and storage

### `/src/middleware`
HTTP request processing pipeline.

**Files:**
- `authenticate.js` - JWT validation middleware
- `errorHandler.js` - Global error handling

### `/src/controllers`
HTTP request handlers following RESTful conventions.

**Files:**
- `gameSessionController.js` - Game session CRUD endpoints
- `gameSessionRoutes.js` - Route definitions

### `/src/websocket`
Real-time event handling via WebSocket (Socket.IO).

**Structure:**
```
websocket/
├── handlers/
│   └── gameEventHandlers.js - WebSocket event handlers
└── socketManager.js - Socket.IO server setup & event routing
```

**Handler Methods:**
- `handleChatMessage()` - Process and broadcast chat
- `handleZoneUpdate()` - Update current zone
- `handleDiceRoll()` - Roll dice and broadcast result
- `handleCharacterUpdate()` - Update character state
- `handleLevelUp()` - Level up character
- `handlePlayerJoin()` - Add player to session
- `handlePlayerLeave()` - Remove player from session

### `/src/utils`
Utility functions and constants.

**Files:**
- `logger.js` - Logging utility
- `constants.js` - Application constants
- `errorHandler.js` - Custom error classes

## Data Flow

### Authentication Flow
```
1. Client logs in with Spring Boot
   → Spring Boot returns JWT token

2. Client connects to WebSocket with token
   → Game Service validates token with Spring Boot

3. Spring Boot confirms validity
   → Client is authenticated and receives 'auth-success'
```

### Game Event Flow
```
1. Player sends event (e.g., chat-message)
   ↓
2. Event validated by handler (gameEventHandlers.js)
   ↓
3. Event saved to MongoDB (GameEvent collection)
   ↓
4. Session state updated (GameSession collection)
   ↓
5. Event broadcasted to other players in session
   ↓
6. All clients receive event in real-time
```

### Message Broadcast Flow
```
Client 1 emits message
    ↓
Socket event listener (socketManager.js)
    ↓
GameEventHandlers.handleChatMessage()
    ↓
Save to DB + Broadcast
    ↓
socket.to(`game-session-${sessionId}`).emit('chat-message', data)
    ↓
All clients in room receive message
```

## Separation of Concerns

### Controllers (HTTP)
- Handle REST API requests
- Validate input from request body/params
- Call appropriate services
- Return formatted responses

### Services (Business Logic)
- Execute core business logic
- Interact with database via models
- Coordinate between different models
- Handle validation and error cases

### Models (Data)
- Define MongoDB schema
- Enforce data validation
- Provide database interface

### WebSocket Handlers
- Receive WebSocket events
- Validate event data
- Call services for business logic
- Broadcast results to connected clients

### Middleware
- Authenticate HTTP requests
- Handle errors globally
- Log requests/responses

## Authentication Architecture

```
┌──────────────────────┐
│   Frontend App       │
│   (Next.js)          │
└──────────┬───────────┘
           │ Login request
           ▼
┌──────────────────────────┐
│  Spring Boot Backend     │
│  (JWT Generation)        │
└──────────┬───────────────┘
           │ Returns JWT
           ▼
┌──────────────────────────┐
│   Frontend App           │
│   (Stores JWT)           │
└──────────┬───────────────┘
           │ WebSocket + Token
           ▼
┌──────────────────────────────┐
│   Express Game Service       │
│   1. Extract token           │
└──────────┬───────────────────┘
           │ Validate token
           ▼
┌──────────────────────────────┐
│   Spring Boot Backend        │
│   (Token Validation)         │
└──────────┬───────────────────┘
           │ Valid/Invalid
           ▼
┌──────────────────────────────┐
│   Express Game Service       │
│   2. Authenticate user       │
│   3. Allow/Deny connection   │
└──────────────────────────────┘
```

## Database Isolation

### Spring Boot MongoDB (dnddb)
- Campaigns
- Users
- Characters (templates)
- Game templates

### Game Service MongoDB (dnd_game_service)
- Active game sessions
- Game events (chat, rolls, etc.)
- Chat messages
- Dice rolls
- Player progress

**Rationale:**
- Complete isolation between services
- Independent scaling
- Each service owns its data
- Easy backup/restore per service
- Clear data ownership

## Scalability Considerations

1. **WebSocket Scaling:**
   - Socket.IO with Redis adapter (future enhancement)
   - Load balancing across multiple game service instances

2. **Database Scaling:**
   - MongoDB replication sets
   - Separate databases prevent blocking

3. **Session Management:**
   - In-memory player tracking (can move to Redis)
   - Session timeout and cleanup

4. **Event Storage:**
   - Archive old events to separate collection
   - Implement event retention policy

## Error Handling Strategy

**HTTP Errors:**
- Input validation → 400 Bad Request
- Authentication failed → 401 Unauthorized
- Resource not found → 404 Not Found
- Business logic violation → 409 Conflict
- Server error → 500 Internal Server Error

**WebSocket Errors:**
- Emit 'error' event to client
- Log error for debugging
- Continue accepting other events from same client
- Graceful degradation

**Database Errors:**
- Retry logic for transient errors
- Log and alert on persistent errors
- Fallback responses where applicable
