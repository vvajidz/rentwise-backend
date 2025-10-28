import { Schema, model, Document } from "mongoose";

export interface IBooking extends Document {
  ownerId: Schema.Types.ObjectId;
  tenantId: Schema.Types.ObjectId;
  propertyId: Schema.Types.ObjectId;
  confirm: boolean;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    confirm: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IBooking>("Booking", bookingSchema);
