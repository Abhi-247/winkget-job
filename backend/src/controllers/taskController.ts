import { Request, Response } from "express";
import { Task } from "../models/Task";
import { TaskClaim } from "../models/TaskClaim";
import { User } from "../models/User";
import { Escrow } from "../models/Escrow";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createSystemNotification } from "../utils/notification";

// GET /api/v1/tasks — public browse with search + filter
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      taskType,
      location,
      budgetMin,
      budgetMax,
      page = "1",
      limit = "12",
    } = req.query;

    const query: Record<string, unknown> = { status: "open" };

    if (search) {
      query.$text = { $search: search as string };
    }
    if (category) {
      // Map broad category names to taskType aliases for better matching
      const CATEGORY_TASKTYPE_MAP: Record<string, string[]> = {
        "web development":    ["development", "quick-fix", "testing"],
        "mobile development": ["development", "testing"],
        "design":             ["design", "photo-editing", "video-editing"],
        "data science":       ["data-entry", "research", "development"],
        "marketing":          ["marketing", "social-media", "content-writing"],
        "writing":            ["content-writing", "translation"],
        "video & animation":  ["video-editing"],
        "finance":            ["finance-accounting"],
        "engineering":        ["development", "testing", "quick-fix"],
        "sales":              ["marketing", "social-media", "customer-support"],
        "customer service":   ["customer-support", "virtual-assistant"],
        "other":              ["other"],
      };
      const catKey = (category as string).toLowerCase();
      const aliases = CATEGORY_TASKTYPE_MAP[catKey] || [];
      const catRegex = new RegExp(category as string, "i");
      const taskTypeRegexes = aliases.map(a => new RegExp(a, "i"));
      query.$or = [
        { category: catRegex },
        { title: catRegex },
        { skills: catRegex },
        ...(taskTypeRegexes.length > 0 ? [{ taskType: { $in: taskTypeRegexes } }] : []),
      ];
    }
    if (taskType) query.taskType = new RegExp(taskType as string, "i");
    if (location) query.location = new RegExp(location as string, "i");
    if (budgetMin || budgetMax) {
      query.budget = {};
      if (budgetMin) (query.budget as Record<string, unknown>).$gte = Number(budgetMin);
      if (budgetMax) (query.budget as Record<string, unknown>).$lte = Number(budgetMax);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("employer", "name company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/tasks/:id — public task detail
export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "employer",
      "name company avatar location"
    );
    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/tasks — employer create task
export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const taskData = {
      ...req.body,
      employer: req.user!._id,
    };

    const task = await Task.create(taskData);
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages.join(", ") });
      return;
    }
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// PATCH /api/v1/tasks/:id — employer update task
export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      employer: req.user!._id,
    });
    if (!task) {
      res
        .status(404)
        .json({ success: false, message: "Task not found or not authorized" });
      return;
    }
    Object.assign(task, req.body);
    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// DELETE /api/v1/tasks/:id — employer delete task
export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      employer: req.user!._id,
    });
    if (!task) {
      res
        .status(404)
        .json({ success: false, message: "Task not found or not authorized" });
      return;
    }
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/tasks/employer/my-tasks — employer's own tasks
export const getMyTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tasks = await Task.find({ employer: req.user!._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/tasks/claims — jobseeker claim a task
export const claimTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { taskId, message, bidAmount } = req.body;

    const task = await Task.findById(taskId);
    if (!task || task.status !== "open") {
      res
        .status(404)
        .json({ success: false, message: "Task not found or not open" });
      return;
    }

    const existing = await TaskClaim.findOne({
      task: taskId,
      claimant: req.user!._id,
    });
    if (existing) {
      res
        .status(400)
        .json({ success: false, message: "Already claimed this task" });
      return;
    }

    const finalBidAmount =
      typeof bidAmount === "number" && bidAmount > 0
        ? bidAmount
        : task.budget || 0;

    const claim = await TaskClaim.create({
      task: taskId,
      claimant: req.user!._id,
      message: message || "",
      bidAmount: finalBidAmount,
    });

    await Task.findByIdAndUpdate(taskId, { $inc: { claimCount: 1 } });

    // Send in-app notification to task owner
    if (task.employer) {
      await createSystemNotification({
        recipient: task.employer,
        title: "New Task Claim & Bid 🚀",
        message: `A freelancer pitched ₹${finalBidAmount.toLocaleString("en-IN")} for your task "${task.title}".`,
        type: "new_claim",
        link: `/employer/my-tasks/${task._id}`,
      });
    }

    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/tasks/claims/my — jobseeker's own claims
export const getMyClaims = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const claims = await TaskClaim.find({ claimant: req.user!._id })
      .populate("task")
      .populate({
        path: "task",
        populate: { path: "employer", select: "name company" },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/tasks/claims/task/:taskId — employer views claimants for a task
export const getTaskClaims = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      employer: req.user!._id,
    });
    if (!task) {
      res
        .status(404)
        .json({ success: false, message: "Task not found or not authorized" });
      return;
    }

    const claims = await TaskClaim.find({ task: req.params.taskId })
      .populate("claimant", "name email title skills location")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// PATCH /api/v1/tasks/claims/:id/status — employer approve/reject claim & Escrow handling
export const updateClaimStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const claim = await TaskClaim.findById(req.params.id).populate("task");

    if (!claim) {
      res.status(404).json({ success: false, message: "Claim not found" });
      return;
    }

    const targetTask = await Task.findById(claim.task);
    if (!targetTask) {
      res.status(404).json({ success: false, message: "Associated task not found" });
      return;
    }

    if (targetTask.employer.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    const employerId = req.user!._id;
    const claimantId = claim.claimant;
    const initialBudget = targetTask.budget;
    const finalBidAmount = claim.bidAmount && claim.bidAmount > 0 ? claim.bidAmount : targetTask.budget;

    if (status === "approved") {
      // 1. Update winning claim status to approved
      claim.status = "approved";

      // 2. Auto-reject ALL OTHER pending claims for this task and send "Not Selected" notifications
      const otherClaims = await TaskClaim.find({
        task: targetTask._id,
        _id: { $ne: claim._id },
        status: { $in: ["pending", "shortlisted"] },
      });

      for (const other of otherClaims) {
        other.status = "rejected";
        await other.save();
        await createSystemNotification({
          recipient: other.claimant,
          title: "Task Claim Update",
          message: `Your pitch for the task "${targetTask.title}" was not selected.`,
          type: "claim_status",
          link: "/jobseeker/my-tasks",
        });
      }

      // 3. Update task total budget to the winning final bid price
      targetTask.budget = finalBidAmount;
      targetTask.status = "assigned";
      targetTask.acceptedClaim = claim._id;

      // 4. Escrow Balance Verification & Locking
      const employerUser = await User.findById(employerId);
      const currentEscrowBal = employerUser?.escrowBalance || 0;

      let isFunded = false;
      let escrowRecord;

      if (currentEscrowBal >= finalBidAmount) {
        // Employer has sufficient escrow balance -> LOCK FUNDS
        if (employerUser) {
          employerUser.escrowBalance = currentEscrowBal - finalBidAmount;
          await employerUser.save();
        }

        isFunded = true;
        claim.escrowFunded = true;
        targetTask.escrowStatus = "funded";
        targetTask.escrowAmount = finalBidAmount;

        escrowRecord = await Escrow.create({
          task: targetTask._id,
          claim: claim._id,
          employer: employerId,
          freelancer: claimantId,
          initialBudget,
          finalBidAmount,
          lockedAmount: finalBidAmount,
          status: "funded",
          platformGuarantee: true,
          disclaimerAccepted: true,
          disclaimerText: "Escrow funded successfully. Platform Escrow Payment Guarantee is Active.",
        });

        await createSystemNotification({
          recipient: claimantId,
          title: "Task Claim Approved 🎉 (Escrow Secured)",
          message: `Your pitch ($${finalBidAmount}) for "${targetTask.title}" was accepted! Escrow is fully funded with Platform Guarantee.`,
          type: "claim_status",
          link: "/jobseeker/my-tasks",
        });
      } else {
        // Insufficient Escrow balance -> Accept as unfunded with Platform Disclaimer
        isFunded = false;
        claim.escrowFunded = false;
        targetTask.escrowStatus = "unfunded";
        targetTask.escrowAmount = finalBidAmount;

        escrowRecord = await Escrow.create({
          task: targetTask._id,
          claim: claim._id,
          employer: employerId,
          freelancer: claimantId,
          initialBudget,
          finalBidAmount,
          lockedAmount: 0,
          status: "unfunded",
          platformGuarantee: false,
          disclaimerAccepted: true,
          disclaimerText:
            "Employer accepted bid without pre-funding Escrow. The platform is NOT responsible for payment guarantee for this task.",
        });

        await createSystemNotification({
          recipient: claimantId,
          title: "Task Claim Approved (Unfunded Escrow Warning)",
          message: `Your pitch ($${finalBidAmount}) for "${targetTask.title}" was accepted. NOTE: Escrow balance was insufficient, so Platform Payment Guarantee does NOT apply.`,
          type: "claim_status",
          link: "/jobseeker/my-tasks",
        });
      }

      await claim.save();
      await targetTask.save();

      // 5. Find or create a conversation between employer and claimant
      let conv = await Conversation.findOne({
        participants: { $all: [employerId, claimantId], $size: 2 },
      });

      if (!conv) {
        conv = await Conversation.create({
          participants: [employerId, claimantId],
          lastActivity: new Date(),
        });
      }

      const text = isFunded
        ? `Hello! I have approved your bid ($${finalBidAmount}) for task: "${targetTask.title}". Funds are locked in Escrow. Let's start!`
        : `Hello! I have approved your bid ($${finalBidAmount}) for task: "${targetTask.title}". Let me know when you are ready to begin.`;

      const welcomeMsg = await Message.create({
        conversation: conv._id,
        sender: employerId,
        text,
        readBy: [employerId],
      });

      conv.lastMessage = welcomeMsg._id;
      conv.lastActivity = new Date();
      await conv.save();

      try {
        const { getIO } = require("../socket");
        const io = getIO();
        if (io) {
          const PARTICIPANT_FIELDS = "name avatar company title role";
          const updatedConv = await Conversation.findById(conv._id)
            .populate("participants", PARTICIPANT_FIELDS)
            .populate({
              path: "lastMessage",
              select: "text sender createdAt",
              populate: { path: "sender", select: "name" },
            })
            .lean();

          io.to(`user:${claimantId.toString()}`).emit("new_message", {
            conversationId: conv._id,
            message: welcomeMsg.toObject(),
          });
          io.to(`user:${claimantId.toString()}`).emit("conversation_updated", updatedConv);
          io.to(`user:${employerId.toString()}`).emit("conversation_updated", updatedConv);
        }
      } catch (err) {
        // socket safe catch
      }

      res.json({
        success: true,
        data: claim,
        escrow: escrowRecord,
        task: targetTask,
      });
      return;
    } else if (status === "rejected") {
      claim.status = "rejected";
      await claim.save();

      await createSystemNotification({
        recipient: claimantId,
        title: "Task Claim Proposal Update",
        message: `Your pitch for the task "${targetTask.title}" was not selected.`,
        type: "claim_status",
        link: "/jobseeker/my-tasks",
      });

      res.json({ success: true, data: claim });
      return;
    } else if (status === "completed") {
      claim.status = "completed";
      await claim.save();

      targetTask.status = "completed";

      // Finalize Escrow release upon employer approval
      const escrow = await Escrow.findOne({
        task: targetTask._id,
        claim: claim._id,
      });

      if (escrow) {
        if (escrow.status === "funded") {
          // Release locked funds from escrow to freelancer's wallet balance
          const freelancerUser = await User.findById(claimantId);
          if (freelancerUser) {
            freelancerUser.walletBalance = (freelancerUser.walletBalance || 0) + escrow.finalBidAmount;
            await freelancerUser.save();
          }

          escrow.status = "released";
          escrow.releasedAt = new Date();
          await escrow.save();

          targetTask.escrowStatus = "released";

          await createSystemNotification({
            recipient: claimantId,
            title: "Escrow Payment Released! 💰",
            message: `Employer finalized task "${targetTask.title}". Payment of $${escrow.finalBidAmount} has been transferred to your wallet balance!`,
            type: "claim_status",
            link: "/jobseeker/my-tasks",
          });

          await createSystemNotification({
            recipient: employerId,
            title: "Task Finalized & Payment Released 🛡️",
            message: `You finalized task "${targetTask.title}". $${escrow.finalBidAmount} released from Escrow to the freelancer.`,
            type: "claim_status",
            link: `/employer/my-tasks/${targetTask._id}`,
          });
        } else if (escrow.status === "unfunded") {
          escrow.status = "unfunded_completed";
          await escrow.save();

          await createSystemNotification({
            recipient: claimantId,
            title: "Task Completed (Unfunded Escrow)",
            message: `Employer finalized task "${targetTask.title}". Note: Escrow was unfunded; platform is not responsible for payout.`,
            type: "claim_status",
            link: "/jobseeker/my-tasks",
          });
        }
      }

      await targetTask.save();

      res.json({ success: true, data: claim, task: targetTask });
      return;
    }

    res.status(400).json({ success: false, message: "Invalid status" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
