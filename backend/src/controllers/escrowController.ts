import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Escrow } from "../models/Escrow";
import { User } from "../models/User";

// GET /api/v1/escrow/summary — fetch escrow balance & totals
export const getEscrowSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isEmployer = user.role === "employer";
    const filterField = isEmployer ? { employer: userId } : { freelancer: userId };

    const escrows = await Escrow.find(filterField);

    let locked = 0;
    let released = 0;
    let pending = 0;

    escrows.forEach((item) => {
      if (item.status === "funded") {
        locked += item.lockedAmount || item.finalBidAmount;
      } else if (item.status === "released") {
        released += item.finalBidAmount;
      } else if (item.status === "unfunded") {
        pending += item.finalBidAmount;
      }
    });

    res.json({
      success: true,
      data: {
        escrowBalance: user.escrowBalance || 0,
        walletBalance: user.walletBalance || 0,
        locked,
        released,
        pending,
        totalEscrows: escrows.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/escrow/deposit — top up escrow balance
export const depositEscrowFunds = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { amount } = req.body;
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid deposit amount greater than 0",
      });
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.escrowBalance = (user.escrowBalance || 0) + depositAmount;
    await user.save();

    res.json({
      success: true,
      message: `Successfully deposited ${depositAmount} to Escrow Balance`,
      data: {
        escrowBalance: user.escrowBalance,
        walletBalance: user.walletBalance || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/escrow/transactions — fetch user's escrow transactions log
export const getEscrowTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const query =
      user.role === "employer" ? { employer: userId } : { freelancer: userId };

    const transactions = await Escrow.find(query)
      .populate("task", "title budget status")
      .populate("claim", "message bidAmount")
      .populate("employer", "name company email")
      .populate("freelancer", "name title email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
