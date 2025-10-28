import mongoose, { Document, Schema } from "mongoose";

export interface ITenant extends Document {
  user: mongoose.Types.ObjectId;
  preferences?: {
    budgetRange?: string;
    location?: string;
    leaseTerm?: string;
  };
  wishlist: mongoose.Types.ObjectId[]; // property ids
  currentProperty?:Schema.Types.ObjectId; // property id
  documents?: string[]; // or more detailed doc schema
  createdAt?: Date;
  updatedAt?: Date;
}

const TenantSchema: Schema<ITenant> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferences: {
      budgetRange: String,
      location: String,
      leaseTerm: String,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    currentProperty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    documents: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITenant>("Tenant", TenantSchema);
