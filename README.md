<div align="center">

# 🧠 Daily Mental Health Tracker

A full-stack web application for monitoring mental well-being through mood logging, journaling, activity tracking, a rule-based chatbot, and proactive notifications.

> 👨‍💻 **My role:** Backend Developer — I designed and built the entire server-side of this project. The frontend was developed by a separate team member.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Docs](#-api-reference) · [Contributing](#-contributing)

</div>

---

> ⚠️ **Disclaimer:** This tool is for personal self-tracking only and is **not a substitute for professional mental health care.**
> If you are in crisis, please reach out:
> - 🇮🇳 **iCall**: +91-9152987821 (Mon–Sat, 8am–10pm)
> - 🇮🇳 **Vandrevala Foundation**: 1860-2662-345 (24/7)
> - 🇮🇳 **AASRA**: +91-22-27546669 (24/7)
> - 🌍 [findahelpline.com](https://findahelpline.com) — International directory

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Backend Deployment](#-backend-deployment)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [My Contribution](#-my-contribution--backend-developer)
- [License](#-license)

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Authentication** | JWT-based auth, bcrypt password hashing, protected routes, rate limiting |
| 😊 **Mood Tracking** | Log moods with intensity & emotion tags, visual calendar, trend analysis |
| 📝 **Journaling** | Private entries with rich text, tagging, sentiment analysis, and search |
| 🏃 **Activity Logging** | Track exercise, meditation, sleep, and social activities with streaks |
| 📊 **Analytics Dashboard** | Charts for mood patterns, activity correlation, and weekly/monthly reports |
| 🤖 **Smart Chatbot** | Rule-based conversational assistant that reads your mood, sleep, stress, and activity data to deliver personalised responses, proactive alerts, and crisis signposting |
| 🔔 **Notifications** | Reminders, declining-mood alerts, stress tips, and sleep quality nudges |


## 📸 Screenshots

### Dashboard
<img width="1898" height="1016" alt="image" src="https://github.com/user-attachments/assets/0f9b44b6-b794-4337-b7af-3977c4a565c4" />

### Mood Tracker
<img width="1891" height="1009" alt="image" src="https://github.com/user-attachments/assets/d60e3474-1594-4c13-9fb8-2a17a15ec2f9" />
<img width="1897" height="1016" alt="image" src="https://github.com/user-attachments/assets/2a67f6c8-c2ca-48cf-88e5-f0a5ab8cfaa0" />

### Activities
<img width="1904" height="1016" alt="image" src="https://github.com/user-attachments/assets/625aa108-57a1-4bc2-b021-423a54a36c73" />

### Journal
<img width="1893" height="1016" alt="image" src="https://github.com/user-attachments/assets/75d33b1d-1ce3-46f4-8f40-3ecdd0efa8bd" />

### Analytics
<img width="1891" height="1008" alt="image" src="https://github.com/user-attachments/assets/d5673ee5-9d41-4ff1-9f27-4f74eadfdb54" />
<img width="1888" height="1005" alt="image" src="https://github.com/user-attachments/assets/75408cea-3af0-40ac-9a4c-920883a09132" />

### Wellness Chatbot
<img width="338" height="614" alt="image" src="https://github.com/user-attachments/assets/e46fd3c1-196a-405d-8596-1dec8b7be0e1" />

---

## 🛠 Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express.js | Server & REST API |
| MongoDB + Mongoose | Database & ODM |
| jsonwebtoken | Authentication |
| bcryptjs | Password hashing |
| helmet + cors + express-rate-limit | Security hardening |
| express-validator | Input validation |

### Frontend
| Package | Purpose |
|---|---|
| React + React Router | UI & client-side routing |
| Tailwind CSS | Utility-first styling |
| Recharts | Data visualization |
| Axios | HTTP client |
| react-chatbot-kit | Chatbot UI |
| react-hook-form | Form management |
| react-hot-toast | Toast notifications |
| date-fns + lucide-react | Date utilities & icons |

---

## 🏗 Architecture

```
daily-mental-health-tracker/
├── client/                   # React frontend
│   └── src/
│       ├── components/       # Shared UI components
│       ├── contexts/         # Auth, Theme, Notifications
│       └── pages/            # Route-level page components
│
├── middleware/
│   └── auth.js               # JWT verification middleware
│
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── MoodEntry.js
│   ├── JournalEntry.js
│   └── Activity.js
│
├── routes/                   # Express route handlers
│   ├── auth.js
│   ├── mood.js
│   ├── journal.js
│   ├── activities.js
│   ├── analytics.js
│   └── chatbot.js
│
├── server.js                 # App entry point
├── setup.js                  # DB setup script
└── .env.example
```

**Request flow:**

```
React Client ──HTTPS──► Express Server ──Mongoose──► MongoDB
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 14.0.0
- [MongoDB](https://www.mongodb.com/try/download/community) >= 4.4 (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SujalHammad/daily-mental-health-tracker.git
cd daily-mental-health-tracker

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd client && npm install && cd ..

# 4. Configure environment variables
cp env.example .env
# → Edit .env with your values (see below)

# 5. (Optional) Run setup script to verify DB & create indexes
npm run setup

# 6. Start development servers (frontend + backend)
npm run dev:full
```

| Server | URL |
|---|---|
| Backend API | http://localhost:5000 |
| Frontend App | http://localhost:3000 |

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_uri
# MongoDB Atlas alternative:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mental-health-tracker

# JWT
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRE=7d

# Frontend (required for CORS in production)
FRONTEND_URL=http://localhost:3000
```

> 🔒 **Never commit `.env` to version control.** It is already listed in `.gitignore`.

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new account |
| `POST` | `/auth/login` | Authenticate and receive a token |

<details>
<summary>POST /auth/register</summary>

**Request**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" }
}
```
</details>

---

### Mood

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/mood` | Create a mood entry |
| `GET` | `/mood` | Get mood history (supports `startDate`, `endDate`, `limit`) |
| `PUT` | `/mood/:id` | Update an entry |
| `DELETE` | `/mood/:id` | Delete an entry |

<details>
<summary>POST /mood — Request body</summary>

```json
{
  "mood": "happy",
  "intensity": 8,
  "emotions": ["joyful", "excited"],
  "notes": "Great day at work!",
  "date": "2024-05-06T10:00:00.000Z"
}
```
</details>

---

### Journal

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/journal` | Create a journal entry |
| `GET` | `/journal` | List entries (`page`, `limit`, `tags`) |
| `PUT` | `/journal/:id` | Update an entry |
| `DELETE` | `/journal/:id` | Delete an entry |

---

### Activities

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/activities` | Log an activity |
| `GET` | `/activities` | Get activities (`startDate`, `type`) |
| `PUT` | `/activities/:id` | Update a log |
| `DELETE` | `/activities/:id` | Delete a log |

---

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics` | Mood trends, activity stats, journal insights, recommendations |

---

### Chatbot

The chatbot is a **rule-based engine** — it does not call an external AI model. Instead, it queries the user's own mood, sleep, stress, and activity data and selects a contextual response from a set of logic branches. It supports keyword-triggered topics (mood overview, sleep, stress, exercise, general advice) and falls back to a helpful generic message for unrecognised input.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chatbot/chat` | Send a message, receive a data-driven response |
| `POST` | `/chatbot/analyze` | Run full pattern analysis across the last 30 days |
| `GET` | `/chatbot/notifications` | List active proactive notifications |
| `POST` | `/chatbot/notifications/read` | Mark notifications as read |

---

### Error Format

All errors return a consistent shape:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "statusCode": 400
}
```

| Code | Meaning |
|---|---|
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Forbidden |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 🗄 Database Schema

```js
// User
{ name, email, password (hashed), createdAt, updatedAt }

// MoodEntry
{ user, mood (enum), intensity (1–10), emotions [], notes, date, createdAt }

// JournalEntry
{ user, title, content, tags [], mood, sentiment, createdAt, updatedAt }

// Activity
{ user, type (enum), name, duration (mins), intensity (low/moderate/high), notes, date, createdAt }
```

---

## ☁️ Backend Deployment

<details>
<summary>Render (recommended)</summary>

1. Push your repository to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set the build command to `npm install` and start command to `npm start`.
4. Add environment variables in the Render dashboard.
</details>

<details>
<summary>Railway</summary>

```bash
railway login
railway init
railway up
```
</details>

<details>
<summary>Heroku</summary>

```bash
heroku create mental-health-tracker-api
heroku config:set MONGO_URI=... JWT_SECRET=...
git push heroku main
```
</details>

### Production `.env`

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=a_very_long_random_production_secret
FRONTEND_URL=https://your-frontend.com
```

---

## 🔧 Troubleshooting

| Symptom | Fix |
|---|---|
| `Could not connect to MongoDB` | Verify `MONGO_URI` and that `mongod` is running. For Atlas, check IP whitelist. |
| `Invalid token` | Ensure the `Authorization: Bearer <token>` header is present and `JWT_SECRET` matches. |
| `Port 5000 is already in use` | Run `lsof -ti:5000 \| xargs kill -9` or change `PORT` in `.env`. |
| `CORS policy blocked` | Add your frontend origin to the CORS whitelist and set `FRONTEND_URL` in `.env`. |
| `npm install` fails | Run `npm cache clean --force`, delete `node_modules` and `package-lock.json`, then retry. |

---

## 🗺 Roadmap

- [x] JWT authentication & protected routes
- [x] Mood, journal, and activity CRUD
- [x] Analytics dashboard
- [x] Rule-based chatbot with proactive notifications
- [x] Responsive UI (mobile / tablet / desktop)
- [ ] LLM integration for natural language chatbot (OpenAI / Claude)
- [ ] PDF / CSV data export
- [ ] Two-factor authentication
- [ ] Voice journaling (speech-to-text)
- [ ] Email reminders & weekly reports
- [ ] Goal setting & habit tracking
- [ ] React Native mobile apps
- [ ] Wearable device integration
- [ ] Offline mode with background sync
- [ ] Multi-language support (i18n)
- [ ] Professional therapist portal

---

## 🤝 Contributing

Contributions are welcome! Here is the quick-start flow:

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/daily-mental-health-tracker.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push and open a pull request
git push origin feature/your-feature-name
```

**Code style:** ES6+, Airbnb style guide, 2-space indentation, JSDoc comments for exported functions.

**Bug reports:** Please open a GitHub Issue with steps to reproduce, expected vs actual behaviour, and your Node/OS versions.

---

## 🧑‍💻 My Contribution — Backend Developer

> I was responsible for the complete server-side architecture and implementation of this project. The frontend (React, Tailwind, UI components) was built by a separate team member.

### What I built

**API & Server architecture**
- Designed and implemented all RESTful API endpoints across 6 route modules (`auth`, `mood`, `journal`, `activities`, `analytics`, `chatbot`)
- Built a modular Express.js server with clean separation of concerns (routes → middleware → models)
- Configured middleware pipeline: authentication, input validation, error handling, rate limiting

**Authentication & Security**
- JWT-based stateless authentication with token expiry
- Password hashing with bcrypt (salted, never stored in plain text)
- Security hardening via Helmet (HTTP headers), CORS policy, and express-rate-limit
- Protected route middleware applied across all private endpoints

**Database Design**
- Designed all 4 Mongoose schemas: `User`, `MoodEntry`, `JournalEntry`, `Activity`
- Built aggregation queries for the analytics engine (mood trends, activity correlation, weekly/monthly breakdowns)
- Implemented full CRUD operations with input validation on every endpoint

**Chatbot & Notifications engine**
- Built a rule-based chatbot backend that reads the user's own mood, sleep, stress, and activity data to generate contextual responses — no external AI API used
- Implemented pattern detection algorithms: mood trend analysis (improving/declining/stable), sleep deprivation detection, stress/anxiety threshold alerts
- Built a proactive notifications system that automatically generates alerts based on detected patterns (missed logs, declining mood, high stress, low activity)

**Analytics engine**
- `GET /api/analytics` aggregates data across all three models and returns mood averages, activity distributions, journal sentiment scores, and personalised recommendations

### Tech stack I worked with

`Node.js` · `Express.js` · `MongoDB` · `Mongoose` · `JWT` · `bcryptjs` · `Helmet` · `express-rate-limit` · `express-validator`

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 👤 Author

**Sujal Hammad**

[![GitHub](https://img.shields.io/badge/GitHub-@SujalHammad-181717?logo=github)](https://github.com/SujalHammad)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sujalhammad-0A66C2?logo=linkedin)](https://linkedin.com/in/sujalhammad)

---

<div align="center">

Built with ❤️ for better mental health awareness.

*It's okay to not be okay — reach out when you need it.*

</div>
