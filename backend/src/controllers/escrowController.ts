import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Escrow } from "../models/Escrow";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { Transaction } from "../models/Transaction";

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

    const escrows = await Escrow.find(query)
      .populate("task", "title budget status")
      .populate("claim", "message bidAmount")
      .populate("employer", "name company email")
      .populate("freelancer", "name title email")
      .sort({ createdAt: -1 });

    const userTransactions = await Transaction.find({
      user: userId,
    }).sort({ createdAt: -1 });

    const mappedUserTx = userTransactions.map((tx) => ({
      _id: tx._id,
      task: {
        title: tx.type === "deposit" ? "Razorpay Wallet Top-Up" : "Payout Withdrawal",
        budget: tx.amount,
        status: "completed",
      },
      claim: null,
      employer: { name: user.name, email: user.email },
      freelancer: { name: `Razorpay (${tx.paymentId || "Gateway"})` },
      initialBudget: tx.amount,
      finalBidAmount: tx.amount,
      lockedAmount: tx.amount,
      status: tx.type === "deposit" ? "deposit_success" : "withdrawal_success",
      transactionType: tx.type,
      paymentId: tx.paymentId,
      platformGuarantee: true,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }));

    const combined = [...escrows.map((e) => e.toObject()), ...mappedUserTx].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({ success: true, data: combined });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ── Razorpay Payment Integration ──────────────────────────────────────────────

import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";
  return new Razorpay({ key_id, key_secret });
};

// POST /api/v1/escrow/razorpay/create-order
export const createRazorpayOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { amount, currency = "INR" } = req.body;
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      res.status(400).json({ success: false, message: "Invalid deposit amount" });
      return;
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(depositAmount * 100), // convert to paise
      currency: currency.toUpperCase(),
      receipt: `rcpt_${Date.now()}_${String(req.user!._id).slice(-4)}`,
      notes: {
        userId: req.user!._id.toString(),
        type: "escrow_topup",
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
      },
    });
  } catch (error) {
    console.error("[Razorpay Create Order Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// POST /api/v1/escrow/razorpay/verify
export const verifyRazorpayPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Missing Razorpay payment parameters for verification",
      });
      return;
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      res.status(400).json({
        success: false,
        message: "Razorpay payment signature verification failed",
      });
      return;
    }

    const depositAmount = Number(amount);
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.escrowBalance = (user.escrowBalance || 0) + depositAmount;
    await user.save();

    // Record Transaction history for top-up
    await Transaction.create({
      user: user._id,
      type: "deposit",
      amount: depositAmount,
      currency: "INR",
      paymentMethod: "razorpay",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "completed",
      description: `Top-Up Escrow Wallet Balance via Razorpay (${razorpay_payment_id})`,
    }).catch((err) => console.error("Transaction creation error:", err));

    // Create automatic in-app notification
    await Notification.create({
      recipient: user._id,
      title: "Escrow Deposit Successful",
      message: `Your payment of ₹${depositAmount} via Razorpay (Ref: ${razorpay_payment_id}) was verified and added to your Escrow balance.`,
      type: "general",
      link: "/employer/escrow",
    }).catch((err) => console.error("Notification creation error:", err));

    res.json({
      success: true,
      message: `Razorpay payment verified successfully! Added ${depositAmount} to Escrow Balance.`,
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        escrowBalance: user.escrowBalance,
        walletBalance: user.walletBalance || 0,
      },
    });
  } catch (error) {
    console.error("[Razorpay Verify Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify Razorpay payment",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// POST /api/v1/escrow/withdraw — process freelancer wallet payout withdrawal
export const withdrawWalletFunds = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { amount, payoutMethod = "upi", upiId, bankAccount, ifscCode } = req.body;
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      res.status(400).json({ success: false, message: "Invalid withdrawal amount" });
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const currentBalance = user.walletBalance || 0;
    if (withdrawAmount > currentBalance) {
      res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You have ₹${currentBalance} available.`,
      });
      return;
    }

    // Deduct from wallet balance
    user.walletBalance = currentBalance - withdrawAmount;
    await user.save();

    const payoutRef = `payout_${Date.now()}_${String(user._id).slice(-4)}`;

    // Create Transaction history for withdrawal
    await Transaction.create({
      user: user._id,
      type: "withdrawal",
      amount: withdrawAmount,
      currency: "INR",
      paymentMethod: "razorpay",
      paymentId: payoutRef,
      status: "completed",
      description: `Withdrawal Payout via ${payoutMethod === "upi" ? `UPI (${upiId || "UPI"})` : `Bank Account (${bankAccount || "Bank"})`}`,
    }).catch((err) => console.error("Transaction creation error:", err));

    // Create automatic in-app notification
    await Notification.create({
      recipient: user._id,
      title: "Payout Withdrawal Processed 💸",
      message: `Your withdrawal request of ₹${withdrawAmount} via ${payoutMethod.toUpperCase()} (Ref: ${payoutRef}) was processed and deducted from your wallet balance.`,
      type: "general",
      link: "/jobseeker/earnings",
    }).catch((err) => console.error("Notification creation error:", err));

    res.json({
      success: true,
      message: `Successfully processed withdrawal payout of ₹${withdrawAmount}`,
      data: {
        walletBalance: user.walletBalance,
        escrowBalance: user.escrowBalance || 0,
        payoutRef,
      },
    });
  } catch (error) {
    console.error("[Withdraw Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process withdrawal",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

