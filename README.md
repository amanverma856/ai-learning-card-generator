# AI Learning Card Generator

A full-stack web application that generates structured learning cards for any topic using AI, streamed progressively via WebSockets.

Built for the Ainstein Full Stack Intern Technical Trial.

## Tech Stack
- Frontend: React 18 + Vite
- Backend: Node.js
- WebSocket: ws (npm package)
- AI: Groq API (Llama 3.3 70B) — used instead of Gemini/OpenAI due to free tier quota limits

## Setup Instructions

### Step 1 - Get Groq API key
Go to https://console.groq.com/keys and create a free account. No credit card needed.

### Step 2 - Install backend
```bash
cd backend
npm install
```

Create `.env` file inside backend folder:
### Step 3 - Install frontend
```bash
cd frontend
npm install
```

### Step 4 - Start backend
```bash
cd backend
node server.js
```

### Step 5 - Start frontend
```bash
cd frontend
npm run dev
```

Open browser at http://localhost:5173

## How WebSocket Flow Works
1. Frontend connects to ws://localhost:8080 on load
2. User types a topic and clicks Generate
3. Frontend sends: `{ "type": "generate", "topic": "Photosynthesis", "mode": "success" }`
4. Backend calls Groq API 3 times, once per card
5. Each card is sent immediately after generation: `{ "type": "card", "data": { ... } }`
6. Frontend renders each card as it arrives
7. Backend sends `{ "type": "done" }` when finished

## How Failure and Retry Works
- Switch to Failure mode using the toggle
- Card 1 and Card 2 generate successfully
- Card 3 fails intentionally with an error message
- Click Retry — same WebSocket connection is reused
- Card 3 generates successfully on retry

## Why Groq instead of Gemini or OpenAI
Gemini 2.0 Flash hit daily quota limits on the free tier during development. Groq provides 14,400 free requests per day with no credit card required, using Llama 3.3 70B which produces high quality results.

## Extra Features
- Dark mode support
- Responsive mobile layout
- Connection status indicator
- Loading skeleton animations
- Keyboard shortcut: press Enter to generate