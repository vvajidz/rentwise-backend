import mongoose, { Document, Schema } from "mongoose";

export interface IOwner extends Document {
  user: mongoose.Types.ObjectId;
  properties: mongoose.Types.ObjectId[]; // property ids
  agencyName?: string;
  licenseNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OwnerSchema: Schema<IOwner> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    agencyName: {
      type: String,
    },
    licenseNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOwner>("Owner", OwnerSchema);
