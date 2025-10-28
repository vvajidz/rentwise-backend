"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const verifyToken = (req, res, next) => {
    let token = "";
    if (req.cookies?.token) {
        token = req.cookies.token;
    }
    else if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res.status(401).json({ message: "No token, not authorized." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // ✅ Correct field assignment
        req.userId = decoded.userId;
        req.role = decoded.role;
        console.log("🧾 Decoded Payload:", decoded);
        console.log("📥 Incoming Cookie:", req.cookies);
        console.log("🔐 Extracted Token:", token);
        console.log("🧾 Decoded UserID:", decoded.userId); // ✅ should show ID
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};
exports.verifyToken = verifyToken;
