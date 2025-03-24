import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// const serviceAccount = require("./config/techliftupchatbotlead-firebase-adminsdk-fbsvc-54aca04264.json");
dotenv.config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore instance

const app = express();
const port = process.env.PORT || 5000;

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://test.techliftup.com",
  "http://www.test.techliftup.com",
  "https://techliftup.com",
  "https://www.techliftup.com",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // Add Authorization here
  })
);

app.options("*", cors());
app.use(express.json());

// Pass the Firestore instance to routes
app.use((req, res, next) => {
  req.db = db; // Attach Firestore instance to the request object
  next();
});

app.use("/", chatRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
