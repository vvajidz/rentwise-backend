import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProperty extends Document {
  _id: mongoose.Types.ObjectId;
  propertyName: string;
  propertyType: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  images: string[];
  monthlyRent: number;
  securityDeposit: number;
  utilitiesIncluded: boolean;
  availableFrom: Date;
  minimumStay: number;
  leaseTerms: number;
  amenities: string[];
  guidelines: string[];
  requiredDocuments: string[];
  tenants: Types.ObjectId[];
  isAvailable: boolean;
  description: string;
  bathrooms: number;
  bedrooms: number;
  totalFloors: number;
  furnishing: "unfurnished" | "semi-furnished" | "fully-furnished" | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PropertySchema: Schema<IProperty> = new Schema(
  {
    propertyName: { type: String, required: true },
    propertyType: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    images: [{ type: String, required: true }],
    monthlyRent: { type: Number, required: true },
    securityDeposit: { type: Number, required: true }, 
    utilitiesIncluded: { type: Boolean, default: false },
    availableFrom: { type: Date, required: true },
    minimumStay: { type: Number, default: 1 },
    leaseTerms: { type: Number, default: 10 },
    amenities: [{ type: String }],
    guidelines: [{ type: String , }],
    requiredDocuments: [{ type: String }],
    tenants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isAvailable: { type: Boolean, default: true },
    description: { type: String, required: true },
    bathrooms: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    totalFloors: { type: Number, default:null },
    furnishing: {
      type: String,
      enum: ["unfurnished", "semi-furnished", "fully-furnished"],
      default: "unfurnished",
    },
  },
  { timestamps: true }
);

PropertySchema.index({ location: "2dsphere" });

export default mongoose.model<IProperty>("Property", PropertySchema);
