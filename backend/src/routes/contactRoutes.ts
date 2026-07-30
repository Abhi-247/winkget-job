import { Router } from "express";
import { ContactRequest } from "../models/ContactRequest";
import { Request, Response } from "express";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { contactLimiter } from "../middlewares/rateLimiter";

const router = Router();

// ─── Public: Submit a contact request ─────────────────────────────────────────
router.post("/", contactLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, inquiryType, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ success: false, message: "Name, email, subject and message are required" });
      return;
    }

    const contact = await ContactRequest.create({
      name,
      email,
      phone: phone || "",
      inquiryType: inquiryType || "General Inquiry",
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully",
      data: { id: contact._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

// ─── Admin: List all contact requests ─────────────────────────────────────────
router.get(
  "/",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, page = "1", limit = "20" } = req.query;
      const query: Record<string, unknown> = {};
      if (status && status !== "all") query.status = status;

      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [data, total] = await Promise.all([
        ContactRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        ContactRequest.countDocuments(query),
      ]);

      res.json({
        success: true,
        data,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }
);

// ─── Admin: Update status / add note ──────────────────────────────────────────
router.patch(
  "/:id",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, adminNote } = req.body;
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (adminNote !== undefined) updates.adminNote = adminNote;

      const contact = await ContactRequest.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!contact) {
        res.status(404).json({ success: false, message: "Contact request not found" });
        return;
      }
      res.json({ success: true, data: contact });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }
);

// ─── Admin: Delete a contact request ──────────────────────────────────────────
router.delete(
  "/:id",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const contact = await ContactRequest.findByIdAndDelete(req.params.id);
      if (!contact) {
        res.status(404).json({ success: false, message: "Contact request not found" });
        return;
      }
      res.json({ success: true, message: "Contact request deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }
);

export default router;
