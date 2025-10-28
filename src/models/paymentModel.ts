import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  amount: number;
  month: number; // 1 = Jan, 12 = Dec
  year: number;
  status: "pending" | "paid" | "failed";
  paymentMethod: string;
  transactionId?: string;
  dueDate: Date;
  paidAt?: Date;
  notes?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    amount: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentMethod: { type: String },
    transactionId: { type: String },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
