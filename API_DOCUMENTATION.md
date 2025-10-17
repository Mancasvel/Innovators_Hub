# 📡 API Documentation - Innovators Hub

Comprehensive API reference for all endpoints in the Innovators Hub platform.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.vercel.app
```

## Authentication

All authenticated endpoints require a valid session cookie from NextAuth.

- Session is managed via HTTP-only cookies
- No API keys or bearer tokens needed
- Use `getServerSession()` on server-side routes

---

## 🎤 Events API

### GET /api/events

**Description:** List events with filtering, pagination, and sorting  
**Authentication:** None (public)  
**Rate Limit:** None

#### Query Parameters

| Parameter        | Type    | Default     | Description                                                             |
| ---------------- | ------- | ----------- | ----------------------------------------------------------------------- |
| `membershipFree` | boolean | -           | Filter events free for members                                          |
| `upcoming`       | boolean | -           | Show only future events                                                 |
| `status`         | string  | `published` | Filter by status: `draft`, `published`, `cancelled`                     |
| `category`       | string  | -           | Filter by category: `networking`, `workshop`, `talk`, `social`, `other` |
| `page`           | number  | `1`         | Page number (min: 1)                                                    |
| `limit`          | number  | `20`        | Results per page (min: 1, max: 100)                                     |
| `sortBy`         | string  | `date`      | Sort field: `date`, `createdAt`, `title`, `price`                       |
| `sortOrder`      | string  | `asc`       | Sort order: `asc`, `desc`                                               |

#### Response 200

```json
{
  "events": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Web3 Workshop for Beginners",
      "description": "Learn blockchain fundamentals...",
      "date": "2025-02-15T18:00:00.000Z",
      "location": "Innovators Hub, Seville",
      "price": 2500,
      "membershipFree": true,
      "capacity": 50,
      "ticketsSold": 23,
      "category": "workshop",
      "status": "published",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "María González",
        "email": "maria@innovatorshub.com"
      },
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-10T15:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Examples

```bash
# Get upcoming events
curl 'http://localhost:3000/api/events?upcoming=true'

# Get free events for members, page 2
curl 'http://localhost:3000/api/events?membershipFree=true&page=2&limit=10'

# Get workshops sorted by price
curl 'http://localhost:3000/api/events?category=workshop&sortBy=price&sortOrder=desc'
```

---

### POST /api/events

**Description:** Create a new event  
**Authentication:** Required (organizer or admin)  
**Role:** `organizer`, `admin`

#### Request Body

```json
{
  "title": "AI & Machine Learning Talk",
  "description": "Discover the latest trends in artificial intelligence and machine learning with industry experts.",
  "date": "2025-03-20T19:00:00.000Z",
  "location": "Innovators Hub, Calle Sierpes 45, Seville",
  "price": 1500,
  "membershipFree": false,
  "capacity": 80,
  "category": "talk",
  "image": "https://example.com/event-image.jpg"
}
```

#### Validation Rules

- `title`: 3-150 characters, required
- `description`: 10-2000 characters, required
- `date`: ISO 8601 datetime, must be in future, required
- `location`: 3-200 characters, required
- `price`: 0-1,000,000 (in cents), required
- `membershipFree`: boolean, default: false
- `capacity`: 1-10,000, optional
- `category`: enum, optional
- `image`: valid URL, optional

#### Response 201

```json
{
  "success": true,
  "event": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "AI & Machine Learning Talk",
    ...
  },
  "message": "Event created successfully"
}
```

#### Errors

- **401 Unauthorized**: No valid session
- **403 Forbidden**: User is not organizer/admin
- **422 Unprocessable Entity**: Validation failed

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title must be at least 3 characters"
    }
  ]
}
```

---

### GET /api/events/[id]

**Description:** Get single event details  
**Authentication:** None (public)

#### Response 200

```json
{
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Web3 Workshop for Beginners",
    "description": "Learn blockchain fundamentals...",
    "date": "2025-02-15T18:00:00.000Z",
    "location": "Innovators Hub, Seville",
    "price": 2500,
    "membershipFree": true,
    "capacity": 50,
    "ticketsSold": 23,
    "category": "workshop",
    "status": "published",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "María González",
      "email": "maria@innovatorshub.com",
      "image": "https://..."
    },
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-10T15:30:00.000Z"
  }
}
```

#### Errors

- **400 Bad Request**: Invalid event ID format
- **404 Not Found**: Event doesn't exist

---

### PATCH /api/events/[id]

**Description:** Update an event  
**Authentication:** Required (owner or admin)  
**Role:** Event owner (organizer) or `admin`

#### Request Body

Partial update - all fields optional:

```json
{
  "title": "Updated Event Title",
  "price": 2000,
  "capacity": 100
}
```

#### Authorization Rules

- Organizers can only update their own events
- Admins can update any event
- Cannot update: `createdBy`, `ticketsSold`, `_id`

#### Response 200

```json
{
  "success": true,
  "event": { ... },
  "message": "Event updated successfully"
}
```

#### Errors

- **401 Unauthorized**: No valid session
- **403 Forbidden**: Not owner or admin
- **404 Not Found**: Event doesn't exist
- **422 Unprocessable Entity**: Validation failed

---

### DELETE /api/events/[id]

**Description:** Delete (cancel) an event  
**Authentication:** Required (owner or admin)  
**Role:** Event owner (organizer) or `admin`

#### Query Parameters

| Parameter | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| `cascade` | boolean | If `true`, also cancel related tickets |

#### Behavior

- **Soft delete**: Sets event status to `cancelled`
- Does not physically delete the record
- Optionally cascades to related tickets

#### Response 200

```json
{
  "success": true,
  "message": "Event cancelled successfully",
  "ticketsAffected": 15
}
```

#### Errors

- **401 Unauthorized**: No valid session
- **403 Forbidden**: Not owner or admin
- **404 Not Found**: Event doesn't exist

#### Examples

```bash
# Cancel event and related tickets
curl -X DELETE 'http://localhost:3000/api/events/507f1f77bcf86cd799439011?cascade=true' \
  -H 'Cookie: next-auth.session-token=...'
```

---

## 🎟️ Tickets API

### GET /api/user/tickets

**Description:** Get current user's tickets  
**Authentication:** Required

#### Response 200

```json
{
  "tickets": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "qrCode": "a3f2e8d1-4b5c-6a7d-8e9f-0a1b2c3d4e5f",
      "assisted": false,
      "status": "valid",
      "purchasePrice": 2500,
      "eventId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Web3 Workshop",
        "date": "2025-02-15T18:00:00.000Z",
        "location": "Innovators Hub"
      },
      "createdAt": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

---

### POST /api/tickets/validate

**Description:** Validate and mark ticket as used  
**Authentication:** Required (organizer or admin)  
**Role:** `organizer`, `admin`  
**Rate Limit:** 50 requests/minute per user

#### Request Body

```json
{
  "qrCode": "a3f2e8d1-4b5c-6a7d-8e9f-0a1b2c3d4e5f"
}
```

#### Response 200

```json
{
  "success": true,
  "ticket": {
    "id": "507f1f77bcf86cd799439014",
    "userName": "Carlos Rodríguez",
    "userEmail": "carlos@example.com",
    "eventTitle": "Web3 Workshop",
    "eventDate": "2025-02-15T18:00:00.000Z",
    "usedAt": "2025-02-15T18:05:00.000Z"
  }
}
```

#### Errors

- **401 Unauthorized**: No valid session
- **403 Forbidden**: Not organizer/admin
- **404 Not Found**: Ticket doesn't exist
- **409 Conflict**: Ticket already used
- **429 Too Many Requests**: Rate limit exceeded

```json
{
  "error": "Ticket already used",
  "code": "ALREADY_USED",
  "usedAt": "2025-02-15T18:05:00.000Z"
}
```

---

### GET /api/tickets/free-claim

**Description:** Claim free ticket (members only)  
**Authentication:** Required (active membership)

#### Query Parameters

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `eventId` | string | Yes      | Event ID to claim ticket for |

#### Response

Redirects to `/user/tickets?success=true`

#### Errors

- **403 Forbidden**: No active membership or event not free for members
- **404 Not Found**: Event or user not found

---

## 💳 Stripe API

### POST /api/stripe/checkout

**Description:** Create Stripe checkout session  
**Authentication:** Required

#### Request Body

```json
{
  "eventId": "507f1f77bcf86cd799439011",
  "type": "ticket"
}
```

Or for membership:

```json
{
  "type": "membership"
}
```

#### Response 200

```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_a1..."
}
```

---

### POST /api/stripe/webhook

**Description:** Handle Stripe webhooks  
**Authentication:** Stripe signature  
**Note:** Internal endpoint, called by Stripe

#### Events Handled

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

### POST /api/stripe/portal

**Description:** Create Stripe customer portal session  
**Authentication:** Required (active subscription)

#### Response 200

```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

---

## 👥 Auth API

### POST /api/auth/register

**Description:** Register new user  
**Authentication:** None

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response 201

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439015",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 📊 Organizer API

### GET /api/organizer/stats

**Description:** Get organizer's statistics  
**Authentication:** Required (organizer or admin)

#### Response 200

```json
{
  "stats": {
    "totalEvents": 12,
    "upcomingEvents": 5,
    "totalTickets": 245,
    "usedTickets": 180,
    "validTickets": 65,
    "totalRevenue": 612500
  }
}
```

---

## 🖼️ QR Code API

### GET /api/qr

**Description:** Generate QR code image  
**Authentication:** None (public)

#### Query Parameters

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `code`    | string | Yes      | UUID code to encode |

#### Response

PNG image (binary)

#### Example

```html
<img src="/api/qr?code=a3f2e8d1-4b5c-6a7d-8e9f-0a1b2c3d4e5f" alt="QR Code" />
```

---

## 🔒 Error Codes Reference

| Code | Message               | Description                                   |
| ---- | --------------------- | --------------------------------------------- |
| 400  | Bad Request           | Invalid request format or parameters          |
| 401  | Unauthorized          | No valid session/authentication               |
| 403  | Forbidden             | Insufficient permissions                      |
| 404  | Not Found             | Resource doesn't exist                        |
| 409  | Conflict              | Resource conflict (e.g., ticket already used) |
| 422  | Unprocessable Entity  | Validation failed                             |
| 429  | Too Many Requests     | Rate limit exceeded                           |
| 500  | Internal Server Error | Unexpected server error                       |

---

## 📝 Common Patterns

### Authentication Headers

```bash
# NextAuth uses HTTP-only cookies
# Include credentials in requests:
curl -X POST 'http://localhost:3000/api/events' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{"title": "..."}'
```

### Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": []
}
```

### Pagination Pattern

```javascript
// Client-side pagination helper
async function fetchEvents(page = 1, limit = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await fetch(`/api/events?${params}`);
  return response.json();
}
```

---

**Last Updated:** January 2025  
**API Version:** 1.0.0  
**Base Framework:** Next.js 15 App Router
