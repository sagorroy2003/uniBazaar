# UniBazaar Product Specification

> **Product:** UniBazaar
> **Type:** University community marketplace
> **Current focus:** Marketplace MVP
> **Long-term vision:** Marketplace + Campus Stores

---

# 1. Product Vision

UniBazaar is a marketplace designed specifically for a university community.

Its purpose is to make it easier for students to:

* sell things they no longer need
* discover things other students are selling
* find useful products within their campus community
* connect directly with sellers
* support small businesses operated by students

The central idea is:

> **UniBazaar helps students discover sellers and connect with them.**

UniBazaar does not need to process the actual transaction in its first version.

---

# 2. Problem Statement

Students commonly buy and sell things through:

* Facebook groups
* Messenger groups
* personal contacts
* scattered social media posts

These channels create several problems.

### Discovery is difficult

A buyer looking for a calculator, bicycle, textbook, furniture, or electronics may need to scroll through many unrelated posts.

### Listings disappear quickly

A useful selling post can become buried under newer posts.

### Information is inconsistent

Different sellers provide different amounts of information, and there is no consistent listing structure.

### Old listings remain visible

A seller may forget to update a post after an item is sold.

### Small student businesses are hard to discover

Students running small campus businesses may have no dedicated place to showcase what they sell.

UniBazaar aims to provide a focused and organized alternative.

---

# 3. Target Users

UniBazaar primarily serves university students.

A single user can act as both a buyer and a seller.

## Buyer

A student who wants to discover or purchase something from another student.

Typical behavior:

```text
Browse
  ↓
Search / Filter
  ↓
View listing
  ↓
Contact seller
  ↓
Discuss
  ↓
Deal
```

## Seller

A student who wants to sell something.

Typical behavior:

```text
Create listing
  ↓
Publish
  ↓
Receive buyer contacts
  ↓
Discuss externally
  ↓
Complete deal
  ↓
Mark sold
```

## Student Business Owner

A student who operates an ongoing small business.

This user type becomes especially important for the future **Campus Stores** feature.

---

# 4. Product Structure

The long-term UniBazaar product contains two major areas:

```text
                    UNIBAZAAR
                        │
          ┌─────────────┴─────────────┐
          │                           │
      🛒 Marketplace             🏪 Campus Stores
          │                           │
   One-off / personal           Ongoing student
      selling                     businesses
```

## Marketplace

The current MVP.

Designed primarily for student-to-student buying and selling.

## Campus Stores

A future major feature for student-run businesses.

---

# 5. Marketplace

## 5.1 Purpose

The Marketplace is where students post items they want to sell.

Typical examples include:

* books
* calculators
* bicycles
* electronics
* furniture
* clothes
* hall / room items
* academic materials
* used personal belongings
* moving-out items

---

# 6. Listing Types

UniBazaar should support two listing concepts.

## 6.1 Single-item Listing

A listing represents one item.

Example:

```text
Casio Calculator
৳800

Used
Good condition
Hall 3
```

A single-item listing should contain enough information for a buyer to understand what is being sold.

Typical fields:

* title
* description
* price
* category
* location
* images
* seller
* availability status
* contact options

---

# 7. Multiple-item / Bundle Listing

Students may sometimes want to sell several items together.

Common examples:

* moving out
* changing halls
* graduating
* leaving campus
* selling household items

Example:

```text
Moving Out Sale

Study Chair      ৳800
Fan              ৳1200
Mattress         ৳1500
Books            ৳500
Rice Cooker      ৳900
```

Instead of creating many independent posts, a seller should eventually be able to create one bundle listing containing multiple items.

## Bundle requirements

A bundle should allow:

* multiple items under one listing
* item-level titles
* item-level prices
* item-level availability
* item-level identification
* buyer discovery of individual items

Example:

```text
Moving Out Sale

🟢 Study Chair      ৳800
🔴 Fan             SOLD
🟢 Mattress         ৳1500
🔴 Books            SOLD
🟢 Rice Cooker      ৳900
```

The bundle itself can remain visible while individual items change availability.

### Important implementation rule

Bundle listings should be implemented **after the core single-item marketplace is stable**.

Do not let bundle complexity delay the MVP.

---

# 8. Marketplace Discovery

Discovery is one of the most important responsibilities of UniBazaar.

Users should be able to:

* browse the marketplace
* search listings
* filter by category
* view product details
* identify available / sold items
* see useful listing information
* discover recent listings

The goal is:

> **Finding something should be easier than searching through a social-media feed.**

---

# 9. Search

Search should eventually support keyword-based discovery.

Examples:

```text
calculator
bicycle
physics book
study table
headphone
```

Search should consider appropriate product text such as:

* title
* description
* bundle item names where applicable

Search behavior should remain simple and understandable for the MVP.

---

# 10. Categories

Listings should belong to predefined categories.

Examples may include:

* Books
* Electronics
* Furniture
* Clothing
* Accessories
* Academic
* Sports
* Hall / Room
* Other

The actual category list can evolve according to real usage.

Do not create an unnecessarily complicated category hierarchy for the MVP.

---

# 11. Listing Lifecycle

A marketplace listing needs a clear lifecycle.

The conceptual states are:

```text
ACTIVE
SOLD
EXPIRED
```

## 11.1 ACTIVE

The seller is still offering the item.

It should normally appear in default marketplace discovery.

## 11.2 SOLD

The seller confirms that the item has been sold.

The item should no longer behave like an available listing.

## 11.3 EXPIRED

The listing has become stale and the seller has not confirmed whether it is still available.

Important:

> **EXPIRED does not mean SOLD.**

UniBazaar cannot know whether a deal happened outside the platform.

The seller remains the source of truth.

---

# 12. Seller Forgetfulness / Stale Listings

A real-world problem is that sellers may forget to mark an item as sold.

UniBazaar should not rely entirely on seller discipline.

The intended long-term behavior is:

```text
Post
 ↓
ACTIVE
 ↓
Availability reminder
 ↓
Seller confirms
 ├── Still available → remain ACTIVE
 └── Sold → SOLD
```

If a seller does not respond for an appropriate period:

```text
ACTIVE
   ↓
EXPIRED
```

An expired listing can later be renewed or reactivated.

### Important rule

Do not automatically convert an old listing into `SOLD`.

Old does not necessarily mean sold.

---

# 13. Buyer-Seller Communication

UniBazaar is **not an internal chat platform**.

The goal is:

```text
Discover
   ↓
Connect
   ↓
Communicate externally
   ↓
Deal
```

The initial product should use external communication channels such as:

* WhatsApp
* Messenger
* Email

The exact supported channels may evolve.

---

# 14. Contact Seller

A product detail page should provide a clear action such as:

```text
[ Contact Seller ]
```

The user should then be able to choose an available communication method.

Conceptually:

```text
        Contact Seller
               │
       ┌───────┼───────┐
       ↓       ↓       ↓
   WhatsApp Messenger Email
```

Only contact methods enabled by the seller should be exposed.

Private contact information should not be unnecessarily shown directly on listing cards or public product feeds.

---

# 15. Why There Is No In-App Chat

An internal chat system would introduce a large amount of complexity:

* conversations
* messages
* real-time communication
* WebSockets / Socket.IO
* unread state
* notifications
* moderation
* message persistence
* spam management

None of this is required to solve the core marketplace problem.

Therefore:

> **No internal chat is part of the MVP.**

External communication platforms are sufficient for the initial product.

---

# 16. Deal Completion

The actual deal may happen outside UniBazaar.

For example:

```text
Buyer
  ↓
Contact Seller
  ↓
WhatsApp
  ↓
Discussion
  ↓
Agree on price / meeting
  ↓
Deal completed
  ↓
Seller returns to UniBazaar
  ↓
Mark as Sold
```

UniBazaar does not need to verify the financial transaction in the MVP.

---

# 17. Seller Management

A seller should be able to manage their own listings.

Core actions:

* create
* view
* edit
* delete
* mark sold
* eventually renew expired listings

A seller must not be able to modify another user's listings.

Ownership must be enforced by the backend.

---

# 18. Campus Stores

Campus Stores represent the long-term expansion of UniBazaar.

They are intended for students who operate ongoing businesses on campus.

Examples:

* seasonal fruit sellers
* jewelry sellers
* saree / clothing sellers
* umbrella sellers
* food sellers
* gift / accessory sellers
* other small student businesses

---

# 19. Marketplace vs Campus Store

This distinction is fundamental.

## Marketplace

> **"I am selling this item."**

Examples:

```text
Used calculator
Old bicycle
Physics book
Study table
```

Usually one-off or personal selling.

## Campus Store

> **"I run this business."**

Examples:

```text
Jewelry store
Fruit business
Clothing store
Umbrella business
Food business
```

Usually an ongoing seller with multiple products.

---

# 20. Campus Store Concept

A future Campus Store should look conceptually like:

```text
🏪 Riya's Jewelry

About the Store

💍 Earrings
💎 Necklace
✨ Bracelet

📍 NSTU Campus

[ Contact Store ]
```

A store should eventually contain:

* store name
* owner
* description
* location
* contact methods
* multiple products
* store status

### Important

Campus Stores are **not an MVP blocker**.

Do not build a complete store management system before the core Marketplace is stable.

---

# 21. MVP Scope

The MVP should focus on the simplest complete marketplace loop.

## MVP Core

### Authentication

* university-focused registration
* login
* secure password handling
* protected user actions

### Marketplace

* create listing
* browse listings
* search
* category filtering
* product details
* images
* seller information
* seller contact
* seller listing management
* mark sold

### Marketplace maintenance

* listing status
* stale listing handling
* authorization / ownership checks

---

# 22. Explicitly Out of MVP

The following are intentionally postponed:

* shopping cart
* checkout
* online payment
* delivery management
* internal chat
* complex orders
* reviews
* ratings
* seller analytics
* AI recommendations
* advanced notifications infrastructure
* microservices
* Redis
* Kafka
* Kubernetes
* unnecessary state-management infrastructure

These are not bad ideas.

They are simply not necessary to validate the core UniBazaar concept.

---

# 23. Product Success Criteria

The first meaningful version of UniBazaar should allow this entire flow to work:

```text
Student
   ↓
Register / Login
   ↓
Create listing
   ↓
Listing becomes discoverable
   ↓
Another student searches
   ↓
Opens listing
   ↓
Contacts seller
   ↓
Discussion happens externally
   ↓
Deal happens
   ↓
Seller marks sold
```

If this loop works reliably, UniBazaar has achieved its core purpose.

---

# 24. Product Design Principles

## Simplicity

Do not add a feature merely because other marketplaces have it.

## Campus-first

Features should be designed around real university behavior.

## Discovery-first

Finding relevant items should be fast and clear.

## Connection-first

UniBazaar should help people connect rather than trying to replace every external service.

## Trust

University-focused access, seller-controlled information, ownership checks, and clean listing states should support a trustworthy environment.

## Extensibility

The architecture should remain capable of supporting future features such as Campus Stores without making the MVP unnecessarily complex.

---

# 25. Future Roadmap

Potential future features include:

### Marketplace

* favorites / saved listings
* better search
* availability reminders
* bundle listings
* reputation / reviews
* richer seller profiles
* notifications

### Campus Stores

* store profiles
* store catalogs
* store discovery
* store management
* business-focused seller tools

### Platform

* moderation
* administration
* analytics
* stronger trust and safety features

Future features should be prioritized based on actual user needs rather than assumptions.

---

# 26. Product Decision Rule

Whenever a new feature is proposed, ask:

> **What problem does this solve for a university student?**

Then evaluate:

1. Does it improve discovery?
2. Does it improve selling?
3. Does it improve buyer-seller connection?
4. Does it improve listing management?
5. Does it improve trust or marketplace quality?
6. Is it necessary for the MVP?

If not, prefer placing it in the future backlog instead of implementing it immediately.

---

# 27. Current MVP Priority

The current priority order is:

```text
1. Authentication
2. Marketplace listings
3. Product browsing
4. Search
5. Category filtering
6. Product details
7. Seller contact
8. Seller listing management
9. Sold state
10. Expiration / renewal
11. Bundle listings
12. Deployment
13. End-to-end testing
```

The priority may change as real development and user feedback reveal new information.

---

# 28. Final Product Statement

UniBazaar is not trying to become a giant e-commerce platform.

It is trying to become:

> **The place where students can easily find, sell, and discover things within their university community.**

The core product is:

```text
POST
  ↓
DISCOVER
  ↓
CONNECT
  ↓
DEAL
  ↓
MARK SOLD
```

And the long-term vision expands that into:

```text
                 UNIBAZAAR
                     │
          ┌──────────┴──────────┐
          │                     │
      🛒 Marketplace        🏪 Campus Stores
          │                     │
      One-off sales         Student businesses
          │                     │
          └──────────┬──────────┘
                     │
             UNIVERSITY COMMUNITY
```
