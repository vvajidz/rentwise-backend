"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = exports.propertyId = exports.properties = void 0;
const propertiesModel_1 = __importDefault(require("../models/propertiesModel"));
const ownerModel_1 = __importDefault(require("../models/ownerModel"));
// -----------------------ALL PROPERTY-------------------------------
const properties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [properties, total] = await Promise.all([
            propertiesModel_1.default.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            propertiesModel_1.default.countDocuments()
        ]);
        res.status(200).json({
            success: true,
            count: properties.length,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            data: properties
        });
    }
    catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
exports.properties = properties;
// -------------------------------------PROPERTY BY ID--------------------
const propertyId = async (req, res) => {
    try {
        const property = await propertiesModel_1.default.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.status(200).json({
            message: "Your property",
            property,
        });
    }
    catch (error) {
        console.error("Error on fetching property:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.propertyId = propertyId;
// -----------------------------------------------------------ADD-PROPERTY-----
const createProperty = async (req, res) => {
    try {
        const user = req.user;
        const userId = user.id;
        const { propertyName, propertyType, address, location, images, monthlyRent, leaseTerms, amenities, description, furnished, bedrooms, bathrooms, area, } = req.body;
        const newProperty = await propertiesModel_1.default.create({
            propertyName,
            propertyType,
            address,
            location,
            images,
            monthlyRent,
            leaseTerms,
            amenities,
            description,
            bedrooms,
            bathrooms,
            furnishing: furnished ? "fully-furnished" : "unfurnished",
            areaSqFt: parseInt(area),
            securityDeposit: monthlyRent * 2,
            availableFrom: new Date(),
            owner: userId,
        });
        const owner = await ownerModel_1.default.findOne({ userId });
        if (!owner) {
            return res.status(404).json({ message: "Owner not found" });
        }
        owner.properties.push(newProperty._id);
        await owner.save();
        return res.status(201).json({
            success: true,
            message: "Property created successfully",
            property: newProperty,
        });
    }
    catch (error) {
        console.error("❌ Error in createProperty:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.createProperty = createProperty;
