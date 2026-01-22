# API Documentation

## Authentication

All HTTP endpoints require authentication via JWT token in the `Authorization` header and the user ID in the `X-User-ID` header.

```
Authorization: Bearer <token>
X-User-ID: <userId>
```

The token is validated with the Spring Boot backend at `SPRINGBOOT_AUTH_URL`.

## Endpoints

### Game Sessions

#### Create Game Session
```
POST /api/game-sessions
Content-Type: application/json
Authorization: Bearer <token>
X-User-ID: <userId>

{
  "baseCampaignId": "campaign123",
  "dungeonMasterId": "dm-user-id",
  "playerIds": ["player1", "player2"],
  "currentZone": "Tavern"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Game session created successfully",
  "data": {
    "_id": "session-id",
    "baseCampaignId": "campaign123",
    "dungeonMasterId": "dm-user-id",
    "playerIds": ["player1", "player2"],
    "currentZone": "Tavern",
    "status": "active",
    "createdAt": "2024-01-21T10:00:00Z",
    "updatedAt": "2024-01-21T10:00:00Z"
  }
}
```

#### Get Game Session
```
GET /api/game-sessions/:sessionId
Authorization: Bearer <token>
X-User-ID: <userId>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "session-id",
    "baseCampaignId": "campaign123",
    "dungeonMasterId": "dm-user-id",
    "playerIds": ["player1", "player2"],
    "currentZone": "Tavern",
    "status": "active",
    "createdAt": "2024-01-21T10:00:00Z",
    "updatedAt": "2024-01-21T10:00:00Z"
  }
}
```

#### Get All Active Sessions
```
GET /api/game-sessions
Authorization: Bearer <token>
X-User-ID: <userId>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { /* session object */ },
    { /* session object */ }
  ]
}
```

#### Update Game Session
```
PUT /api/game-sessions/:sessionId
Content-Type: application/json
Authorization: Bearer <token>
X-User-ID: <userId>

{
  "currentZone": "Dungeon",
  "gameState": { /* any game state data */ }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Game session updated successfully",
  "data": { /* updated session object */ }
}
```

#### End Game Session
```
DELETE /api/game-sessions/:sessionId
Authorization: Bearer <token>
X-User-ID: <userId>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Game session ended successfully",
  "data": { /* ended session object */ }
}
```

#### Get Sessions by Dungeon Master
```
GET /api/game-sessions/dm/:dmId
Authorization: Bearer <token>
X-User-ID: <userId>
```

#### Get Sessions by Player
```
GET /api/game-sessions/player/:playerId
Authorization: Bearer <token>
X-User-ID: <userId>
```

#### Add Player to Session
```
POST /api/game-sessions/:sessionId/players
Content-Type: application/json
Authorization: Bearer <token>
X-User-ID: <userId>

{
  "playerId": "new-player-id"
}
```

#### Remove Player from Session
```
DELETE /api/game-sessions/:sessionId/players/:playerId
Authorization: Bearer <token>
X-User-ID: <userId>
```

### Game Events

#### Get Session Events
```
GET /api/game-sessions/:sessionId/events?type=<eventType>&limit=50
Authorization: Bearer <token>
X-User-ID: <userId>
```

**Query Parameters:**
- `type` (optional): Filter by event type (chat, dice-roll, zone-update, character-update, level-up)
- `limit` (optional, default: 50): Maximum number of events to return

#### Get Chat Messages
```
GET /api/game-sessions/:sessionId/messages?limit=50
Authorization: Bearer <token>
X-User-ID: <userId>
```

#### Get Dice Rolls
```
GET /api/game-sessions/:sessionId/rolls?limit=50
Authorization: Bearer <token>
X-User-ID: <userId>
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: baseCampaignId, dungeonMasterId"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Missing authentication credentials"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Game session not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create game session",
  "error": "Error details"
}
```

## Health Check

```
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Game Service is running",
  "timestamp": "2024-01-21T10:00:00Z"
}
```
