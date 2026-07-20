import { Request, Response } from "express";
import { Task } from "../models/Task";
import { TaskClaim } from "../models/TaskClaim";
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
    if (category) query.category = category;
    if (taskType) query.taskType = taskType;
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
    const { taskId, message } = req.body;

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

    const claim = await TaskClaim.create({
      task: taskId,
      claimant: req.user!._id,
      message: message || "",
    });

    await Task.findByIdAndUpdate(taskId, { $inc: { claimCount: 1 } });

    // Send in-app notification to task owner
    if (task.employer) {
      await createSystemNotification({
        recipient: task.employer,
        title: "New Task Claim 🚀",
        message: `A freelancer has pitched for your task "${task.title}".`,
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

// PATCH /api/v1/tasks/claims/:id/status — employer approve/reject claim
export const updateClaimStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const claim = await TaskClaim.findById(req.params.id).populate("task");

    if (!claim) {
      res
        .status(404)
        .json({ success: false, message: "Claim not found" });
      return;
    }

    const task = claim.task as unknown as { _id: string; title: string; employer: string };
    if (task.employer.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    claim.status = status;
    await claim.save();

    const employerId = req.user!._id;
    const claimantId = claim.claimant;

    if (status === "approved") {
      // 1. Update the task status to "assigned"
      await Task.findByIdAndUpdate(task._id, { status: "assigned" });

      // 2. Find or create a conversation between employer and claimant
      let conv = await Conversation.findOne({
        participants: { $all: [employerId, claimantId], $size: 2 },
      });

      if (!conv) {
        conv = await Conversation.create({
          participants: [employerId, claimantId],
          lastActivity: new Date(),
        });
      }

      // 3. Create initial greeting message
      const text = `Hello! I have approved your claim proposal for the task: "${task.title}". Let's discuss details and start working!`;
      const welcomeMsg = await Message.create({
        conversation: conv._id,
        sender: employerId,
        text,
        readBy: [employerId],
      });

      conv.lastMessage = welcomeMsg._id;
      conv.lastActivity = new Date();
      await conv.save();

      // 4. Emit Socket.IO events for live chat update
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
        // Safe catch for cases where Socket.IO isn't running or connected
      }

      // Create system notification for claimant
      await createSystemNotification({
        recipient: claimantId,
        title: "Task Claim Approved 🎉",
        message: `Your pitch for the task "${task.title}" has been approved! Let's start the work.`,
        type: "claim_status",
        link: "/jobseeker/my-tasks",
      });
    } else if (status === "rejected") {
      await createSystemNotification({
        recipient: claimantId,
        title: "Task Claim Proposal Update",
        message: `Your pitch for the task "${task.title}" was not selected.`,
        type: "claim_status",
        link: "/jobseeker/my-tasks",
      });
    } else if (status === "completed") {
      // If task claim is completed, update the task status to "completed"
      await Task.findByIdAndUpdate(task._id, { status: "completed" });
      await createSystemNotification({
        recipient: claimantId,
        title: "Task Completed! 🏆",
        message: `Great job! The employer marked the task "${task.title}" as completed.`,
        type: "claim_status",
        link: "/jobseeker/my-tasks",
      });
    }

    res.json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
