"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PropertySchema = new mongoose_1.Schema({
    propertyName: { type: String, required: true },
    propertyType: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        type: { type: String,
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
    guidelines: [{ type: String, }],
    requiredDocuments: [{ type: String }],
    tenants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    isAvailable: { type: Boolean, default: true },
    description: { type: String, required: true },
    bathrooms: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    totalFloors: { type: Number, default: null },
    furnishing: {
        type: String,
        enum: ["unfurnished", "semi-furnished", "fully-furnished"],
        default: "unfurnished",
    },
}, { timestamps: true });
PropertySchema.index({ location: "2dsphere" });
exports.default = mongoose_1.default.model("Property", PropertySchema);
