import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { getIO } from "../socket";

// ─── helpers ──────────────────────────────────────────────────────────────────

const PARTICIPANT_FIELDS = "name avatar company title role";

function populatedConvResponse(conv: InstanceType<typeof Conversation> & Record<string, unknown>) {
  return conv.toObject();
}

// ─── POST /api/v1/messages/conversations ─────────────────────────────────────
// Body: { participantId, jobId? }
// Finds existing conversation between the two users or creates one.

export const getOrCreateConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user!._id;
    const { participantId, jobId } = req.body;

    if (!participantId) {
      res.status(400).json({ success: false, message: "participantId is required" });
      return;
    }

    if (myId.toString() === participantId) {
      res.status(400).json({ success: false, message: "Cannot start conversation with yourself" });
      return;
    }

    const otherId = new mongoose.Types.ObjectId(participantId);

    // Find existing: both participants present (order-agnostic)
    let conv = await Conversation.findOne({
      participants: { $all: [myId, otherId], $size: 2 },
    })
      .populate("participants", PARTICIPANT_FIELDS)
      .populate("lastMessage")
      .populate("jobContext", "title");

    if (!conv) {
      conv = await Conversation.create({
        participants: [myId, otherId],
        jobContext: jobId ? new mongoose.Types.ObjectId(jobId) : undefined,
        lastActivity: new Date(),
      });
      conv = await Conversation.findById(conv._id)
        .populate("participants", PARTICIPANT_FIELDS)
        .populate("lastMessage")
        .populate("jobContext", "title") as typeof conv;
    }

    res.status(200).json({ success: true, data: conv });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/messages/conversations ──────────────────────────────────────
// Returns all conversations for the logged-in user, sorted by lastActivity desc.
// Each entry includes unreadCount.

export const getMyConversations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user!._id;

    const conversations = await Conversation.find({ participants: myId })
      .populate("participants", PARTICIPANT_FIELDS)
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
        populate: { path: "sender", select: "name" },
      })
      .populate("jobContext", "title")
      .sort({ lastActivity: -1 })
      .lean();

    // Compute unread counts in one aggregation query
    const convIds = conversations.map((c) => c._id);
    const unreadAgg = await Message.aggregate([
      {
        $match: {
          conversation: { $in: convIds },
          readBy: { $not: { $elemMatch: { $eq: myId } } },
          sender: { $ne: myId },
        },
      },
      { $group: { _id: "$conversation", count: { $sum: 1 } } },
    ]);

    const unreadMap = new Map(
      unreadAgg.map((r) => [r._id.toString(), r.count as number])
    );

    const result = conversations.map((c) => ({
      ...c,
      unreadCount: unreadMap.get(c._id.toString()) ?? 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/messages/conversations/:id/messages ─────────────────────────
// Returns last 50 messages for the conversation (oldest → newest).
// Marks all unread messages as read for this user.

export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user!._id;
    const { id: convId } = req.params;

    const conv = await Conversation.findById(convId);
    if (!conv) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    const isParticipant = conv.participants.some(
      (p) => p.toString() === myId.toString()
    );
    if (!isParticipant) {
      res.status(403).json({ success: false, message: "Not a participant" });
      return;
    }

    // Fetch last 50, sorted ascending so oldest first for display
    const messages = await Message.find({ conversation: convId })
      .populate("sender", PARTICIPANT_FIELDS)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    messages.reverse(); // oldest → newest

    // Bulk mark unread messages as read
    await Message.updateMany(
      {
        conversation: convId,
        sender: { $ne: myId },
        readBy: { $not: { $elemMatch: { $eq: myId } } },
      },
      { $addToSet: { readBy: myId } }
    );

    res.json({ success: true, data: { messages, conversationId: convId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── POST /api/v1/messages/conversations/:id/messages ────────────────────────
// Body: { text }
// Creates a message, updates conversation, emits Socket.IO events.

export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user!._id;
    const { id: convId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      res.status(400).json({ success: false, message: "Message text is required" });
      return;
    }

    const conv = await Conversation.findById(convId);
    if (!conv) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    const isParticipant = conv.participants.some(
      (p) => p.toString() === myId.toString()
    );
    if (!isParticipant) {
      res.status(403).json({ success: false, message: "Not a participant" });
      return;
    }

    // Create message — sender has already read it
    const message = await Message.create({
      conversation: convId,
      sender: myId,
      text: text.trim(),
      readBy: [myId],
    });

    // Populate sender for the response
    await message.populate("sender", PARTICIPANT_FIELDS);

    // Update conversation metadata
    conv.lastMessage = message._id;
    conv.lastActivity = new Date();
    await conv.save();

    // Fetch full conversation for the update event
    const updatedConv = await Conversation.findById(convId)
      .populate("participants", PARTICIPANT_FIELDS)
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
        populate: { path: "sender", select: "name" },
      })
      .populate("jobContext", "title")
      .lean();

    const msgObj = message.toObject();

    // Emit to every OTHER participant
    const recipients = conv.participants.filter(
      (p) => p.toString() !== myId.toString()
    );
    for (const recipientId of recipients) {
      const room = `user:${recipientId.toString()}`;
      getIO().to(room).emit("new_message", {
        conversationId: convId,
        message: msgObj,
      });
      getIO().to(room).emit("conversation_updated", updatedConv);
    }

    // Also emit conversation_updated back to sender so their list refreshes
    getIO().to(`user:${myId.toString()}`).emit("conversation_updated", updatedConv);

    res.status(201).json({ success: true, data: msgObj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/messages/conversations/:id/read ───────────────────────────
// Marks all unread messages in the conversation as read for the current user.

export const markRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user!._id;
    const { id: convId } = req.params;

    const conv = await Conversation.findById(convId);
    if (!conv) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    const isParticipant = conv.participants.some(
      (p) => p.toString() === myId.toString()
    );
    if (!isParticipant) {
      res.status(403).json({ success: false, message: "Not a participant" });
      return;
    }

    await Message.updateMany(
      {
        conversation: convId,
        sender: { $ne: myId },
        readBy: { $not: { $elemMatch: { $eq: myId } } },
      },
      { $addToSet: { readBy: myId } }
    );

    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
