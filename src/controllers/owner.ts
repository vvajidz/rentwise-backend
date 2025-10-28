import { Response , Request} from "express"
import mongoose from "mongoose";
import Owner from "../models/ownerModel";
import Property from "../models/propertiesModel";
import Booking from "../models/bookingModel";
import Tenant from "../models/tenantModel";

// --------------------------------------------------ADD PROPERTIES--------------------------------------------------

export const getOwnerWithProperties = async (req: Request, res: Response) => {
  const { ownerId } = req.params;
  try {
    const owner = await Owner.findOne({user : ownerId})
      .populate('properties'); // if `properties` is [ObjectId] to Property

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    res.status(200).json(owner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' })
  }
};

// ---------------------------EDIT PROPERTY----------------------------------------------------------------------

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const ownerId = (req as any).userId; // from JWT middleware

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    // Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if current user owns the property
    // Assuming your property model has an ownerId field (add it if not present)
    if (String((property as any).ownerId) !== String(ownerId)) {
      return res.status(403).json({ message: "You are not authorized to edit this property" });
    }

    // Update property with only provided fields
    Object.assign(property, req.body);

    await property.save();

    res.status(200).json({
      message: "Property updated successfully",
      property
    });

  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------------------ACCEPTED REQUEST------------------------------------------------------------

export const getOwnerBookingRequests = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).userId; // from verifyToken
    
    if (!ownerId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const requests = await Booking.find({
      ownerId,
      confirm: false
    })
      .populate("tenantId", "fullName email") // Show tenant info
      .populate("propertyId", "propertyName location price"); // Show property info

    return res.status(200).json({
      message: "Pending booking requests fetched successfully",
      requests
    });
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------CONFIRM REQUEST--------------------------

export const confirmBookingRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // booking ID

    // 1. Find booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2. Find tenant
    const tenant = await Tenant.findOne({ user: booking.tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // 3. Update tenant's current property
    tenant.currentProperty = booking.propertyId;
    await tenant.save();

    // 4. Mark booking as confirmed
    booking.confirm = true;
    await booking.save();

    return res.status(200).json({
      message: "Booking confirmed and tenant updated",
      booking,
      tenant
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------------DECLINE--REQUEST--------------------------------------------

export const declineRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const ownerId = (req as any).userId; // from verifyToken middleware

    if (!ownerId) {

      return res.status(401).json({ message: "Not authorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const deletedRequest = await Booking.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request declined and deleted successfully" });
  } catch (error) {
    console.error("Error declining request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------MY TENANTS---------------------------------
export const getConfirmedTenants = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).userId; // from verifyToken middleware

    if (!ownerId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Count confirmed bookings
    const totalConfirmed = await Booking.countDocuments({
      ownerId,
      confirm: true
    });

    // Fetch confirmed bookings with details
    const confirmedBookings = await Booking.find({
      ownerId,
      confirm: true
    })
      .populate("tenantId", "name email phone") // get tenant details
      .populate("propertyId", "propertyName address"); // get property details

    return res.status(200).json({
      length: totalConfirmed, // total confirmed tenants count
      tenants: confirmedBookings
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
