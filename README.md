# 🧠 Daily Mental Health Tracker

A full-stack web application for tracking daily mental health, including mood logging, journaling, activity tracking, analytics, and chatbot interaction.

> ⚡ **My Contribution:** I primarily worked on the backend development of this project, focusing on API design, authentication, database architecture, and security.
> 🚀 Backend-focused development with emphasis on scalability, security, and clean architecture.

---

## 🚀 Key Features

* 🔐 User Authentication (JWT-based)
* 😊 Mood Tracking System
* 📝 Journal Management
* 🏃 Activity Tracking
* 📊 Analytics Dashboard
* 🤖 AI Chatbot Integration

---

## 🧑‍💻 My Role (Backend Developer)

* Designed and implemented **scalable RESTful APIs**
* Built **authentication system using JWT & bcrypt**
* Developed **MongoDB schemas & data models**
* Implemented **middleware architecture**

  * Error handling (`appError`, `catchAsync`)
  * Validation middleware
* Added **security features**

  * Helmet
  * Rate limiting
  * CORS handling
* Created modular and scalable backend structure

---

## 🏗️ Tech Stack

### Backend (My Work)

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* express-validator
* Helmet, Rate Limit, CORS

### Frontend

* React.js
* react-chatbot-kit

---

## 📁 Project Structure

```bash
├── routes/
├── models/
├── middleware/
├── utils/
├── server.js
```

---

## 🔌 API Endpoints

📌 **Note:** Each module supports full CRUD operations (Create, Read, Update, Delete) with proper validation and authentication.

### Authentication

* `POST /api/auth/register` – Register a new user
* `POST /api/auth/login` – Authenticate user and return JWT

### Mood Management

* `POST /api/mood` – Create a mood entry
* `GET /api/mood` – Retrieve user mood history

### Journal Management

* `POST /api/journal` – Create a journal entry
* `GET /api/journal` – Retrieve journal entries

### Activity Tracking

* `POST /api/activities` – Add activity
* `GET /api/activities` – Fetch activities

### Analytics

* `GET /api/analytics` – Get user insights and trends

### Chatbot

* `POST /api/chatbot` – Interact with AI chatbot

---

## ⚙️ Setup

```bash
git clone https://github.com/your-username/mental-health-tracker.git
cd mental-health-tracker
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRE=7d
```

Run the full application (Frontend + Backend):

```bash
npm run dev:full
```

---

## 🔍 What This Project Demonstrates

* Scalable backend architecture
* Secure authentication systems
* Middleware design patterns
* REST API development
* Real-world backend problem solving

---

## 👨‍💻 Author

**Sujal Hammad**
Backend Developer (Node.js | Express.js | MongoDB)

---

## 🌟 Support

If you like this project, give it a ⭐ on GitHub!
