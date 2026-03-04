# CoLabs Backend

Backend service for **CoLabs**  a real-time collaborative editor.

Built with:

- Express.js
- Socket.io
- MongoDB (Mongoose)
- Redis (scalable realtime)
- JWT Authentication (planned)

---

## 📂 Project Structure
```
backend/
├── src/
│ ├── config/ # DB, Redis, Socket configuration
│ ├── models/ # Mongoose schemas
│ ├── controllers/ # Route logic
│ ├── routes/ # Express routes
│ ├── sockets/ # Real-time socket handlers
│ ├── services/ # Business logic
│ ├── middleware/ # Auth middleware
│ ├── utils/ # Helpers
│ └── server.js # Entry point
├── .env # Environment variables (not committed)
├── .env.example # Environment variable template
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies

From the `backend` folder:

```bash
npm install

cp .env.example .env
```
### 2️⃣ Setup Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Update `MONGO_URI` in `.env` with your MongoDB Atlas password:

```env
MONGO_URI=mongodb+srv://anuragh3re_db_user:<db_password>@colabz1.eearfex.mongodb.net/colabs?retryWrites=true&w=majority&appName=colabz1
```

### 3️⃣ Run Development Server

```bash
npm run dev
```
### 🩺 Health Check
Test the health endpoint:

```bash
GET http://localhost:5000/api/health
```
Expected response:
```bash
{
  "status": "ok",
  "uptime": 12.34,
  "timestamp": "2026-03-03T12:00:00.000Z"
}
```
## ⚙️ Environment Variables

Required variables:

| Variable     | Description                         |
|--------------|-------------------------------------|
| `PORT`       | Server port (default: 5000)         |
| `CLIENT_URL` | Frontend URL for CORS               |
| `MONGO_URI`  | MongoDB connection string           |
| `JWT_SECRET` | Secret key for authentication       |
| `REDIS_URL`  | Redis connection string             |

## 🔌 Available Scripts
Run in development mode:
```
npm run dev
```
Run in production mode:
```
npm start
```

## 🧠 Architecture Overview

CoLabs follows a modular monolith architecture with a clear separation between frontend and backend services.

### 🔷 Frontend (Next.js)

The frontend is responsible for:

- Rendering the user interface
- Managing editor state
- Handling user interactions
- Connecting to backend APIs
- Establishing WebSocket connections for real-time updates

The frontend communicates with the backend via:

- **REST APIs (Express)** for CRUD operations
- **WebSockets (Socket.io)** for real-time collaboration

---

### 🔶 Backend (Express + Socket.io)

The backend is responsible for:

- Handling HTTP API requests
- Managing WebSocket connections
- Persisting data to MongoDB
- Managing real-time document synchronization
- Handling authentication and authorization

---

### 🔌 Communication Flow

```text
Next.js (Frontend)
        │
        │ REST API Calls
        ▼
Express Backend
        │
        │ Database Operations
        ▼
MongoDB

Next.js (Frontend)
        │
        │ WebSocket Connection
        ▼
Socket.io Server
        │
        ▼
Realtime Broadcast to Connected Clients
