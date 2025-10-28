"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantCurrentProperty = void 0;
const tenantModel_1 = __importDefault(require("../models/tenantModel"));
const propertiesModel_1 = __importDefault(require("../models/propertiesModel"));
const getTenantCurrentProperty = async (req, res) => {
    try {
        const userId = req.userId;
        console.log(userId);
        const role = req.role;
        console.log("iam role :", role);
        // Step 2: Check role
        if (role !== "tenant") {
            return res.status(403).json({ message: "Access denied. Only tenants allowed." });
        }
        // Step 3: Find tenant doc
        const tenant = await tenantModel_1.default.findOne({ user: userId });
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }
        // Step 4: Get currentProperty ID
        if (!tenant.currentProperty) {
            return res.status(404).json({ message: "No current property assigned" });
        }
        // Step 5: Get property details
        const property = await propertiesModel_1.default.findById(tenant.currentProperty);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        // Step 6: Return property details
        return res.status(200).json({
            message: "Current property fetched successfully",
            property
        });
    }
    catch (error) {
        console.error("Error fetching current property:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getTenantCurrentProperty = getTenantCurrentProperty;
