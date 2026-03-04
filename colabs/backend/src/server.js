require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);


// Routes


app.use("/api/health", require("./routes/health.routes"));

// Optional root route
app.get("/", (req, res) => {
  res.send("CoLabs Backend Running");
});


// Server Start


const PORT = process.env.PORT || 5000;

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