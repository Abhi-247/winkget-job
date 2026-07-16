import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Notification } from "../models/Notification";

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user!._id;
    const notifications = await Notification.find({ recipient: myId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const markRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user!._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: myId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const markAllRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user!._id;

    await Notification.updateMany(
      { recipient: myId, read: false },
      { read: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
