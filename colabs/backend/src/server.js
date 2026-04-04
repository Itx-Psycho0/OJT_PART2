import config from "./config/config.js";

import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import session from "express-session";
import passport from "./config/passport.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import { Server } from "socket.io";
import { initCollaboration } from "./sockets/collaboration.js";


const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  config.clientUrl,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);


app.use(
  session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/health", healthRoutes);
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("CoLabs Backend Running");
});

app.use(notFound);
app.use(errorHandler);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});


initCollaboration(io);


// Server Start
const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();