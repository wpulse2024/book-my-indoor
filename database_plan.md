# BookMyIndoor — Complete Data Structure Reference

All collections use **MongoDB** via **Mongoose**. Timestamps (`createdAt`, `updatedAt`) are automatic on all collections unless noted.

---

## Table of Contents
1. [User](#1-user)
2. [Role](#2-role)
3. [Permission](#3-permission)
4. [Organization](#4-organization)
5. [OTP](#5-otp)
6. [Venue *(planned)*](#6-venue-planned)
7. [Slot *(planned)*](#7-slot-planned)
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

## 6. Venue *(planned)*

**Collection**: `venues` (to be implemented in Phase 1 Week 5–6)

### Sample Object
```js
{
  _id: ObjectId("..."),
  organizationId: ObjectId("69d75680eeb57da0521b3152"),  // ref → Organization
  name: "The Kinetic Arena",
  slug: "the-kinetic-arena",              // URL-friendly unique identifier
  type: "badminton",                      // see VenueType enum below
  description: "Premium 6-court badminton facility with AC and changing rooms.",
  address: "House 12, Road 5, Gulshan 2, Dhaka",
  area: "Gulshan",
  city: "Dhaka",
  lat: 23.7925,
  lng: 90.4078,
  coverImage: "https://cdn.example.com/kinetic-cover.jpg",
  images: [
    "https://cdn.example.com/kinetic-1.jpg",
    "https://cdn.example.com/kinetic-2.jpg"
  ],
  amenities: ["AC", "Changing Room", "Parking", "Free Wifi", "Showers"],
  rating: 4.9,                            // aggregated from reviews
  reviewCount: 128,
  isActive: true,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### VenueType Enum
```
"cricket_turf" | "badminton" | "futsal" | "basketball" | "tennis"
"swimming" | "gym" | "yoga_studio" | "other"
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | ObjectId | Yes | Ref to Organization |
| `name` | String | Yes | Venue display name |
| `slug` | String | Yes | Unique URL slug |
| `type` | String (enum) | Yes | Sport/activity type |
| `description` | String | No | Full description |
| `address` | String | Yes | Full street address |
| `area` | String | Yes | Neighborhood/area name |
| `city` | String | Yes | City |
| `lat` | Number | Yes | GPS latitude |
| `lng` | Number | Yes | GPS longitude |
| `coverImage` | String | No | Main image URL |
| `images` | String[] | No | Gallery image URLs |
| `amenities` | String[] | No | List of available amenities |
| `rating` | Number | No | Avg rating 1–5 (computed) |
| `reviewCount` | Number | No | Total review count (computed) |
| `isActive` | Boolean | No | Default: `true` |

---

## 7. Slot *(planned)*

**Collection**: `slots` (to be implemented in Phase 1 Week 5–6)

### Sample Object
```js
{
  _id: ObjectId("..."),
  venueId: ObjectId("..."),              // ref → Venue
  name: "Morning Session",
  startTime: "08:00",                    // HH:mm format
  endTime: "09:00",
  durationMinutes: 60,
  basePrice: 450,                        // in BDT (Taka)
  maxCapacity: 10,                       // max concurrent bookings
  isActive: true,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `venueId` | ObjectId | Yes | Ref to Venue |
| `name` | String | Yes | Slot display name |
| `startTime` | String | Yes | Format: `"HH:mm"` |
| `endTime` | String | Yes | Format: `"HH:mm"` |
| `durationMinutes` | Number | Yes | Session length in minutes |
| `basePrice` | Number | Yes | Default price in BDT |
| `maxCapacity` | Number | Yes | Max simultaneous bookings |
| `isActive` | Boolean | No | Default: `true` |

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

── Planned ──────────────────────────────────────────

Venue
  └── organizationId → Organization._id

Slot
  └── venueId → Venue._id

Booking
  ├── userId   → User._id
  ├── slotId   → Slot._id
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
