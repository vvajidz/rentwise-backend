import mongoose, { Document, Schema } from "mongoose";

// Define the activity log type
interface ActivityLog {
  action: string;
  targetId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

// Define the Admin document type
export interface AdminDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  activityLogs: ActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const adminSchema = new Schema<AdminDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
    },
    activityLogs: [
      {
        action: { type: String, required: true },
        targetId: { type: Schema.Types.ObjectId },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

export const Admin = mongoose.model<AdminDocument>("Admin", adminSchema);
