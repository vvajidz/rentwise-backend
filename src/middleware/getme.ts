import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: string;
  role?:string;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token = "";

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "No token, not authorized." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // ✅ Correct field assignment
    req.userId = decoded.userId;
    req.role = decoded.role
    
    console.log("🧾 Decoded Payload:", decoded);
    console.log("📥 Incoming Cookie:", req.cookies);
    console.log("🔐 Extracted Token:", token);
    console.log("🧾 Decoded UserID:", decoded.userId); // ✅ should show ID

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
