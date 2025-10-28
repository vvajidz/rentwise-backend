"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = exports.logout = exports.login = exports.signup = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const role_1 = require("../constatnts.ts/role");
const passHash_1 = require("../services/passHash");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tenantModel_1 = __importDefault(require("../models/tenantModel"));
const ownerModel_1 = __importDefault(require("../models/ownerModel"));
// SIGNUP-------------------------------
const signup = async (req, res) => {
    try {
        const { fullName, email, password, role: rawRole, phone, agreedToTerms } = req.body;
        if (!fullName || !email || !password || !rawRole || agreedToTerms !== true) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        const role = rawRole.toLowerCase();
        if (![role_1.ROLES.TENANT, role_1.ROLES.OWNER, role_1.ROLES.ADMIN].includes(role)) {
            return res.status(400).json({ message: "Invalid role." });
        }
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists." });
        }
        const passwordHash = await (0, passHash_1.hashPassword)(password);
        const newUser = await userModel_1.default.create({
            fullName,
            email,
            passwordHash,
            role,
            phone,
            agreedToTerms,
        });
        if (role === role_1.ROLES.TENANT) {
            await tenantModel_1.default.create({ user: newUser._id });
        }
        else if (role === role_1.ROLES.OWNER) {
            await ownerModel_1.default.create({ user: newUser._id });
        }
        // 🔐 Create JWT
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // 🍪 Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return res.status(201).json({
            message: "Signup successful",
            user: {
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt,
            },
        });
    }
    catch (err) {
        console.error(" Signup error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.signup = signup;
// LOG-IN----------------------------------------------------------------------------------------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required." });
        }
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.status === "suspended") {
            return res.status(403).json({ message: "Isuue on Acoount Please contact support." });
        }
        const isMatch = await (0, passHash_1.comparePasswords)(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }
        const token = (0, passHash_1.generateToken)(user);
        console.log("✅ JWT Payload Preview:", jsonwebtoken_1.default.decode(token));
        res
            .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
            .status(200)
            .json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};
exports.login = login;
//---------------------------------------------------------------------LOGOUT
const logout = async (req, res) => {
    try {
        res
            .clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        })
            .status(200).json({
            message: "Logout successfully"
        });
    }
    catch (error) {
        console.error("Logout error ,", error);
        res.status(500).json({ message: "Server error during logout." });
    }
};
exports.logout = logout;
// -----------------------------------CHECK WHO AM I ---------------------------
const getMe = async (req, res) => {
    const userId = req.userId;
    try {
        const baseUser = await userModel_1.default.findById(userId).select("-passwordHash");
        if (!baseUser) {
            return res.status(404).json({ message: "User not found" });
        }
        let extendedData = null;
        if (baseUser.role === "owner") {
            extendedData = await ownerModel_1.default.findOne({ userId });
        }
        else if (baseUser.role === "tenant") {
            extendedData = await tenantModel_1.default.findOne({ userId });
        }
        res.status(200).json({
            ...baseUser.toObject(),
            ...extendedData?.toObject(), // optional chaining in case it's null
        });
    }
    catch (err) {
        console.error("getMe error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getMe = getMe;
// ------------------------------------------------------------------------tenant me--------
// export const getTenantMe = async (req: any, res: Response) => {
//   try {
//     const tenant = await Tenant.findOne({ userId: req.userId })
//       .populate("currentLease") // optional
//       .populate("wishlist")     // optional
//       .lean();
//     if (!tenant) {
//       return res.status(404).json({ message: "Tenant profile not found." });
//     }
//     res.status(200).json(tenant);
//   } catch (error) {
//     console.error("❌ Tenant fetch error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
// // ------------------------------------------------------------------------owner me--------
// export const getOwnerMe = async (req: any, res: Response) => {
//   try {
//     const owner = await Owner.findOne({ userId: req.userId })
//       .populate("properties") // optional
//       .lean();
//     if (!owner) {
//       return res.status(404).json({ message: "Owner profile not found." });
//     }
//     res.status(200).json(owner);
//   } catch (error) {
//     console.error("❌ Owner fetch error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
// --------------------------------------------------------------------------EDIT PROFILE---------
const updateMe = async (req, res) => {
    try {
        const allowedUpdates = ["fullName", "email", "phone", "profilePicture"];
        const updates = {};
        // Copy only allowed fields from request body
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }
        // Check if email is being updated
        if (updates.email) {
            const existingUser = await userModel_1.default.findOne({ email: updates.email });
            if (existingUser && existingUser._id.toString() !== req.userId) {
                return res.status(400).json({ message: "Email is already in use." });
            }
        }
        // Proceed to update
        const updatedUser = await userModel_1.default.findByIdAndUpdate(req.userId, { $set: updates }, { new: true, runValidators: true }).select("-passwordHash");
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error("Update error:", error);
        // Handle duplicate key error thrown by MongoDB
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({ message: "Email is already in use." });
        }
        res.status(500).json({ message: "Server error while updating user." });
    }
};
exports.updateMe = updateMe;
