# DARS API & WebSocket Documentation

## Summary

| Item | Value |
|---|---|
| Base URL | `http://localhost:8000` |
| WebSocket URL | `ws://localhost:8000` |
| Data format | JSON |
| Auth scheme | Bearer JWT (1-day expiry) |

### Response envelope

All HTTP responses use this shape:

```json
{
  "status": "success" | "error",
  "message": "Human-readable message",
  "data": <payload or null>,
  "code": <HTTP status code>
}
```

### Auth header

Protected routes require:
```
Authorization: Bearer <token>
```

### Role hierarchy

| Role | Level |
|---|---|
| `system_admin` | Highest — full access |
| `admin` | Manage staff and data |
| `operator` | Create and update operational records |

---

## Endpoints

### Auth

#### `POST /auth/login`
Authenticate a staff member and receive a JWT.

**Body**
```json
{
  "email": "staff@example.com",
  "password": "plaintext"
}
```

**200 Response**
```json
{
  "token": "<jwt>",
  "safe_user": {
    "id": 1,
    "email": "staff@example.com",
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "role": "operator"
  }
}
```

**Errors**
| Code | Reason |
|---|---|
| 400 | Missing email or password |
| 401 | Invalid credentials |

---

### Staff
> All routes require `Authorization` header.

#### `GET /staff`
Returns all staff members. Requires `system_admin`.

**Query params**
| Param | Description |
|---|---|
| `search` | Filter by email or full name |
| `role` | Filter by role (`system_admin`, `admin`, `operator`) |

**200 Response** — array of:
```json
{
  "staff_id": 1,
  "full_name": "Juan D. Dela Cruz",
  "email": "juan@example.com",
  "user_role": "operator",
  "contact_number": "09171234567",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

---

#### `POST /staff`
Create a staff account. Requires `admin` or `system_admin`.

**Body**
```json
{
  "email": "newstaff@example.com",
  "pw": "password123",
  "firstName": "Maria",
  "middleName": "Santos",
  "lastName": "Reyes",
  "userRole": "operator",
  "contact_number": "09181234567"
}
```
> `middleName` and `contact_number` are optional. Password minimum: 8 characters.

**201 Response** — echoes the created profile (no password).

**Errors**
| Code | Reason |
|---|---|
| 400 | Missing required fields or password too short |
| 400 | Invalid role |
| 409 | Email already exists |

---

#### `GET /staff/:id`
Get a single staff member. Requires `admin` or `system_admin`.

---

#### `PUT /staff/:id`
Update a staff member. Requires `admin` or `system_admin`. All body fields are optional (only supplied fields are updated).

**Body** — same fields as `POST /staff` except `pw`.

---

#### `DELETE /staff/:id`
Delete a staff member. Requires `admin` or `system_admin`.

---

#### `POST /staff/change-password`
Change the authenticated user's own password.

**Body**
```json
{
  "oldPassword": "current123",
  "newPassword": "newpass456"
}
```

**Errors**
| Code | Reason |
|---|---|
| 400 | Missing fields or new password too short |
| 401 | Old password incorrect |

---

### Barangay
> No authentication required.

#### `GET /barangay`
Returns all barangays with their open report count.

**200 Response** — array of:
```json
{
  "barangay_id": 1,
  "barangay_name": "Poblacion",
  "latitude": 14.59750000,
  "longitude": 120.98420000,
  "radius": 500.00,
  "open_report_count": 3
}
```

---

### Victim
> All routes require `Authorization` header.

#### `GET /victim`
Returns all victims.

**Query params**
| Param | Description |
|---|---|
| `search` | Filter by full name, email, or contact number |

**200 Response** — array of:
```json
{
  "victim_id": 1,
  "full_name": "Ana M. Cruz",
  "contact_number": "09171234567",
  "email": "ana@example.com",
  "address": "123 Rizal St",
  "barangay_name": "Poblacion",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

---

#### `GET /victim/:id`
Get a single victim by ID.

---

#### `POST /victim`
Create a victim record. Requires `operator`, `admin`, or `system_admin`.

**Body**
```json
{
  "first_name": "Ana",
  "middle_name": "Maria",
  "last_name": "Cruz",
  "contact_number": "09171234567",
  "email": "ana@example.com",
  "barangay_id": 1,
  "address": "123 Rizal St"
}
```
> `middle_name`, `email`, `barangay_id`, and `address` are optional. At least one of `contact_number` or `email` is required.

**201 Response**
```json
{ "id": 1 }
```

**Errors**
| Code | Reason |
|---|---|
| 400 | Missing `first_name` or `last_name` |
| 400 | Neither `contact_number` nor `email` provided |
| 409 | Email already exists |

---

#### `PATCH /victim/:id`
Update a victim. Requires `operator`, `admin`, or `system_admin`. All body fields are optional.

---

#### `DELETE /victim/:id`
Delete a victim. Requires `admin` or `system_admin`.

---

### Offender
> No authentication required.

#### `GET /offender`
Returns all offenders ordered by full name.

**200 Response** — array of:
```json
{
  "offender_id": 1,
  "full_name": "Pedro Reyes",
  "sex": "Male",
  "contact_number": "09181234567",
  "address": "456 Mabini St",
  "barangay_name": "Poblacion"
}
```

---

#### `GET /offender/:id`
Get a single offender by ID.

---

#### `POST /offender`
Create an offender record.

**Body**
```json
{
  "first_name": "Pedro",
  "middle_name": "Jose",
  "last_name": "Reyes",
  "sex": "Male",
  "contact_number": "09181234567",
  "address": "456 Mabini St",
  "barangay_id": 1
}
```
> Only `first_name` is required. `sex` must be `Male`, `Female`, or `Other`.

**201 Response** — echoes the created record with its new `id`.

---

#### `PUT /offender/:id`
Update an offender. At least one body field must be provided.

---

#### `DELETE /offender/:id`
Delete an offender.

**Errors**
| Code | Reason |
|---|---|
| 409 | Offender is still referenced by one or more reports |

---

### Abuse Type
> No authentication required.

#### `GET /abuse-type`
Returns all abuse types ordered by severity descending.

**200 Response** — array of:
```json
{
  "abuse_name": "Physical",
  "abuse_description": "Physical harm or violence",
  "severity": 8,
  "severity_label": "High",
  "law_reference": "RA 9262 Sec. 3(a)"
}
```

---

#### `GET /abuse-type/:abuse_name`
Get a single abuse type by name (case-sensitive).

---

#### `POST /abuse-type`
Create an abuse type.

**Body**
```json
{
  "abuse_name": "Physical",
  "abuse_description": "Physical harm or violence",
  "severity": 8,
  "law_reference": "RA 9262 Sec. 3(a)"
}
```
> All fields required. `abuse_name` max 20 characters. `severity` must be 1–10.

---

#### `PUT /abuse-type/:abuse_name`
Update an abuse type. At least one body field (`abuse_description`, `severity`, `law_reference`) must be provided.

---

#### `DELETE /abuse-type/:abuse_name`
Delete an abuse type.

**Errors**
| Code | Reason |
|---|---|
| 409 | Abuse type is still referenced by one or more reports |

---

### Responder
> No authentication required.

#### `GET /responder`
Returns all responders with dispatch statistics.

**Query params**
| Param | Description |
|---|---|
| `search` | Filter by responder name |
| `agency` | Filter by agency name |

**200 Response** — array of:
```json
{
  "responder_id": 1,
  "responder_name": "Juan Dela Cruz",
  "agency": "PNP",
  "contact_number": "09171234567",
  "total_dispatches": 5,
  "completed_dispatches": 3
}
```

---

#### `GET /responder/:id`
Get a single responder by ID.

---

#### `POST /responder`
Create a responder.

**Body**
```json
{
  "responder_name": "Juan Dela Cruz",
  "agency": "PNP",
  "contact_number": "09171234567"
}
```
> Only `responder_name` is required.

**201 Response** — echoes the created record with its new `id`.

---

#### `PATCH /responder/:id`
Update a responder. All body fields are optional.

---

#### `DELETE /responder/:id`
Delete a responder.

---

### Reports
> All routes require `Authorization` header.

#### `GET /reports`
Returns all reports ordered by most recent.

**Query params**
| Param | Description |
|---|---|
| `status` | Filter by `Reported`, `Dispatched`, `Under Investigation`, or `Resolved` |
| `barangay_id` | Filter by barangay |
| `abuse_name` | Filter by abuse type name |

**200 Response** — array of:
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "report_status": "Reported",
  "reported_at": "2026-05-14T08:00:00.000Z",
  "age_days": 0,
  "dispatch_count": 0,
  "victim_name": "Ana M. Cruz",
  "victim_contact": "09171234567",
  "offender_name": "Pedro Reyes",
  "offender_sex": "Male",
  "abuse_name": "Physical",
  "severity": 8,
  "severity_label": "High",
  "barangay_name": "Poblacion",
  "latitude": 14.59750000,
  "longitude": 120.98420000,
  "report_description": "Incident details here"
}
```

---

#### `GET /reports/:id`
Get a single report by UUID.

---

#### `POST /reports`
Submit a new report. **Emits `report:new` via WebSocket to all connected clients.**

**Body**
```json
{
  "victim_id": 1,
  "offender_id": 2,
  "abuse_name": "Physical",
  "barangay_id": 1,
  "latitude": 14.5975,
  "longitude": 120.9842,
  "report_description": "Incident description"
}
```
> `offender_id` and `report_description` are optional. All other fields required.

**201 Response**
```json
{ "report_id": "550e8400-e29b-41d4-a716-446655440000" }
```

---

#### `PUT /reports/:id`
Update report details (offender, description, coordinates). All body fields are optional.

**Body**
```json
{
  "offender_id": 2,
  "report_description": "Updated description",
  "latitude": 14.5975,
  "longitude": 120.9842
}
```

---

#### `PATCH /reports/:id/status`
Update the status of a report.

**Body**
```json
{
  "new_status": "Dispatched"
}
```
> Must be one of: `Reported`, `Dispatched`, `Under Investigation`, `Resolved`.

> **Note:** Status is also driven automatically by DB triggers — assigning a dispatch sets it to `Dispatched`; completing a dispatch sets it to `Under Investigation`; creating a resolved report sets it to `Resolved`.

---

#### `DELETE /reports/:id`
Delete a report by UUID.

---

#### `GET /reports/:id/history`
Get the full status change history for a report, ordered chronologically.

**200 Response** — array of:
```json
{
  "history_id": 1,
  "report_id": "550e8400-...",
  "old_status": "Reported",
  "new_status": "Dispatched",
  "changed_at": "2026-05-14T08:05:00.000Z",
  "barangay_name": "Poblacion",
  "victim_name": "Ana M. Cruz"
}
```

---

### Dispatch
> No authentication required.

#### `GET /dispatch`
Returns all dispatches ordered by most recent.

**200 Response** — array of:
```json
{
  "dispatch_id": 1,
  "dispatch_status": "Assigned",
  "dispatch_time": "2026-05-14T08:05:00.000Z",
  "remarks": null,
  "report_id": "550e8400-...",
  "report_status": "Dispatched",
  "barangay_name": "Poblacion",
  "responder_id": 1,
  "responder_name": "Juan Dela Cruz",
  "agency": "PNP",
  "responder_contact": "09171234567"
}
```

---

#### `GET /dispatch/:id`
Get a single dispatch by ID.

---

#### `GET /dispatch/report/:report_id`
Get all dispatches for a specific report UUID, ordered by most recent.

---

#### `POST /dispatch`
Assign a responder to a report. **Automatically sets the report status to `Dispatched` (via DB trigger) if it was `Reported`.**

**Body**
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "responder_id": 1,
  "remarks": "Proceeding to location"
}
```
> `remarks` is optional.

**201 Response** — echoes the created dispatch with its new `id`.

---

#### `PUT /dispatch/:id/status`
Update a dispatch's status.

**Body**
```json
{
  "dispatch_status": "On The Way",
  "remarks": "ETA 10 minutes"
}
```
> `dispatch_status` required. Must be one of: `Assigned`, `On The Way`, `Arrived`, `Completed`. Setting to `Completed` automatically escalates the report to `Under Investigation` (via DB trigger).

---

#### `DELETE /dispatch/:id`
Delete a dispatch record.

---

## WebSocket

The server uses **Socket.IO v4**. Connect to `ws://localhost:8000`.

### Connection

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");
```

### Client-emitted events

#### `join:barangay`
Subscribe to real-time events for a specific barangay.

```js
socket.emit("join:barangay", 1); // barangay_id
```

#### `leave:barangay`
Unsubscribe from a barangay room.

```js
socket.emit("leave:barangay", 1);
```

---

### Server-emitted events

#### `report:new`
Fired when a new report is submitted via `POST /reports`. Sent to **all connected clients**.

```js
socket.on("report:new", (payload) => {
  // handle incoming report
});
```

**Payload**
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "barangay_id": 1,
  "abuse_name": "Physical",
  "latitude": 14.59750000,
  "longitude": 120.98420000,
  "reported_at": "2026-05-14T08:00:00.000Z"
}
```

---

## Status Flow

```
Reported
   │
   ├─ (dispatch assigned) ──► Dispatched
   │                               │
   │                    (dispatch completed)
   │                               │
   │                               ▼
   │                       Under Investigation
   │                               │
   └─────────────────────────── Resolved
                     (resolved_report created)
```

> Revert: deleting a `resolved_report` record sends the report back to `Under Investigation`.