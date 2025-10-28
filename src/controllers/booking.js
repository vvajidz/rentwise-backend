"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingRequest = void 0;
const ownerModel_1 = __importDefault(require("../models/ownerModel"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const createBookingRequest = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const tenantId = req.userId; // JWT middleware attaches req.user
        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }
        // 1. Find owner for the property
        const owner = await ownerModel_1.default.findOne({ properties: propertyId });
        if (!owner) {
            return res.status(404).json({ message: "Owner not found for this property" });
        }
        // 2. Check if booking already exists for this tenant + property
        const existingBooking = await bookingModel_1.default.findOne({ tenantId, propertyId });
        if (existingBooking) {
            return res.status(409).json({ message: "You have already requested this property" });
        }
        // 3. Create booking request
        const booking = await bookingModel_1.default.create({
            ownerId: owner.user,
            tenantId,
            propertyId,
            confirm: false
        });
        return res.status(201).json({
            message: "Booking request created successfully",
            booking
        });
    }
    catch (error) {
        console.error("Error creating booking request:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.createBookingRequest = createBookingRequest;
