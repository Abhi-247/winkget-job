import mongoose, { Schema, Document } from "mongoose";

export interface IContactRequest extends Document {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "resolved" | "closed";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    phone:       { type: String, default: "" },
    inquiryType: { type: String, default: "General Inquiry" },
    subject:     { type: String, required: true, trim: true },
    message:     { type: String, required: true },
    status:      { type: String, enum: ["new", "in-progress", "resolved", "closed"], default: "new" },
    adminNote:   { type: String, default: "" },
  },
  { timestamps: true }
);

export const ContactRequest = mongoose.model<IContactRequest>("ContactRequest", ContactRequestSchema);
