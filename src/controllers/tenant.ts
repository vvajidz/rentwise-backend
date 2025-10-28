import { Request, Response } from "express";
import Tenant from "../models/tenantModel";
import Property from "../models/propertiesModel";

export const getTenantCurrentProperty = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    console.log(userId);
    
    const role = (req as any).role;
    console.log("iam role :", role)
    // Step 2: Check role
    if (role !== "tenant") {
      return res.status(403).json({ message: "Access denied. Only tenants allowed." });
    }

    // Step 3: Find tenant doc
    const tenant = await Tenant.findOne({ user: userId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Step 4: Get currentProperty ID
    if (!tenant.currentProperty) {
      return res.status(404).json({ message: "No current property assigned" });
    }

    // Step 5: Get property details
    const property = await Property.findById(tenant.currentProperty);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Step 6: Return property details
    return res.status(200).json({
      message: "Current property fetched successfully",
      property
    });

  } catch (error) {
    console.error("Error fetching current property:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
