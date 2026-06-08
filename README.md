# InboxOS — AI-Powered Gmail Organizer

A Chrome extension that uses Google Gemini AI to automatically organize your Gmail inbox into smart folders — built from a product requirements document to working prototype.

---

## What It Does

InboxOS sits inside Gmail as a sidebar and intelligently sorts your emails into folders using a two-stage AI pipeline:

1. **Keyword matching** — instant classification using user-defined keywords
2. **Gemini AI fallback** — Google Gemini classifies emails that don't match any keywords

The more you use it, the smarter it gets — every time you move an email to a folder, InboxOS asks if you want to train the AI to route similar emails there automatically.

---

## Features

- **AI Email Classification** — Gemini AI reads each email and assigns it to the best folder
- **Keyword Training System** — Add keywords to folders to improve classification accuracy
- **Drag & Drop Email Management** — Drag emails between folders with one click
- **AI Training Prompt** — After moving an email, InboxOS offers to learn from your decision
- **Smart Folder Management** — Create, rename, and delete folders
- **Persistent Login** — Stays connected across sessions via OAuth 2.0
- **Onboarding Flow** — Clean welcome screen for new users
- **Real-Time Analytics Dashboard** — Tracks installs, classifications, folder usage, and AI training signals via Firebase

---

## Tech Stack

### Chrome Extension
- **Framework:** React + TypeScript
- **Build Tool:** Vite + esbuild
- **Extension API:** Chrome Extension Manifest V3
- **Auth:** OAuth 2.0 via Gmail API
- **Storage:** chrome.storage (local caching)

### AI Pipeline
- **Primary:** Keyword-first classification (instant, no API call)
- **Fallback:** Google Gemini 1.5 Flash API
- **Training:** User drag-and-drop behavior feeds back into keyword system

### Backend & Analytics
- **Database:** Firebase Firestore (REST API)
- **Dashboard:** React + Recharts
- **Events tracked:** installs, classifications, folder creation, email moves, keyword additions

---

## Architecture

Gmail Page
└── Content Script (injects sidebar iframe)
└── Sidebar React App
├── Gmail API (fetch emails)
├── Background Service Worker
│       ├── Keyword matching engine
│       ├── Gemini AI classification
│       └── Firebase analytics logging
└── chrome.storage (local cache)
Firebase Firestore ←── Analytics events
↑
Analytics Dashboard (React + Recharts)

---

## Product Background

InboxOS was built from a full Product Requirements Document (PRD) covering:
- AI confidence scoring
- Temporal intelligence (date-aware classification)
- Dynamic workspaces
- Misplaced email correction system
- Keyword-assisted AI training

The MVP prioritized the core AI classification loop, folder management, and analytics infrastructure.

---

## Installation (Development)

1. Clone the repo:
```bash
git clone https://github.com/indoxosinnovation-cloud/inboxos.git
cd inboxos
```

2. Install dependencies:
```bash
npm install
```

3. Add your API keys to `src/config.ts`:
```typescript
export const GEMINI_API_KEY = "your-gemini-api-key";
```

4. Build the extension:
```bash
npm run build
```

5. Load in Chrome:
   - Go to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `dist` folder

---

## Analytics Dashboard

The dashboard tracks real-time user behavior across all InboxOS installs.

To run locally:
```bash
cd dashboard
npm install
npm run dev
```

Open `http://localhost:5173`

### Metrics tracked:
- Total installs
- Emails classified (by folder and method)
- Folders created
- Emails moved via drag and drop
- Keywords added
- AI training rate

---

## Roadmap

- [ ] Backend server to secure API keys
- [ ] Deploy analytics dashboard to Firebase Hosting
- [ ] Calendar integration for temporal intelligence
- [ ] Apple Mail support
- [ ] Mobile app
- [ ] AI confidence scores displayed in UI
- [ ] Multi-account support

---

## Built By

Ramsey Thompson  
Independent project — PRD to prototype  
[GitHub](https://github.com/indoxosinnovation-cloud) 