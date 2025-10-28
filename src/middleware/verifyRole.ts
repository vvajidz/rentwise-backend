
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedUser {
  id: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

// Middleware factory: pass allowed roles like ["owner"]
export const verifyRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
        console.log("🔒 Middleware: verifyRole HIT");
    const tokenFromCookie = req.cookies.token;
    const tokenFromHeader = req.headers.authorization?.split(" ")[1];
    const token = tokenFromCookie || tokenFromHeader;
    console.log(token)
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    console.log("nooooooo")

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedUser;

      // Attach decoded user info to request
      (req as any).user = decoded;

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }
      console.log("nexxtttttt")
      next();
      console.log("fishhhhh")
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
