"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRole = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware factory: pass allowed roles like ["owner"]
const verifyRole = (roles) => {
    return (req, res, next) => {
        console.log("🔒 Middleware: verifyRole HIT");
        const tokenFromCookie = req.cookies.token;
        const tokenFromHeader = req.headers.authorization?.split(" ")[1];
        const token = tokenFromCookie || tokenFromHeader;
        console.log(token);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        console.log("nooooooo");
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Attach decoded user info to request
            req.user = decoded;
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Forbidden: Insufficient role" });
            }
            console.log("nexxtttttt");
            next();
            console.log("fishhhhh");
        }
        catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
};
exports.verifyRole = verifyRole;
