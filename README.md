# ⚡ Skill Relay — Campus Skill & Help Exchange

**Skill Relay** is a full-stack campus skill exchange platform where college students give and receive academic and extracurricular help in exchange for platform credits instead of real money.

---

## 🌟 Core Features

1. **Authentication & Campus Profile**
   - Email sign-up with college domain, JWT auth with bcrypt encryption.
   - Dual-role profiles: every user is both a **giver** (`skillsOffered`) and **attainer** (`skillsWanted`).
   - Every new account starts with **100 welcome credits**.

2. **Request & Offer Board**
   - Post a **Request** (*"Need help with X"*) or an **Offer** (*"Can help with Y"*).
   - Filter by skill tags, urgency (Quick Ask: 15–30m vs. Full Session: 1h), and search by keyword.
   - **Smart Recommendation Engine**: matches your listed skills to relevant open peer requests.

3. **Session Flow & Atomic Credit Escrow**
   - Connect on a post → Author accepts → Live session workspace opens.
   - **Mutual Confirmation**: Credits move **only** when *both* requester and helper click "Mark Complete".
   - **Server-Side Atomic Transfer**: debits requester's balance and credits helper's balance with an immutable transaction ledger.

4. **Real-Time Chat & Push Notifications**
   - Dedicated in-session chat with real-time Socket.io delivery, typing indicators, and system notices.
   - Live notification center for session requests, acceptances, and completions.

5. **Ratings, Reviews & Leaderboard**
   - 5-star rating system with recalculation of user reputation upon session completion.
   - Campus Contributor Hall of Fame podium ranking top helpers by credits earned and sessions completed.

6. **Phase 2 Perks Store (Preview)**
   - Disabled preview of campus perks (coffee vouchers, library study rooms, 3D printing lab access).

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB](https://www.mongodb.com/) *(Optional — an embedded in-memory MongoDB will automatically start if no local MongoDB service is detected)*

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install separately inside `/server` and `/client`)*:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in the `server` directory:
```bash
cp server/.env.example server/.env
```

**Default server `.env` settings:**
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/skill-relay
JWT_SECRET=skill_relay_campus_secret_key_2026_jwt
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Demo Data (Optional - auto-seeds on first run)
```bash
npm run seed --prefix server
```

### 4. Start Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧪 Pre-Seeded 1-Click Demo Personas

Use the **1-Click Demo Switcher** at the top of the app or log in using `password123`:

| Student | Major | Skills Offered | Balance |
| :--- | :--- | :--- | :--- |
| **Alex Chen** (`alex@campus.edu`) | CS Senior | React, Python, Git, Data Structures | 🪙 160 |
| **Maya Patel** (`maya@campus.edu`) | HCI / Design Junior | Figma, UI/UX, Resume Review, Tailwind | 🪙 130 |
| **Jordan Reed** (`jordan@campus.edu`) | Applied Math / Physics | Linear Algebra, Calculus, Statistics | 🪙 110 |
| **Priya Sharma** (`priya@campus.edu`) | Pre-Med / BioChem | Organic Chemistry, Biology, Lab Prep | 🪙 80 |
| **Marcus Vance** (`marcus@campus.edu`) | Business & Marketing | Pitch Decks, Public Speaking, Spanish | 🪙 100 |

---

## 🏗️ Architecture & Tech Stack

```
skill-relay/
├── server/
│   ├── src/
│   │   ├── config/      # DB with auto-fallback to MongoMemoryServer
│   │   ├── models/      # User, Post, Session, Transaction, Review, Message, Notification
│   │   ├── controllers/ # Auth, Posts, Sessions, Credits, Ledger, Reviews, Leaderboard
│   │   ├── middleware/  # JWT Auth & centralized error handling
│   │   ├── socket/      # Socket.io real-time chat & notifications
│   │   └── server.js    # Express HTTP server
│   └── tests/           # Automated API & atomic settlement test suite
└── client/
    ├── src/
    │   ├── context/     # AuthContext, SocketContext, NotificationContext
    │   ├── components/  # PostCard, MutualConfirmCard, SessionChat, Ledger, Leaderboard
    │   └── pages/       # Dashboard, PostDetail, SessionWorkspace, Profile, Leaderboard
```

---

## 🚢 Deployment Target

- **Frontend:** Vercel (Set `VITE_API_URL` pointing to Render backend URL)
- **Backend:** Render (Set `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`)
