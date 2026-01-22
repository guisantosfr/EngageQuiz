# Sessions Module - API Guide

## Overview

This guide describes the HTTP endpoints and WebSocket events for the quiz session flow, separated by client type: **Teacher (Host)** and **Student (Player)**.

---

## HTTP Endpoints

### Teacher (Host) Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sessions` | Create a new session |
| `GET` | `/sessions/:id/players` | List all players in session |
| `GET` | `/sessions/:sessionId/quiz/:quizId` | Get session info with quiz data |
| `DELETE` | `/sessions/:id` | Cancel/end a session |
| `DELETE` | `/sessions/:sessionId/players/:playerId/kick` | Kick a player |

### Student (Player) Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sessions/:code/join` | Join a session by 6-digit code |
| `DELETE` | `/sessions/:sessionId/players/:playerId/leave` | Leave a session |

---

## HTTP Request/Response Examples

### Create Session (Teacher)

```http
POST /sessions
Content-Type: application/json

{
  "quizId": "uuid-of-quiz"
}
```

**Response:**
```json
{
  "id": "session-uuid",
  "quizId": "quiz-uuid",
  "code": "123456",
  "status": "CREATED",
  "quiz": {
    "id": "quiz-uuid",
    "title": "Quiz Title"
  }
}
```

### Join Session (Student)

```http
POST /sessions/123456/join
Content-Type: application/json

{
  "nickname": "PlayerName"
}
```

**Response:**
```json
{
  "player": {
    "id": "player-uuid",
    "sessionId": "session-uuid",
    "nickname": "PlayerName",
    "joinedAt": "2026-01-21T18:00:00.000Z"
  },
  "session": {
    "id": "session-uuid",
    "code": "123456",
    "status": "CREATED"
  }
}
```

---

## WebSocket Connection

**Namespace:** `/sessions`

**URL:** `ws://localhost:3001/sessions`

---

## WebSocket Events

### Client → Server (Emit)

| Event | Payload | Sent By | Description |
|-------|---------|---------|-------------|
| `join_session` | `{ playerId, sessionId, nickname }` | Student | Join the session room after HTTP join |

### Server → Client (Listen)

| Event | Payload | Received By | Triggered When |
|-------|---------|-------------|----------------|
| `player_joined` | `{ player: { playerId, nickname, joinedAt }, timestamp }` | All in session | New player joins |
| `player_left` | `{ player: { playerId, nickname }, timestamp }` | All in session | Player leaves voluntarily |
| `player_kicked` | `{ player: { playerId, nickname }, timestamp }` | All in session | Teacher kicks a player |
| `player_disconnected` | `{ player: { playerId, nickname }, timestamp }` | All in session | Player loses connection |
| `session_canceled` | `{ sessionId, timestamp }` | All in session | Teacher cancels session |

---

## Flow Diagrams

### Session Join Flow (Student)

```
1. Student enters 6-digit code
2. POST /sessions/:code/join → receives { player, session }
3. Connect WebSocket to /sessions namespace
4. Emit 'join_session' with { playerId, sessionId, nickname }
5. Server adds student to session room
6. All clients receive 'player_joined' event
```

### Session Management Flow (Teacher)

```
1. Teacher selects quiz
2. POST /sessions → receives { session with code }
3. Connect WebSocket to /sessions namespace
4. Display code to students
5. Listen for 'player_joined' events to update player list
6. Optionally kick players with DELETE /:sessionId/players/:playerId/kick
7. When done, DELETE /sessions/:id to cancel
```

---

## Client Implementation Examples

### Teacher (Host) - Socket.IO

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/sessions');

// After creating session via HTTP
socket.on('connect', () => {
  console.log('Connected as host');
});

socket.on('player_joined', (data) => {
  console.log('New player:', data.player.nickname);
  // Update UI player list
});

socket.on('player_left', (data) => {
  console.log('Player left:', data.player.nickname);
});

socket.on('player_disconnected', (data) => {
  console.log('Player disconnected:', data.player.nickname);
});
```

### Student (Player) - Socket.IO

```javascript
import { io } from 'socket.io-client';

// After successful HTTP join
const socket = io('http://localhost:3001/sessions');

socket.on('connect', () => {
  // Join the session room
  socket.emit('join_session', {
    playerId: 'uuid-from-join-response',
    sessionId: 'uuid-from-join-response',
    nickname: 'MyNickname'
  });
});

socket.on('player_joined', (data) => {
  console.log('Player joined:', data.player.nickname);
});

socket.on('player_kicked', (data) => {
  if (data.player.playerId === myPlayerId) {
    console.log('You were kicked!');
    // Redirect to home
  }
});

socket.on('session_canceled', () => {
  console.log('Session was canceled by host');
  // Redirect to home
});
```

---

## Session Status Types

| Status | Description |
|--------|-------------|
| `CREATED` | Session created, waiting for players |
| `IN_PROGRESS` | Quiz is running |
| `QUESTION_OPEN` | Current question is accepting answers |
| `QUESTION_CLOSED` | Current question closed, showing results |
| `FINISHED` | Quiz completed |
| `CANCELED` | Session canceled by host |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /sessions/:code/join` | 5 requests/minute |
| All other endpoints | 10 requests/minute |
