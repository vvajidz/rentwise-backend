import bcrypt from "bcryptjs"
import jwt , {SignOptions} from "jsonwebtoken";
import { IUser } from "../models/userModel";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (inputPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

export const generateToken = (user : IUser): string => {
    return jwt.sign(
        {
            userId : user._id.toString(),
            role: user.role
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn:"7d"
        }
    )
}