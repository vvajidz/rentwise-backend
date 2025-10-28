import { Request , Response } from "express";
import User from "../models/userModel"
import { ROLES } from "../constatnts.ts/role";
import { comparePasswords, generateToken, hashPassword } from "../services/passHash";
import { AuthRequest } from "../middleware/getme";
import jwt from "jsonwebtoken";
import Tenant from "../models/tenantModel";
import Owner from "../models/ownerModel";


// SIGNUP-------------------------------

export const signup = async (req: Request, res: Response) => {
  try {
    const {fullName,email,password,role: rawRole,phone,agreedToTerms} = req.body;

    if (!fullName ||!email ||!password ||!rawRole ||agreedToTerms !== true
) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const role = rawRole.toLowerCase();

    if (![ROLES.TENANT, ROLES.OWNER, ROLES.ADMIN].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      phone,
      agreedToTerms,
    });

    if (role === ROLES.TENANT) {
      await Tenant.create({ user: newUser._id });
    } else if (role === ROLES.OWNER) {
      await Owner.create({ user: newUser._id });
    }

    // 🔐 Create JWT
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

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
  } catch (err) {
    console.error(" Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// LOG-IN----------------------------------------------------------------------------------------------------

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Isuue on Acoount Please contact support." });
    }

    const isMatch = await comparePasswords(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user);
    console.log("✅ JWT Payload Preview:", jwt.decode(token));

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
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

//---------------------------------------------------------------------LOGOUT

export const logout = async(req:Request , res:Response) => {
    try{
        res
        .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
        })
        .status(200).json({
            message: "Logout successfully"
        })
    }catch(error){
        console.error("Logout error ," , error)
        res.status(500).json({ message: "Server error during logout." })
    }
}

// -----------------------------------CHECK WHO AM I ---------------------------




export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const baseUser = await User.findById(userId).select("-passwordHash");
    if (!baseUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let extendedData = null;

    if (baseUser.role === "owner") {
      extendedData = await Owner.findOne({ userId });
    } else if (baseUser.role === "tenant") {
      extendedData = await Tenant.findOne({ userId });
    }

    res.status(200).json({
      ...baseUser.toObject(),
      ...extendedData?.toObject(), // optional chaining in case it's null
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


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


export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const allowedUpdates = ["fullName", "email", "phone", "profilePicture"];
    const updates: any = {};

    // Copy only allowed fields from request body
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Check if email is being updated
    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email });

      if (existingUser && existingUser._id.toString() !== req.userId) {
        return res.status(400).json({ message: "Email is already in use." });
      }
    }

    // Proceed to update
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error("Update error:", error);

    // Handle duplicate key error thrown by MongoDB
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    res.status(500).json({ message: "Server error while updating user." });
  }
};

