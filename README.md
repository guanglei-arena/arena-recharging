# 🌿 Arena Pause — Sleep Pod Pause

A tiny full-stack web app for a team room called Arena Pause. Reserve a sleep
pod for a nap, volunteer as a wake-up buddy, and let one randomly-chosen
volunteer come wake anyone whose nap time is up.

## Features

| Requirement | Where |
|---|---|
| **Home** page with two actions — request a nap, or volunteer to wake others | `/` |
| Separate **How it works** tab | `/how` |
| **Pods list** (demo with 3 pods) showing **occupied / vacant** status | `/nap` |
| **Schedule blocks of time** on each pod's calendar (like Google Calendar) | `/nap` |
| **Randomly choose** one signed-up volunteer to be the waker | `/wake` |
| Waker can **reject** their assignment and automatically hand it to a new volunteer | `/wake` |
| Waker can **wake** people whose planned time is up | `/wake` |
| Scheduled napper can enter a minimal **sleeping room** and tap **I'm awake** / **Exit** | `/nap` + `/sleeping` |
| The designated waker is **notified** to go wake / or that they self-exited | bell 🔔 + `/wake` |

## How it works

1. **Book a pod** — pick a time block on a pod's calendar. The pod shows
   **occupied** during any booked window and **vacant** otherwise.
2. **Nap** — when your planned end time passes, you go into **"time up"**.
3. **Who wakes you?** — Anyone can volunteer to be a wake-up buddy. One
   volunteer is randomly chosen each session to be on duty.
4. **Wake or self-exit** — the on-duty waker sees the "needs waking" list,
   taps **Wake up**, and you're notified. If you'd rather get up on your own,
   tap **Exit** on your nap page — then the waker is told not to come get you.

## Tech

- **Frontend:** React 18 + React Router + Vite (plain CSS, no UI kit)
- **Backend:** Node + Express, in-memory data store (resets on restart, seeded
  with demo data so it always looks alive)
- **Realtime-ish:** the UI polls the API every few seconds so statuses
  (time-up, pod occupancy) stay live without any backend infra.

## Run it

```bash
npm install
npm run build   # builds the client into client/dist
npm start       # serves the app + API on http://localhost:3001
```

Or for active development (separate dev server + API proxy):

```bash
npm run dev            # API on :3001
npx vite --config client/vite.config.js   # client on :5173 (proxies /api to :3001)
```

## API

```
GET  /api/state                        full app state
POST /api/reservations                 book a pod  {podId,userId,start,end,note}
POST /api/wakers/signup                {userId}
POST /api/wakers/resign                {userId}
POST /api/wakers/assign                pick a random on-duty waker
POST /api/wakers/reject                {userId}  (assigned waker declines, auto-reassign)
POST /api/reservations/:id/wake        {userId}  (assignee wakes the napper)
POST /api/reservations/:id/exit        {userId}  (napper leaves on their own)
POST /api/notifications/read           {userId}
```

## Notes

- Use the **user switcher** in the top bar to act as different teammates
  (the napper, the waker, etc.) — this is how you demo the full loop.
- Data is in-memory and resets on restart; the seed data already includes a
  **time-up** napper (Wei-lin) so you can try the waking flow immediately.
