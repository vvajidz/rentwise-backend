"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfirmedTenants = exports.declineRequest = exports.confirmBookingRequest = exports.getOwnerBookingRequests = exports.updateProperty = exports.getOwnerWithProperties = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ownerModel_1 = __importDefault(require("../models/ownerModel"));
const propertiesModel_1 = __importDefault(require("../models/propertiesModel"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const tenantModel_1 = __importDefault(require("../models/tenantModel"));
// --------------------------------------------------ADD PROPERTIES--------------------------------------------------
const getOwnerWithProperties = async (req, res) => {
    const { ownerId } = req.params;
    try {
        const owner = await ownerModel_1.default.findOne({ user: ownerId })
            .populate('properties'); // if `properties` is [ObjectId] to Property
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }
        res.status(200).json(owner);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getOwnerWithProperties = getOwnerWithProperties;
// ---------------------------EDIT PROPERTY----------------------------------------------------------------------
const updateProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const ownerId = req.userId; // from JWT middleware
        // Validate ID
        if (!mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ message: "Invalid property ID" });
        }
        // Find property
        const property = await propertiesModel_1.default.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        // Check if current user owns the property
        // Assuming your property model has an ownerId field (add it if not present)
        if (String(property.ownerId) !== String(ownerId)) {
            return res.status(403).json({ message: "You are not authorized to edit this property" });
        }
        // Update property with only provided fields
        Object.assign(property, req.body);
        await property.save();
        res.status(200).json({
            message: "Property updated successfully",
            property
        });
    }
    catch (error) {
        console.error("Error updating property:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProperty = updateProperty;
// -----------------------------------------ACCEPTED REQUEST------------------------------------------------------------
const getOwnerBookingRequests = async (req, res) => {
    try {
        const ownerId = req.userId; // from verifyToken
        if (!ownerId) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const requests = await bookingModel_1.default.find({
            ownerId,
            confirm: false
        })
            .populate("tenantId", "fullName email") // Show tenant info
            .populate("propertyId", "propertyName location price"); // Show property info
        return res.status(200).json({
            message: "Pending booking requests fetched successfully",
            requests
        });
    }
    catch (error) {
        console.error("Error fetching booking requests:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getOwnerBookingRequests = getOwnerBookingRequests;
// -----------------------------------CONFIRM REQUEST--------------------------
const confirmBookingRequest = async (req, res) => {
    try {
        const { id } = req.params; // booking ID
        // 1. Find booking
        const booking = await bookingModel_1.default.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // 2. Find tenant
        const tenant = await tenantModel_1.default.findOne({ user: booking.tenantId });
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }
        // 3. Update tenant's current property
        tenant.currentProperty = booking.propertyId;
        await tenant.save();
        // 4. Mark booking as confirmed
        booking.confirm = true;
        await booking.save();
        return res.status(200).json({
            message: "Booking confirmed and tenant updated",
            booking,
            tenant
        });
    }
    catch (error) {
        console.error("Error confirming booking:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.confirmBookingRequest = confirmBookingRequest;
// --------------------------DECLINE--REQUEST--------------------------------------------
const declineRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const ownerId = req.userId; // from verifyToken middleware
        if (!ownerId) {
            return res.status(401).json({ message: "Not authorized" });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: "Invalid request ID" });
        }
        const deletedRequest = await bookingModel_1.default.findByIdAndDelete(requestId);
        if (!deletedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }
        res.status(200).json({ message: "Request declined and deleted successfully" });
    }
    catch (error) {
        console.error("Error declining request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.declineRequest = declineRequest;
// --------------------------MY TENANTS---------------------------------
const getConfirmedTenants = async (req, res) => {
    try {
        const ownerId = req.userId; // from verifyToken middleware
        if (!ownerId) {
            return res.status(401).json({ message: "Not authorized" });
        }
        // Count confirmed bookings
        const totalConfirmed = await bookingModel_1.default.countDocuments({
            ownerId,
            confirm: true
        });
        // Fetch confirmed bookings with details
        const confirmedBookings = await bookingModel_1.default.find({
            ownerId,
            confirm: true
        })
            .populate("tenantId", "name email phone") // get tenant details
            .populate("propertyId", "propertyName address"); // get property details
        return res.status(200).json({
            length: totalConfirmed, // total confirmed tenants count
            tenants: confirmedBookings
        });
    }
    catch (error) {
        console.error("Error fetching tenants:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getConfirmedTenants = getConfirmedTenants;
