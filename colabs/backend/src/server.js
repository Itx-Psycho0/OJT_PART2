import config from "./config/config.js";

import express from "express";
import http from "http";
import cors from "cors";
import connectDB from "./config/db.js";
import session from "express-session";
import passport from "passport";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

app.use(
  session({
    secret: "keyboardcat",
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