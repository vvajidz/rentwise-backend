"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminModel_1 = require("../models/adminModel");
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided.",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = await adminModel_1.Admin.findById(decoded.adminId); // checking Admin model
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Admins only.",
            });
        }
        req.user = admin;
        next();
    }
    catch (error) {
        console.error("Admin auth error:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
exports.verifyAdmin = verifyAdmin;
