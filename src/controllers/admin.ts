import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel";
import User from "../models/userModel";
import Owner from "../models/ownerModel";
import roperty from "../models/propertiesModel";

// ----------------------------adminLogin---------

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Compare password directly (plain text)
    if (password !== admin.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // 5. Set HTTP-only cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // 6. Respond
    res.json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token:token
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------fetch all users ..----------

export const fetchUsers = async (req: Request, res: Response) => {
  try {
    // 1. Basic find all users
    // const users = await User.find({});

    // 2. Better: Exclude sensitive fields and add pagination
    const { page = 1, limit = 20, search } = req.query;
    
    const query = search 
      ? { 
          $or: [
            { name: { $regex: search as string, $options: 'i' } },
            { email: { $regex: search as string, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password -__v -refreshToken') // Exclude sensitive fields
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Newest first

    const totalUsers = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      page: Number(page),
      pages: Math.ceil(totalUsers / Number(limit)),
      data: users
    });

  } catch (error) {
    console.error('UsersController Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users'
    });
  }
};

// ----------------------------By role fetching --------------------

export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const allowedRoles = ["owner", "tenant", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role type",
      });
    }

    if (role === "owner") {
      // Get owners, populate user info, add property count
      const owners = await Owner.find()
        .populate({ path: "user", select: "fullName email status profilePicture" })
        .lean();

      const data = owners.map((owner) => ({
        ownerId: owner._id,
        user: owner.user,
        propertyCount: owner.properties?.length || 0,
        // verificationStatus: owner.verificationStatus || "pending",
      }));

      return res.status(200).json({
        success: true,
        role,
        count: data.length,
        data,
      });
    } else if (role === "tenant") {
      // Just get tenants from User collection
      const tenants = await User.find({ role: "tenant" }).select("-password -refreshToken").lean();

      return res.status(200).json({
        success: true,
        role,
        count: tenants.length,
        data: tenants,
      });
    } else {
      // Admins from Admin collection
      const admins = await Admin.find().select("-password -refreshToken").lean();

      return res.status(200).json({
        success: true,
        role,
        count: admins.length,
        data: admins,
      });
    }
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// -----------------------------------------------------------------------------------------


export const userStatus = async (req: Request, res: Response) => {
  try {
    const cleanId = req.params.userId.trim();

    const user = await User.findById(cleanId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newStatus = user.status === "active" ? "suspended" : "active";
    user.status = newStatus;
    await user.save();

    res.json({
      message: `User status changed to ${newStatus}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggling user status", error });
  }
};

