"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.comparePasswords = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hashPassword = async (password) => {
    return await bcryptjs_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
const comparePasswords = async (inputPassword, hashedPassword) => {
    return await bcryptjs_1.default.compare(inputPassword, hashedPassword);
};
exports.comparePasswords = comparePasswords;
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({
        userId: user._id.toString(),
        role: user.role
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};
exports.generateToken = generateToken;
