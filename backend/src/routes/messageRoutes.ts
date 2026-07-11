import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markRead,
} from "../controllers/messageController";

const router = Router();

// All message routes require authentication
router.post("/conversations", protect, getOrCreateConversation);
router.get("/conversations", protect, getMyConversations);
router.get("/conversations/:id/messages", protect, getMessages);
router.post("/conversations/:id/messages", protect, sendMessage);
router.patch("/conversations/:id/read", protect, markRead);

export default router;
