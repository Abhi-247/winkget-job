import { Notification, NotificationType } from "../models/Notification";
import { getIO } from "../socket";
import mongoose from "mongoose";

export async function createSystemNotification({
  recipient,
  title,
  message,
  type,
  link,
}: {
  recipient: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link: string;
}) {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
      read: false,
    });

    // Attempt to broadcast notification in real-time
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${recipient.toString()}`).emit("new_notification", notification.toObject());
      }
    } catch (socketErr) {
      // Socket.io might not be initialized or active yet; proceed silently
    }

    return notification;
  } catch (error) {
    console.error("Failed to create system notification:", error);
    return null;
  }
}
