const express = require("express");
const connDB = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, "../.env") });
// Initialize Express app
const app = express();
// Trust proxy for cookies when using HTTPS (Nginx, etc.)
app.set("trust proxy", 1);
//crons jb
require("./utils/cronsjob");
// CORS setup
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://51.21.131.83",
    "https://codeally.online",
    "https://www.codeally.online",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Routes (require early so we can attach raw webhook before json parser)
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");

// Razorpay webhook must use raw body for signature verification; register BEFORE express.json()
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), paymentRouter.webhookHandler);

// Standard middleware
app.use(express.json());
app.use(cookieParser());

// Logger for debugging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);
app.use("/api", paymentRouter);

// Health check routes
app.get("/", (_req, res) => res.status(200).send("OK"));
app.get("/api", (_req, res) => res.status(200).send("API OK"));

// Connect to DB and start server
connDB()
  .then(() => {
    console.log("Database connected successfully");
    const PORT = 9931;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
