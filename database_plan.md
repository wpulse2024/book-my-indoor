# VenueHub — Complete Data Structure Reference

All collections use **MongoDB** via **Mongoose**. Timestamps (`createdAt`, `updatedAt`) are automatic on all collections unless noted.

---

## Table of Contents
1. [User](#1-user)
2. [Role](#2-role)
3. [Permission](#3-permission)
4. [Organization](#4-organization)
5. [OTP](#5-otp)
6. [Venue](#6-venue)
7. [VenueSlot](#7-venueslot)
8. [Booking *(planned)*](#8-booking-planned)
9. [WalletTransaction *(planned)*](#9-wallettransaction-planned)
10. [Review *(planned)*](#10-review-planned)
11. [Category *(planned)*](#11-category-planned)
12. [Relationship Map](#12-relationship-map)

---

## 1. User

**Collection**: `users`  
**File**: `backend/src/users/schemas/user.schema.ts`

### Sample Object
```js
{
  _id: ObjectId("69d75680a6dbe87a871dbd58"),
  name: "Jameson Reeds",
  phone: "+8801747102896",          // unique, required — primary identifier
  email: "agent@kinetic.com",       // unique (sparse), optional
  password: "$2b$10$...",           // bcrypt hashed, excluded from queries (select: false)
  roles: [
    ObjectId("69d75680eeb57da0521a2141")  // ref → Role
  ],
  organization: ObjectId("69d75680eeb57da0521b3152"),  // ref → Organization (for agents)
  isActive: true,
  createdAt: ISODate("2026-04-09T07:34:24.356Z"),
  updatedAt: ISODate("2026-04-10T02:23:42.188Z"),
  __v: 0
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `name` | String | No | Display name |
| `phone` | String | Yes | Unique. Primary login identifier |
| `email` | String | No | Unique (sparse). Secondary identifier. Lowercase |
| `password` | String | No | bcrypt hash. `select: false` — never returned by default |
| `roles` | ObjectId[] | No | Refs to Role collection. Default: `[]` |
| `organization` | ObjectId | No | Ref to Organization. Set for agents only |
| `isActive` | Boolean | No | Default: `true`. `false` = pending OTP verification |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

### Relationships
- `roles` → `Role._id` (many-to-many)
- `organization` → `Organization._id` (many-to-one)

### Notes
- New registered users start with `isActive: false` until OTP is verified
- Agent users are created automatically when an Organization is created
- Admin user is seeded with full access

---

## 2. Role

**Collection**: `roles`  
**File**: `backend/src/roles/schemas/role.schema.ts`

### Sample Object
```js
{
  _id: ObjectId("69d75680eeb57da0521a2141"),
  name: "admin",                            // unique — "admin" | "agent" | "user"
  description: "Super-admin with full access",
  permissions: [
    ObjectId("69d75680eeb57da0521a2113"),   // ref → Permission
    ObjectId("69d75680eeb57da0521a2114"),
    // ... all 21 permissions for admin
  ],
  createdAt: ISODate("2026-04-09T07:34:24.356Z"),
  updatedAt: ISODate("2026-04-10T02:23:42.188Z"),
  __v: 0
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `name` | String | Yes | Unique. Role identifier e.g. `"admin"`, `"agent"`, `"user"` |
| `description` | String | No | Human-readable description |
| `permissions` | ObjectId[] | No | Refs to Permission collection. Default: `[]` |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

### Relationships
- `permissions` → `Permission._id` (many-to-many)

### Seeded Roles
| Name | Description | Default Permissions |
|---|---|---|
| `admin` | Full platform access | All 21 system permissions |
| `agent` | Organization/venue manager | None (customizable) |
| `user` | End customer | None |

---

## 3. Permission

**Collection**: `permissions`  
**File**: `backend/src/permissions/schemas/permission.schema.ts`

### Sample Object
```js
{
  _id: ObjectId("69d75680eeb57da0521a2113"),
  name: "users:read",                        // pattern: "resource:action"
  description: "List all users",
  createdAt: ISODate("2026-04-09T07:34:24.356Z"),
  updatedAt: ISODate("2026-04-10T02:23:42.188Z"),
  __v: 0
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `name` | String | Yes | Unique. Format: `resource:action` |
| `description` | String | No | Human-readable description |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

### All 21 Seeded Permissions
```
permissions:create     permissions:read      permissions:singleRead   permissions:delete
auth:loginAsUser
roles:create           roles:read            roles:readNonAdmin       roles:singleRead
roles:update           roles:delete
users:create           users:read            users:singleRead         users:assignRole
users:delete
organizations:create   organizations:read    organizations:singleRead organizations:update
organizations:delete
```

---

## 4. Organization

**Collection**: `organizations`  
**File**: `backend/src/organizations/schemas/organization.schema.ts`

### Sample Object
```js
{
  _id: ObjectId("69d75680eeb57da0521b3152"),
  title: "Kinetic Sports Ltd.",              // unique org name
  agentId: ObjectId("69d75680a6dbe87a871dbd58"),  // ref → User (agent account)
  commissionType: "percentage",             // "fixed" | "percentage"
  commissionAmount: 10,                     // 10% commission per booking
  logo: "https://cdn.example.com/kinetic-logo.png",  // optional logo URL
  place: "Gulshan 2, Dhaka, Bangladesh",    // optional physical address
  description: "We manage 4 premium badminton courts and 2 futsal arenas in central Dhaka.",
  createdAt: ISODate("2026-04-09T07:34:24.356Z"),
  updatedAt: ISODate("2026-04-10T02:23:42.188Z"),
  __v: 0
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `title` | String | Yes | Unique. Organization display name |
| `agentId` | ObjectId | Yes | Ref to User (the agent who manages this org) |
| `commissionType` | String (enum) | Yes | `"fixed"` or `"percentage"` |
| `commissionAmount` | Number | Yes | Commission value (positive number) |
| `logo` | String | No | URL to organization logo image |
| `place` | String | No | Physical address or area of operation |
| `description` | String | No | What the organization manages/offers |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

### Relationships
- `agentId` → `User._id` (one-to-one: each org has one agent user)

### Notes
- Creating an Organization **automatically creates** an agent User account
- The agent User's `organization` field is set to this org's `_id`
- `commissionAmount` is `10` if `commissionType` is `"percentage"` → means 10% cut per booking
- `commissionAmount` is `50` if `commissionType` is `"fixed"` → means ৳50 flat per booking

---

## 5. OTP

**Collection**: `otps`  
**File**: `backend/src/otp/schemas/otp.schema.ts`

### Sample Object
```js
{
  _id: ObjectId("69d75680eeb57da0521c4201"),
  phone: "+8801747102896",
  otp: "$2b$10$...",           // bcrypt hashed 6-digit code
  type: "login",               // "register" | "login" | "reset_password"
  expiresAt: ISODate("2026-04-10T08:04:24.356Z"),  // TTL index auto-deletes after this
  isUsed: false,               // true after successful verification
  createdAt: ISODate("2026-04-10T08:02:24.356Z"),
  updatedAt: ISODate("2026-04-10T08:02:24.356Z"),
  __v: 0
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `phone` | String | Yes | Target phone number |
| `otp` | String | Yes | bcrypt hash of the 6-digit code |
| `type` | String (enum) | Yes | `"register"` \| `"login"` \| `"reset_password"` |
| `expiresAt` | Date | Yes | TTL index — document is auto-deleted after this time |
| `isUsed` | Boolean | No | Default: `false`. Set to `true` after successful use |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

### Notes
- A new OTP invalidates all previous unused OTPs for the same `phone + type`
- `OTP_EXPIRY_MINUTES` env var controls expiry (default: 2 min for registration, 10 min for login)
- The plain-text OTP is returned by `OtpService.createOtp()` for SMS/WhatsApp delivery

---

## 6. Venue

**Collection**: `venues`
**File**: `backend/src/venues/schemas/venue.schema.ts`

### Sample Object
```js
{
  _id: ObjectId("665f1a2b3c4d5e6f7a8b9c10"),
  title: "Green Futsal Arena",
  description: "Premium indoor futsal court with AC and changing rooms.",
  location: {
    title: "Gulshan-2, Dhaka",
    lat: 23.7945,
    long: 90.4142
  },
  rating: 0,                              // starts at 0 — computed from reviews, not set by frontend
  features: [
    ObjectId("665f1a2b3c4d5e6f7a8b9c1a"), // ref → VenueFeature
    ObjectId("665f1a2b3c4d5e6f7a8b9c1b")
  ],
  categoryId: ObjectId("665f1a2b3c4d5e6f7a8b9c0d"),  // ref → Category
  images: [
    "uploads/venues/venue-1712843200000-123456.jpg",
    "uploads/venues/venue-1712843200001-654321.jpg"
  ],
  slots: [
    {
      _id: ObjectId("665f1a2b3c4d5e6f7a8b9c20"),  // auto-generated
      startTime: "09:00",
      endTime: "10:00",
      price: 500
    },
    {
      _id: ObjectId("665f1a2b3c4d5e6f7a8b9c21"),
      startTime: "10:00",
      endTime: "11:00",
      price: 600
    }
  ],
  organizationId: ObjectId("69d75680eeb57da0521b3152"),  // ref → Organization
  createdAt: ISODate("2026-04-11T10:00:00.000Z"),
  updatedAt: ISODate("2026-04-11T10:00:00.000Z"),
  __v: 0
}
```

### Fields
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | MongoDB document ID |
| `title` | String | Yes | — | Venue display name. Trimmed |
| `description` | String | No | — | Optional description. Trimmed |
| `location` | Object | Yes | — | Embedded location sub-document |
| `location.title` | String | Yes | — | Human-readable address |
| `location.lat` | Number | Yes | — | GPS latitude |
| `location.long` | Number | Yes | — | GPS longitude |
| `rating` | Number | No | `0` | Avg rating 0–5. Computed from reviews — never set by frontend |
| `features` | ObjectId[] | No | `[]` | Refs → `venuefeatures` collection |
| `categoryId` | ObjectId | Yes | — | Ref → `categories` collection |
| `images` | String[] | No | `[]` | File paths under `uploads/venues/` |
| `slots` | Object[] | No | `[]` | Embedded slot sub-documents |
| `slots[]._id` | ObjectId | auto | — | Auto-generated by Mongoose |
| `slots[].startTime` | String | Yes | — | Format: `"HH:mm"` e.g. `"09:00"` |
| `slots[].endTime` | String | Yes | — | Format: `"HH:mm"` e.g. `"10:00"` |
| `slots[].price` | Number | Yes | — | Price in BDT. Min: 0 |
| `organizationId` | ObjectId | Yes | — | Ref → `organizations`. Auto-resolved from token for non-admin |
| `createdAt` | Date | auto | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | Mongoose timestamp |

### Relationships
- `categoryId` → `Category._id`
- `features[]` → `VenueFeature._id`
- `organizationId` → `Organization._id`

### Notes
- `organizationId` is **never taken from the request body for non-admin users** — it is resolved from `request.user.organization` (set when the agent account was created)
- Admin users must pass `organizationId` explicitly in the request body
- `rating` is read-only from the frontend — it will be recomputed via reviews in a future phase
- Images are stored locally under `uploads/venues/` and served at `GET /uploads/venues/<filename>`
- Nested fields (`location`, `features`, `slots`) must be sent as **JSON strings** when using `multipart/form-data`

---

## 6a. Venue API

Base prefix: `/api/v1/venues`

---

### POST /api/v1/venues

**Auth:** Bearer token required. Permission: `venues:create`
**Content-Type:** `multipart/form-data`

#### Request fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | |
| `description` | string | No | |
| `location` | JSON string | Yes | `{"title":"...","lat":23.8,"long":90.4}` |
| `categoryId` | string (MongoId) | Yes | |
| `organizationId` | string (MongoId) | Admin only | Ignored for non-admin — resolved from token |
| `features` | JSON string | No | `["<id>","<id>"]` |
| `slots` | JSON string | No | `[{"startTime":"09:00","endTime":"10:00","price":500}]` |
| `images` | file[] | No | Up to 10 files. Max 3 MB each. jpeg/png/webp/gif only |

#### Example request (multipart/form-data)
```
title         = "Green Futsal Arena"
description   = "Premium indoor futsal court"
location      = {"title":"Gulshan-2, Dhaka","lat":23.7945,"long":90.4142}
categoryId    = "665f1a2b3c4d5e6f7a8b9c0d"
organizationId= "69d75680eeb57da0521b3152"   ← admin only
features      = ["665f1a2b3c4d5e6f7a8b9c1a","665f1a2b3c4d5e6f7a8b9c1b"]
slots         = [{"startTime":"09:00","endTime":"10:00","price":500},{"startTime":"10:00","endTime":"11:00","price":600}]
images        = <file1.jpg>, <file2.jpg>
```

#### Response `201 Created`
```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c10",
  "title": "Green Futsal Arena",
  "description": "Premium indoor futsal court",
  "location": {
    "title": "Gulshan-2, Dhaka",
    "lat": 23.7945,
    "long": 90.4142
  },
  "rating": 0,
  "features": ["665f1a2b3c4d5e6f7a8b9c1a", "665f1a2b3c4d5e6f7a8b9c1b"],
  "categoryId": "665f1a2b3c4d5e6f7a8b9c0d",
  "images": [
    "uploads/venues/venue-1712843200000-123456.jpg",
    "uploads/venues/venue-1712843200001-654321.jpg"
  ],
  "slots": [
    { "_id": "665f1a2b3c4d5e6f7a8b9c20", "startTime": "09:00", "endTime": "10:00", "price": 500 },
    { "_id": "665f1a2b3c4d5e6f7a8b9c21", "startTime": "10:00", "endTime": "11:00", "price": 600 }
  ],
  "organizationId": "69d75680eeb57da0521b3152",
  "createdAt": "2026-04-11T10:00:00.000Z",
  "updatedAt": "2026-04-11T10:00:00.000Z"
}
```

#### Error responses
```json
// 400 — Admin did not provide organizationId
{ "statusCode": 400, "message": "Organization is required for admin" }

// 400 — Non-admin user has no organization linked
{ "statusCode": 400, "message": "Your account is not linked to any organization" }

// 400 — Invalid file type
{ "statusCode": 400, "message": "Only image files (jpeg, png, webp, gif) are allowed" }

// 401 — No/invalid token
{ "statusCode": 401, "message": "Unauthorized" }

// 403 — Token valid but missing permission
{ "statusCode": 403, "message": "Forbidden resource" }
```

---

### GET /api/v1/venues

**Auth:** Public (no token required)

#### Response `200 OK`
```json
[
  {
    "_id": "665f1a2b3c4d5e6f7a8b9c10",
    "title": "Green Futsal Arena",
    "description": "Premium indoor futsal court",
    "location": { "title": "Gulshan-2, Dhaka", "lat": 23.7945, "long": 90.4142 },
    "rating": 4.5,
    "features": [
      { "_id": "665f1a2b3c4d5e6f7a8b9c1a", "name": "Parking", "icon": "parking-icon" }
    ],
    "categoryId": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "title": "Futsal",
      "image": "uploads/categories/image-1712843200000-111111.png"
    },
    "images": ["uploads/venues/venue-1712843200000-123456.jpg"],
    "slots": [
      { "_id": "665f1a2b3c4d5e6f7a8b9c20", "startTime": "09:00", "endTime": "10:00", "price": 500 }
    ],
    "organizationId": "69d75680eeb57da0521b3152",
    "createdAt": "2026-04-11T10:00:00.000Z",
    "updatedAt": "2026-04-11T10:00:00.000Z"
  }
]
```

---

### GET /api/v1/venues/:id

**Auth:** Public (no token required)

#### Response `200 OK`
Same shape as a single item from the list above (`features` and `categoryId` are populated).

#### Error responses
```json
// 404
{ "statusCode": 404, "message": "Venue not found" }
```

---

### PATCH /api/v1/venues/:id

**Auth:** Bearer token required. Permission: `venues:update`
**Content-Type:** `multipart/form-data`

All fields are optional. Only provided fields are updated.

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `description` | string | |
| `location` | JSON string | Full replacement of location object |
| `categoryId` | string (MongoId) | |
| `features` | JSON string | Full replacement of features array |
| `slots` | JSON string | Full replacement of slots array |
| `images` | file[] | Up to 10. Replaces all existing images if provided |

#### Response `200 OK`
Updated venue document — same shape as GET single (with populated `features` and `categoryId`).

#### Error responses
```json
// 404
{ "statusCode": 404, "message": "Venue not found" }

// 401 / 403 — same as POST
```

---

### DELETE /api/v1/venues/:id

**Auth:** Bearer token required. Permission: `venues:delete`

#### Response `200 OK`
```json
{ "statusCode": 200, "message": "Venue deleted" }
```

#### Error responses
```json
// 404
{ "statusCode": 404, "message": "Venue not found" }

// 401 / 403 — same as POST
```

---

### Venue Permissions

| Permission | Role | Route |
|---|---|---|
| `venues:create` | admin | `POST /venues` |
| `venues:update` | admin | `PATCH /venues/:id` |
| `venues:delete` | admin | `DELETE /venues/:id` |
| *(none)* | public | `GET /venues`, `GET /venues/:id` |

---

## 7. VenueSlot

**Collection**: `venueslots`
**File**: `backend/src/venue-slots/schemas/venue-slot.schema.ts`

### Sample Object
```js
{
  _id: ObjectId("665f2b3c4d5e6f7a8b9c0101"),
  organizationId: ObjectId("69d75680eeb57da0521b3152"),  // ref → Organization
  venueId: ObjectId("665f1a2b3c4d5e6f7a8b9c10"),         // ref → Venue
  date: ISODate("2026-04-15T00:00:00.000Z"),
  startTime: "09:00",
  endTime: "10:00",
  slotPrice: 500,
  commissionAmount: 50,         // resolved from org at booking time
  totalAmount: 550,             // slotPrice + commissionAmount
  status: "publish",            // "draft" | "publish" | "unpublish"
  bookingStatus: "booked",      // "booked" | "cancelled" | "rejected" — absent until first booking
  bookingInfo: {
    userId: ObjectId("69d75680a6dbe87a871dbd58"),  // ref → User
    paymentStatus: "pending_for_payment",           // see PaymentStatus enum
    bookingTime: ISODate("2026-04-14T12:34:00.000Z"),
    paymentMethod: "Bkash",     // optional — set after payment
    transactionId: "TXN123456", // optional — set after payment
    paymentNumber: "01711000000" // optional — set after payment
  },
  bookingHistory: [
    {
      userId: ObjectId("69d75680a6dbe87a871dbd58"),
      paymentStatus: "pending_for_payment",
      bookingTime: ISODate("2026-04-14T12:34:00.000Z"),
      paymentMethod: null,
      transactionId: null,
      paymentNumber: null,
      bookingStatus: "booked"
    }
  ],
  createdAt: ISODate("2026-04-11T10:00:00.000Z"),
  updatedAt: ISODate("2026-04-14T12:34:00.000Z"),
  __v: 0
}
```

### Enums

| Enum | Values |
|---|---|
| `SlotStatus` | `draft` \| `publish` \| `unpublish` |
| `BookingStatus` | `booked` \| `cancelled` \| `rejected` |
| `PaymentStatus` | `pending_for_payment` \| `payment_done` \| `payment_verified` \| `payment_rejected` |
| `PaymentMethod` | `Bkash` \| `Nagad` \| `Rocket` \| `Cash` |

### Fields

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | MongoDB document ID |
| `organizationId` | ObjectId | Yes | — | Ref → Organization. Auto-resolved from agent token or venue for admin |
| `venueId` | ObjectId | Yes | — | Ref → Venue |
| `date` | Date | Yes | — | Slot date. Stored as start-of-day UTC |
| `startTime` | String | Yes | — | Format: `"HH:mm"` |
| `endTime` | String | Yes | — | Format: `"HH:mm"` |
| `slotPrice` | Number | Yes | — | Base price in BDT. Min: 0 |
| `commissionAmount` | Number | No | — | Set at booking time from org settings |
| `totalAmount` | Number | No | — | `slotPrice + commissionAmount`. Set at booking time |
| `status` | String (enum) | No | `draft` | Lifecycle status of the slot |
| `bookingStatus` | String (enum) | No | — | Absent until first booking action |
| `bookingInfo` | Object | No | — | Current active booking details |
| `bookingInfo.userId` | ObjectId | Yes* | — | Ref → User who booked |
| `bookingInfo.paymentStatus` | String (enum) | Yes* | `pending_for_payment` | Payment lifecycle |
| `bookingInfo.bookingTime` | Date | Yes* | — | When the booking was created |
| `bookingInfo.paymentMethod` | String (enum) | No | — | Set after payment is initiated |
| `bookingInfo.transactionId` | String | No | — | Gateway transaction reference |
| `bookingInfo.paymentNumber` | String | No | — | Mobile number used for payment |
| `bookingHistory` | Object[] | No | `[]` | Full audit log of all booking events |
| `bookingHistory[].bookingStatus` | String (enum) | Yes* | — | Status at the time of this history entry |
| `createdAt` | Date | auto | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | Mongoose timestamp |

*Required only when the parent object is present.

### Relationships
- `organizationId` → `Organization._id`
- `venueId` → `Venue._id`
- `bookingInfo.userId` → `User._id`
- `bookingHistory[].userId` → `User._id`

### Business Rules
- A slot can only be **updated or deleted** when `status === "draft"`
- A slot can only be **booked** when `status === "publish"` and `bookingStatus !== "booked"`
- A slot can only be **published/unpublished** when `bookingStatus !== "booked"`
- `commissionAmount` is calculated at booking time from `Organization.commissionType` + `Organization.commissionAmount`:
  - `fixed` → `commissionAmount = org.commissionAmount`
  - `percentage` → `commissionAmount = round(slotPrice × org.commissionAmount / 100, 2)`
- `totalAmount = slotPrice + commissionAmount`
- **Bulk creation**: supply `venueId + startDate + endDate` → one slot is created per day × per template slot in `Venue.slots[]`
- Agent booking auto-creates a user account (with `isActive: true`) if the provided phone number is not found

---

## 7a. VenueSlot API

Base prefix: `/api/v1/venue-slots`

### Permissions

| Permission | Assigned to | Route |
|---|---|---|
| `venue-slots:create` | agent | `POST /venue-slots`, `POST /venue-slots/bulk` |
| `venue-slots:adminCreate` | admin | `POST /venue-slots/admin`, `POST /venue-slots/admin/bulk` |
| `venue-slots:readAll` | admin | `GET /venue-slots` |
| `venue-slots:readMine` | agent | `GET /venue-slots/mine` |
| `venue-slots:read` | agent, admin | `GET /venue-slots/:id` |
| `venue-slots:update` | agent | `PATCH /venue-slots/:id` |
| `venue-slots:adminUpdate` | admin | `PATCH /venue-slots/admin/:id` |
| `venue-slots:updateStatus` | agent | `PATCH /venue-slots/:id/status` |
| `venue-slots:adminUpdateStatus` | admin | `PATCH /venue-slots/admin/:id/status` |
| `venue-slots:bookByAgent` | agent | `POST /venue-slots/:id/book` |
| `venue-slots:book` | user | `POST /venue-slots/:id/book-user` |
| `venue-slots:delete` | agent | `DELETE /venue-slots/:id` |
| `venue-slots:adminDelete` | admin | `DELETE /venue-slots/admin/:id` |

---

### POST /api/v1/venue-slots
Agent creates a single slot under their own organization.

**Auth:** Bearer token. Permission: `venue-slots:create`

#### Request body (JSON)
```json
{
  "venueId": "665f1a2b3c4d5e6f7a8b9c10",
  "date": "2026-04-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "slotPrice": 500,
  "commissionAmount": 50,
  "totalAmount": 550,
  "status": "draft"
}
```
| Field | Type | Required | Notes |
|---|---|---|---|
| `venueId` | MongoId | Yes | Must belong to agent's organization |
| `date` | DateString | Yes | Format: `YYYY-MM-DD` |
| `startTime` | String | Yes | Format: `HH:mm` |
| `endTime` | String | Yes | Format: `HH:mm` |
| `slotPrice` | Number | Yes | Min: 0 |
| `commissionAmount` | Number | No | Optional override |
| `totalAmount` | Number | No | Optional override |
| `status` | SlotStatus | No | Default: `draft` |

---

### POST /api/v1/venue-slots/admin
Admin creates a slot. `organizationId` is resolved from the venue.

**Auth:** Bearer token. Permission: `venue-slots:adminCreate`

Same body as above — no `organizationId` needed.

---

### POST /api/v1/venue-slots/bulk
Agent bulk-creates slots across a date range using venue's slot templates.

**Auth:** Bearer token. Permission: `venue-slots:create`

#### Request body (JSON)
```json
{
  "venueId": "665f1a2b3c4d5e6f7a8b9c10",
  "startDate": "2026-04-15",
  "endDate": "2026-04-21"
}
```

**Behaviour:** For each day in `[startDate, endDate]`, one `VenueSlot` document is created per entry in `Venue.slots[]` using `startTime`, `endTime`, and `price` from the template. All created slots default to `status: draft`.

---

### POST /api/v1/venue-slots/admin/bulk
Admin bulk-creates slots. `organizationId` resolved from venue.

**Auth:** Bearer token. Permission: `venue-slots:adminCreate`

Same body as agent bulk.

---

### GET /api/v1/venue-slots
Admin lists all slots across all organizations.

**Auth:** Bearer token. Permission: `venue-slots:readAll`

#### Query params
| Param | Type | Description |
|---|---|---|
| `venueId` | MongoId | Filter by venue |
| `date` | DateString | Filter by date (`YYYY-MM-DD`) |
| `status` | SlotStatus | Filter by slot status |
| `bookingStatus` | BookingStatus | Filter by booking status |

---

### GET /api/v1/venue-slots/mine
Agent lists slots belonging to their own organization.

**Auth:** Bearer token. Permission: `venue-slots:readMine`

Same query params as above.

---

### GET /api/v1/venue-slots/:id

**Auth:** Bearer token. Permission: `venue-slots:read`

#### Response `200 OK`
```json
{
  "_id": "665f2b3c4d5e6f7a8b9c0101",
  "organizationId": "69d75680eeb57da0521b3152",
  "venueId": { "_id": "...", "title": "Green Futsal Arena", "..." : "..." },
  "date": "2026-04-15T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "10:00",
  "slotPrice": 500,
  "commissionAmount": 50,
  "totalAmount": 550,
  "status": "publish",
  "bookingStatus": "booked",
  "bookingInfo": {
    "userId": { "_id": "...", "name": "Jameson", "phone": "+88017..." },
    "paymentStatus": "pending_for_payment",
    "bookingTime": "2026-04-14T12:34:00.000Z",
    "paymentMethod": null,
    "transactionId": null,
    "paymentNumber": null
  },
  "bookingHistory": [...],
  "createdAt": "2026-04-11T10:00:00.000Z",
  "updatedAt": "2026-04-14T12:34:00.000Z"
}
```

---

### PATCH /api/v1/venue-slots/:id
Agent updates a slot. **Allowed only when `status === "draft"`.**

**Auth:** Bearer token. Permission: `venue-slots:update`

#### Request body (JSON, all fields optional)
```json
{
  "date": "2026-04-16",
  "startTime": "10:00",
  "endTime": "11:00",
  "slotPrice": 600,
  "commissionAmount": 60,
  "totalAmount": 660,
  "status": "draft"
}
```

#### Error responses
```json
// 400 — slot is not in draft status
{ "statusCode": 400, "message": "Venue slot can only be modified when in draft status" }

// 404 — slot not found or not in agent's org
{ "statusCode": 404, "message": "Venue slot not found or does not belong to your organization" }
```

---

### PATCH /api/v1/venue-slots/admin/:id
Admin updates any slot. **Allowed only when `status === "draft"`.**
If `venueId` changes, `organizationId` is re-resolved from the new venue.

**Auth:** Bearer token. Permission: `venue-slots:adminUpdate`

---

### PATCH /api/v1/venue-slots/:id/status
Agent publishes or unpublishes a slot. **Not allowed when `bookingStatus === "booked"`.**

**Auth:** Bearer token. Permission: `venue-slots:updateStatus`

#### Request body
```json
{ "status": "publish" }
```
| Value | Description |
|---|---|
| `publish` | Make slot visible and bookable |
| `unpublish` | Hide slot from booking |

#### Error responses
```json
// 400 — slot is currently booked
{ "statusCode": 400, "message": "Cannot change status of a booked slot" }

// 404 — not found or wrong org
{ "statusCode": 404, "message": "Venue slot not found or does not belong to your organization" }
```

---

### PATCH /api/v1/venue-slots/admin/:id/status
Admin publish/unpublish any slot. Same rules as agent.

**Auth:** Bearer token. Permission: `venue-slots:adminUpdateStatus`

---

### POST /api/v1/venue-slots/:id/book
**Agent** books a slot for a customer by phone number.

**Auth:** Bearer token. Permission: `venue-slots:bookByAgent`

#### Request body
```json
{ "userPhone": "+8801711000000" }
```

**Behaviour:**
1. Slot must belong to agent's organization
2. Slot must be `status === "publish"` and `bookingStatus !== "booked"`
3. User found by phone — if not found, auto-created with `isActive: true` and `user` role
4. Commission calculated from org settings; `totalAmount = slotPrice + commissionAmount`
5. `bookingInfo` is set; entry pushed to `bookingHistory`; `bookingStatus` set to `booked`

#### Error responses
```json
// 400 — slot not published
{ "statusCode": 400, "message": "Slot is not available for booking" }

// 400 — already booked
{ "statusCode": 400, "message": "Slot is already booked" }
```

---

### POST /api/v1/venue-slots/:id/book-user
**Authenticated user** books a slot for themselves.

**Auth:** Bearer token. Permission: `venue-slots:book`

No request body — user identity taken from JWT.

Same validation and booking logic as agent booking (slot must be `publish`, not already `booked`).

---

### DELETE /api/v1/venue-slots/:id
Agent deletes a slot. **Allowed only when `status === "draft"`.**

**Auth:** Bearer token. Permission: `venue-slots:delete`

---

### DELETE /api/v1/venue-slots/admin/:id
Admin deletes any slot. **Allowed only when `status === "draft"`.**

**Auth:** Bearer token. Permission: `venue-slots:adminDelete`

---

## 8. Booking *(planned)*

**Collection**: `bookings` (to be implemented in Phase 1 Week 7–8)

### Sample Object
```js
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),               // ref → User
  slotId: ObjectId("..."),               // ref → Slot
  venueId: ObjectId("..."),              // ref → Venue (denormalized for query speed)
  bookingDate: "2026-04-15",            // YYYY-MM-DD (not datetime — just the date)
  startTime: "08:00",
  endTime: "09:00",
  status: "confirmed",                   // see BookingStatus enum
  totalAmount: 452.50,                   // slot price + platform fee
  paymentStatus: "paid",                 // see PaymentStatus enum
  paymentMethod: "wallet",               // see PaymentMethod enum
  qrToken: "eyJhbGci...",               // signed UUID for QR check-in
  notes: "Please prepare 2 rackets.",    // optional user note
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Enums
```js
BookingStatus  = "pending" | "confirmed" | "cancelled" | "completed"
PaymentStatus  = "unpaid" | "paid" | "refunded"
PaymentMethod  = "wallet" | "sslcommerz" | "stripe"
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | ObjectId | Yes | Who made the booking |
| `slotId` | ObjectId | Yes | Which time slot |
| `venueId` | ObjectId | Yes | Denormalized venue ref for fast queries |
| `bookingDate` | String | Yes | Date in `YYYY-MM-DD` format |
| `startTime` | String | Yes | Actual start time `"HH:mm"` |
| `endTime` | String | Yes | Actual end time `"HH:mm"` |
| `status` | String (enum) | Yes | Booking lifecycle status |
| `totalAmount` | Number | Yes | Final amount charged |
| `paymentStatus` | String (enum) | Yes | Payment lifecycle status |
| `paymentMethod` | String (enum) | No | How payment was made |
| `qrToken` | String | No | Signed token for QR check-in validation |
| `notes` | String | No | Customer notes/requests |

---

## 9. WalletTransaction *(planned)*

**Collection**: `wallet_transactions` (to be implemented in Phase 2 Week 13–14)

### Sample Object
```js
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),               // ref → User
  type: "debit",                         // "credit" | "debit"
  amount: 450,                           // positive number always
  reference: "booking_69d75680...",      // what triggered this transaction
  description: "Payment for The Kinetic Arena — Apr 15, 08:00 AM",
  createdAt: ISODate("...")
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | ObjectId | Yes | Wallet owner |
| `type` | String (enum) | Yes | `"credit"` (money in) \| `"debit"` (money out) |
| `amount` | Number | Yes | Always positive. Type determines direction |
| `reference` | String | Yes | ID or label of triggering event |
| `description` | String | Yes | Human-readable description |

---

## 10. Review *(planned)*

**Collection**: `reviews` (to be implemented in Phase 2)

### Sample Object
```js
{
  _id: ObjectId("..."),
  venueId: ObjectId("..."),              // ref → Venue
  userId: ObjectId("..."),               // ref → User
  bookingId: ObjectId("..."),            // ref → Booking (one review per booking)
  rating: 5,                             // integer 1–5
  comment: "Excellent courts, very clean and well maintained.",
  createdAt: ISODate("...")
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `venueId` | ObjectId | Yes | Which venue is reviewed |
| `userId` | ObjectId | Yes | Who wrote the review |
| `bookingId` | ObjectId | Yes | Linked booking (prevents fake reviews) |
| `rating` | Number | Yes | Integer 1–5 |
| `comment` | String | No | Optional written review |

---

## 11. Category *(planned)*

**Collection**: `categories` (to be implemented — used to classify venue types with visual identity)

### Sample Object
```js
{
  _id: ObjectId("69d75680eeb57da0521e5001"),
  title: "Badminton",
  image: "https://cdn.example.com/categories/badminton.jpg",
  createdAt: ISODate("2026-04-09T07:34:24.356Z"),
  updatedAt: ISODate("2026-04-10T02:23:42.188Z"),
  __v: 0
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `title` | String | Yes | Unique. Display name e.g. `"Badminton"`, `"Futsal"`, `"Cricket Turf"` |
| `image` | String | Yes | URL to category banner/icon image |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

### Relationships
- Referenced by `Venue.categoryId` (one-to-many: many venues belong to one category)

### Sample Data
```js
[
  { title: "Badminton",     image: "https://cdn.example.com/categories/badminton.jpg" },
  { title: "Futsal",        image: "https://cdn.example.com/categories/futsal.jpg" },
  { title: "Cricket Turf",  image: "https://cdn.example.com/categories/cricket.jpg" },
  { title: "Basketball",    image: "https://cdn.example.com/categories/basketball.jpg" },
  { title: "Tennis",        image: "https://cdn.example.com/categories/tennis.jpg" },
  { title: "Swimming",      image: "https://cdn.example.com/categories/swimming.jpg" },
  { title: "Gym",           image: "https://cdn.example.com/categories/gym.jpg" },
  { title: "Yoga Studio",   image: "https://cdn.example.com/categories/yoga.jpg" },
]
```

---

## 12. Relationship Map

```
Permission
  └── referenced by → Role.permissions[]

Role
  └── referenced by → User.roles[]

User
  ├── organization → Organization._id  (agent users only)
  └── roles[]     → Role._id

Organization
  └── agentId → User._id

OTP
  └── standalone (phone-based lookup, no ObjectId ref)

Venue
  ├── organizationId → Organization._id
  ├── categoryId     → Category._id
  └── features[]     → VenueFeature._id

VenueSlot
  ├── organizationId              → Organization._id
  ├── venueId                     → Venue._id
  ├── bookingInfo.userId          → User._id
  └── bookingHistory[].userId     → User._id

── Planned ──────────────────────────────────────────

Booking
  ├── userId   → User._id
  ├── slotId   → VenueSlot._id
  └── venueId  → Venue._id (denormalized)

WalletTransaction
  └── userId → User._id

Review
  ├── venueId    → Venue._id
  ├── userId     → User._id
  └── bookingId  → Booking._id
```

---

## JWT Payload

The JWT token issued on login contains:
```js
{
  sub: "69d75680a6dbe87a871dbd58",   // User._id as string
  phone: "+8801747102896",
  iat: 1775789949,
  exp: 1776394749                    // 7 days default (JWT_EXPIRES_IN)
}
```

The `JwtStrategy` validates the token and attaches the full populated `User` object (with roles and permissions) to `request.user` on every authenticated request.
