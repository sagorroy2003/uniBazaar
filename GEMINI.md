# Gemini Development Guide — UniBazaar

## 1. What This File Is

This file defines how AI assistants should work on the UniBazaar repository.

It is a development guide, not a replacement for the product specification.

Before making substantial product or architecture decisions, refer to:

* `README.md` — project overview
* `docs/PRODUCT_SPEC.md` — product requirements and decisions
* `docs/ARCHITECTURE.md` — current technical architecture

Do not invent new product requirements without discussing them first.

---

# 2. Project Context

UniBazaar is a university community marketplace.

The long-term product has two major areas:

1. 🛒 Marketplace
2. 🏪 Campus Stores

The **Marketplace is the current MVP priority**.

Campus Stores are a future major feature and should not unnecessarily increase MVP complexity.

---

# 3. Product Philosophy

UniBazaar is primarily a:

> **Discovery + Connection platform for university students.**

It is not initially intended to be:

* a payment platform
* an order-management platform
* a delivery platform
* a social network
* a chat application

The basic marketplace loop is:

```text
Seller creates listing
        ↓
Buyer discovers listing
        ↓
Buyer views details
        ↓
Buyer contacts seller
        ↓
Buyer and seller communicate externally
        ↓
Deal happens
        ↓
Seller marks item as sold
```

The actual conversation may happen through external services such as WhatsApp or Messenger.

---

# 4. Current MVP

Prioritize features that directly support:

### Seller

* create listing
* upload product images
* specify title
* specify description
* specify price
* select category
* specify location
* manage own listings
* edit listings
* delete listings
* mark items as sold

### Buyer

* browse listings
* search listings
* filter by category
* open product details
* see relevant seller information
* contact seller through supported external communication methods

### Marketplace maintenance

* prevent unauthorized listing modifications
* distinguish active, sold, and eventually expired listings
* keep stale listings under control

---

# 5. Listing Types

The product is expected to support two listing concepts.

## Single Item

A normal listing representing one item.

Example:

```text
Casio Calculator
৳800
Used
Good condition
```

## Multiple Item / Bundle Listing

A seller may want to sell several items together in one post.

Example:

```text
Moving Out Sale

Study Chair     ৳800
Fan             ৳1200
Mattress        ৳1500
Books           ৳500
Rice Cooker     ৳900
```

Bundle listings should eventually allow individual items to remain identifiable and independently become sold/unavailable.

Do not implement bundle functionality prematurely if the core single-item marketplace is not stable.

---

# 6. Listing Lifecycle

The conceptual listing states are:

```text
ACTIVE
SOLD
EXPIRED
```

### ACTIVE

The listing is currently available.

### SOLD

The seller explicitly confirms that the item was sold.

### EXPIRED

The listing has become stale and the seller has not confirmed availability.

Important:

> EXPIRED does not mean SOLD.

UniBazaar cannot directly observe a deal that happened through WhatsApp, Messenger, or another external communication service.

The seller is the source of truth for whether an item was sold.

Future implementations may include availability reminders and renewal flows.

---

# 7. Communication Rules

Do not implement an internal chat system for the MVP.

Do not introduce:

* Socket.IO
* WebSockets
* message tables
* conversation tables
* unread-message systems
* typing indicators
* real-time chat infrastructure

unless explicitly requested later.

Instead, use a simple contact flow:

```text
Product
   ↓
Contact Seller
   ↓
WhatsApp / Messenger / other supported method
```

The seller controls which contact methods are exposed.

Do not unnecessarily expose private contact information directly on public listing cards.

---

# 8. Campus Stores

Campus Stores are part of the long-term UniBazaar vision.

They are intended for students who operate ongoing small businesses such as:

* seasonal fruit businesses
* jewelry businesses
* clothing/saree businesses
* umbrella sellers
* food businesses
* other small campus businesses

The conceptual distinction is:

```text
Marketplace:
"I am selling this item."

Campus Store:
"I run this business."
```

Campus Stores should remain extensible in the architecture but should not dominate the MVP implementation.

---

# 9. Explicitly Out of Scope for MVP

Do not add the following simply because they are common e-commerce features:

* shopping cart
* checkout
* online payment
* delivery tracking
* internal chat
* complex order management
* reviews
* ratings
* seller analytics
* AI recommendations
* microservices
* Redis
* Kafka
* Kubernetes
* unnecessary event-driven infrastructure
* unnecessary state-management frameworks
* unnecessary abstraction layers

These are possible future features only if the product requirements justify them.

---

# 10. Current Technology Stack

The existing application uses:

### Frontend

* Next.js
* React
* TypeScript

### Backend

* Node.js
* Express
* TypeScript

### Database

* MySQL

### ORM

* Prisma

### Authentication

* JWT
* bcrypt

### Image Hosting

* Cloudinary

Continue with the existing architecture unless there is a concrete technical reason to change it.

Do not rewrite the application merely to use a different framework or library.

---

# 11. Development Philosophy

The project is also a learning project.

The developer is still learning:

* React
* Next.js
* TypeScript
* Express
* Prisma
* full-stack development

Therefore:

### Prefer

* readable code
* simple solutions
* explicit logic
* small changes
* understandable architecture
* existing project conventions
* reusable but not over-engineered components

### Avoid

* unnecessary abstractions
* overly clever code
* advanced patterns without clear benefit
* major rewrites
* introducing libraries for trivial problems
* code that works but is impossible for a beginner to understand

The goal is:

> **Simple today, adaptable tomorrow.**

---

# 12. Important: Inspect Before Changing

UniBazaar is an existing codebase.

Never assume a feature is missing.

Before implementing or modifying anything:

1. inspect the relevant files
2. identify what already exists
3. understand the current data flow
4. identify the actual missing behavior
5. propose the smallest reasonable change
6. implement only the necessary changes
7. test the result

Do not rewrite unrelated working code.

Do not replace existing architecture without a concrete reason.

---

# 13. AI-Assisted Development Workflow

Use this workflow for feature work:

```text
Requirement
    ↓
Inspect existing code
    ↓
Understand current behavior
    ↓
Plan the smallest change
    ↓
Implement
    ↓
Run locally
    ↓
Test
    ↓
Fix issues
    ↓
Explain important decisions
    ↓
Commit
```

A feature should normally be implemented in a focused change rather than combining many unrelated changes.

---

# 14. Explain Before Hiding Complexity

The developer is learning the technologies used in UniBazaar.

When introducing unfamiliar code, explain:

* what the code does
* why it is needed
* which layer it belongs to
* how it interacts with existing code
* whether it changes the database
* whether it changes an API
* whether it changes frontend behavior

Do not dump large amounts of unexplained code when a smaller change is sufficient.

---

# 15. Database Changes

The database is currently MySQL accessed through Prisma.

Before changing the database:

1. inspect the current Prisma schema
2. inspect existing migrations
3. identify affected relationships
4. consider existing data
5. make the smallest compatible schema change

Never casually delete or rename existing fields/models.

When a schema change is necessary:

* explain why
* create the appropriate migration
* update backend logic
* update frontend types/data usage if necessary
* test the affected flow

---

# 16. API Changes

When changing or adding an API endpoint:

Document mentally and, when appropriate, explicitly:

```text
Method:
Route:
Authentication:
Request:
Response:
Errors:
```

For example:

```text
POST /products

Authentication:
Required

Request:
{
  title,
  description,
  price,
  categoryId
}

Response:
created product
```

Keep API behavior consistent with the existing backend conventions.

---

# 17. Authentication & Authorization

Authentication currently uses JWT.

Protected actions must verify the authenticated user.

For ownership-based operations:

```text
User A must not be able to modify User B's listing.
```

Never trust a `userId` supplied by the frontend when the authenticated user identity can be derived from the JWT.

Authorization must be enforced on the backend, not only by hiding frontend buttons.

---

# 18. Product and Seller Privacy

Seller contact methods are intentionally controlled.

Possible contact methods include:

* WhatsApp
* Messenger
* Email
* other explicitly supported channels

A contact method should only be exposed when the seller has enabled it and the required information exists.

Avoid unnecessarily returning private contact details through public APIs.

---

# 19. Frontend Development Rules

Prefer the simplest React/Next.js implementation that fits the feature.

Avoid introducing additional state-management libraries unless the existing application genuinely requires them.

Before creating a new component:

* check whether an existing component can be reused
* keep components focused
* avoid giant components when a clear split improves readability

Keep client-side behavior intentional.

Do not convert components to client components unnecessarily.

---

# 20. Next.js Guidance

The project currently uses the Next.js App Router.

When working with Next.js:

* understand whether a component is server or client
* use client components only when necessary
* avoid unnecessary server/client complexity
* follow the existing routing structure
* avoid major framework-level changes without justification

The project should remain understandable to someone learning React and Next.js.

---

# 21. TypeScript Guidance

Use TypeScript for safety and clarity.

Prefer:

* explicit types for important data structures
* typed function parameters
* typed API responses where practical
* clear interfaces/types

Avoid advanced TypeScript type tricks unless genuinely useful.

The goal is readable TypeScript, not impressive TypeScript.

---

# 22. Git and Change Discipline

Keep changes focused.

Prefer:

```text
feat: add product search
fix: prevent unauthorized product deletion
docs: update marketplace specification
refactor: simplify product card
```

Avoid commits that mix unrelated work.

Before a commit:

* run the relevant tests or smoke checks
* verify there are no accidental unrelated changes
* review the diff

---

# 23. Do Not Silently Change Product Requirements

If an implementation idea conflicts with the product specification:

**Stop and explain the conflict.**

Do not silently:

* add a cart
* introduce a payment system
* add internal chat
* change the marketplace concept
* introduce new user roles
* redesign the database
* replace the framework

Ask for a product decision when necessary.

---

# 24. Product Decision Priority

When requirements conflict, use this order:

```text
1. Explicit current user instruction
2. docs/PRODUCT_SPEC.md
3. README.md
4. Existing implementation
5. Old plans / assumptions
6. AI preference
```

The AI's preferred architecture is never more important than the current product requirements.

---

# 25. Working With New Ideas

New ideas are expected.

When a new feature is proposed:

1. identify the problem it solves
2. determine whether it belongs in the MVP
3. evaluate technical complexity
4. identify affected database/API/frontend areas
5. decide whether to implement now or add to the future backlog

Do not automatically implement every interesting idea.

---

# 26. Definition of Done

A feature is not complete merely because the code compiles.

A feature should normally be:

```text
Implemented
    +
Locally tested
    +
Existing functionality still works
    +
Authorization/security considered
    +
Relevant documentation updated
```

For important features, include a basic manual smoke test.

---

# 27. Final Rule

The most important rule for working on UniBazaar is:

> **Do not optimize for generating the most code. Optimize for making the smallest correct change that moves the product forward while keeping the code understandable.**

UniBazaar should remain:

```text
Simple enough to learn
        +
Useful enough to ship
        +
Clean enough to evolve
```
