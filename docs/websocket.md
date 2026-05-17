# DARS WebSocket Documentation

## Summary

| Item | Value |
|---|---|
| Library | Socket.IO v4 |
| URL | `ws://localhost:8000` (same port as HTTP) |
| Auth | JWT in `socket.handshake.auth.token` — **required** |
| Transport | WebSocket with long-polling fallback |

---

## Authentication

Every connection must provide a valid JWT. The server rejects unauthenticated sockets before the `connection` event fires.

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  autoConnect: false,         // connect manually after login
  auth: { token: localStorage.getItem("dars_token") },
});

socket.connect();
```

Providing no token or an expired token causes the connection to be refused with an `Unauthorized` error.

---

## Room assignment

Rooms are assigned automatically on connection based on the JWT payload. Clients do not need to emit anything to join.

| Role | Room joined |
|---|---|
| `operator` | `barangay:{barangay_id}` — scoped to their assigned barangay |
| `admin` | `global` — receives all events across barangays |
| `system_admin` | `global` |

---

## Server-emitted events

### `report:new`

Fired after a successful `POST /api/reports`. Currently broadcast to **all** connected clients.

```js
socket.on("report:new", (payload) => {
  console.log("New report:", payload);
});
```

**Payload**
```json
{
  "report_id": "RP-20260516-0001",
  "barangay_id": 1,
  "abuse_name": "Physical",
  "latitude": 10.32050000,
  "longitude": 123.91520000,
  "reported_at": "2026-05-16T08:30:00.000Z"
}
```

### `report:status`

Fired after a successful `PATCH /api/reports/:id/status`. Sent only to the barangay room the report belongs to **and** the `global` room (admins/sys_admins).

```js
socket.on("report:status", (payload) => {
  console.log("Status changed:", payload);
});
```

**Payload**
```json
{
  "report_id": "RP-20260516-0001",
  "new_status": "Dispatched"
}
```

> `new_status` is one of: `Reported`, `Dispatched`, `Under Investigation`, `Resolved`.

---

## Client-emitted events

These are exported from `client/src/services/socket.ts` for future use. The server does not yet have handlers for them — room assignment is currently automatic on connection.

### `join:barangay`

```js
socket.emit("join:barangay", 1); // barangay_id: number
```

Intended to subscribe to a specific barangay room after connection. Not yet handled server-side.

### `leave:barangay`

```js
socket.emit("leave:barangay", 1); // barangay_id: number
```

Intended to unsubscribe from a barangay room. Not yet handled server-side.

---

## Client service (`socket.ts`)

```ts
import { socket, joinBarangay, leaveBarangay } from "@/services/socket";

// Connect (call after login)
socket.connect();

// Disconnect (call on logout)
socket.disconnect();

// Listen for new reports
socket.on("report:new", (payload) => { ... });

// Room helpers (server handlers pending)
joinBarangay(barangayId);
leaveBarangay(barangayId);
```

---

## Lifecycle notes

- `autoConnect: false` — the socket does not connect on import. Call `socket.connect()` after the user logs in so the auth token is available.
- Call `socket.disconnect()` on logout to avoid stale connections with an invalidated token.
- If the token expires mid-session, the server will not automatically close the socket. The client should disconnect and reconnect with a fresh token.
