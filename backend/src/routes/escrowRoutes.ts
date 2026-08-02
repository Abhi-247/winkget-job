import { Router } from "express";
import {
  getEscrowSummary,
  depositEscrowFunds,
  getEscrowTransactions,
} from "../controllers/escrowController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.use(protect);

router.get("/summary", getEscrowSummary);
router.post("/deposit", depositEscrowFunds);
router.get("/transactions", getEscrowTransactions);

export default router;
