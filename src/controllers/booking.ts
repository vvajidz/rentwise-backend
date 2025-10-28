import { Request, Response } from "express";
import Owner from "../models/ownerModel";
import Booking from "../models/bookingModel";

export const createBookingRequest = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.body;
    const tenantId = (req as any).userId; // JWT middleware attaches req.user

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // 1. Find owner for the property
    const owner = await Owner.findOne({ properties: propertyId });
    if (!owner) {
      return res.status(404).json({ message: "Owner not found for this property" });
    }

    // 2. Check if booking already exists for this tenant + property
    const existingBooking = await Booking.findOne({ tenantId, propertyId });
    if (existingBooking) {
      return res.status(409).json({ message: "You have already requested this property" });
    }

    // 3. Create booking request
    const booking = await Booking.create({
      ownerId: owner.user,
      tenantId,
      propertyId,
      confirm: false
    });

    return res.status(201).json({
      message: "Booking request created successfully",
      booking
    });

  } catch (error) {
    console.error("Error creating booking request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
