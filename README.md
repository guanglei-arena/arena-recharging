# 🌿 Arena Pause — Sleep Pod Recharging Lounge

A mindful full-stack web application for internal team recharging. Reserve an organic sleep pod for a
restorative nap, volunteer as a wake-up buddy, and let a randomly assigned volunteer wake teammates
whose nap time is up.

## Features

| Feature | Where | Description |
|---|---|---|
| **Organic Earth Theme** | Everywhere | Calming, natural terracotta, sage green, warm ochre, and warm stone/linen aesthetics |
| **Home Page** | `/` | Clean action buttons (name and icon only) plus live pod availability status |
| **How It Works Tab** | `/how-it-works` | Dedicated guide detailing the complete flow and pause principles |
| **Pods List & Calendar** | `/nap` | 3 pods (Monterey, Big Sur, Half Moon Bay) with live vacant/occupied statuses & timeline booking |
| **Dedicated Sleep Screen** | `/sleep` | Tranquil, distraction-free screen accessible to scheduled sleepers with an "I am awake" button |
| **Volunteer Pool & Meeting Decline** | `/wake` | Randomly assigned wakers can decline duty (e.g. if in a meeting), automatically reassigning duty to another volunteer |
| **Waking Alert System** | `/wake` & 🔔 | Assigned waker wakes time-up teammates, or sleeper self-exits |
| **Demo Users** | Top Bar | Switch between Wei-lin, anastasios, Guanglei, and Tony |

## Demo Users

- **Wei-lin**: Currently sleeping in Monterey (power recharge). Use to test the "I am sleeping" button on the Home page and dedicated `/sleep` mode!
- **anastasios**: Currently has a nap in Big Sur that reached "time up" to test wake alerts.
- **Guanglei**: Assigned wake-up volunteer on duty. Use to test waking anastasios, or click "Decline offer (in a meeting)" to test auto-reassignment!
- **Tony**: Scheduled upcoming nap in Half Moon Bay and member of the volunteer pool.

## Tech Stack

- **Frontend:** React 18 + React Router + Vite (Organic earth-themed CSS)
- **Backend:** Node.js + Express, in-memory store seeded with live demo data
- **Realtime State:** UI polling every few seconds keeping pod occupancy, time-up alerts, and volunteer assignments live

## Running the App

```bash
npm install
npm run build   # builds the client into client/dist
npm start       # serves the app + API on http://0.0.0.0:3001
```

## API Endpoints

```
GET  /api/state                        full app state
POST /api/reservations                 book a pod {podId, userId, start, end, note}
POST /api/wakers/signup                volunteer for wake-up pool {userId}
POST /api/wakers/resign                remove from wake-up pool {userId}
POST /api/wakers/assign                randomly assign an on-duty waker
POST /api/wakers/reject                decline duty offer & auto-reassign {userId}
POST /api/reservations/:id/wake        mark time-up napper as woken {userId}
POST /api/reservations/:id/exit        sleeper self-exits / marks awake {userId}
POST /api/notifications/read           mark notifications as read {userId}
```
