import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel";

// Extend Express Request type to include user property
interface CustomRequest extends Request {
  user?: any;
}

export const verifyAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided.",
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const admin = await Admin.findById(decoded.adminId); // checking Admin model

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admins only.",
      });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
