import { Router } from "express";
import {
  getEscrowSummary,
  depositEscrowFunds,
  getEscrowTransactions,
  createRazorpayOrder,
  verifyRazorpayPayment,
  withdrawWalletFunds,
} from "../controllers/escrowController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.use(protect);

router.get("/summary", getEscrowSummary);
router.post("/deposit", depositEscrowFunds);
router.post("/withdraw", withdrawWalletFunds);
router.get("/transactions", getEscrowTransactions);

// Razorpay Payment Routes
router.post("/razorpay/create-order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;

