import express from "express";
import basicAuth from "express-basic-auth";
import { ChatController } from "../controllers/chatController.js";

const router = express.Router();

// Basic auth middleware for the /leads endpoint
const authMiddleware = basicAuth({
  users: { admin: "supersecret123" },
  challenge: true,
  unauthorizedResponse: (req) => {
    console.log("Incoming request headers:", req.headers); // Log headers
    return "Unauthorized: Please provide valid credentials.";
  },
});

// Health check endpoint
router.get("/health", ChatController.healthCheck);

// Test email endpoint
router.get("/test-email", ChatController.testEmail);

// Chat endpoint
router.post("/chat", ChatController.chat);

// Leads endpoint (protected with basic auth)
router.get("/leads", authMiddleware, (req, res) => {
  console.log("Request passed auth middleware, headers:", req.headers); // Log headers after auth
  ChatController.getLeads(req, res);
});

export default router;
