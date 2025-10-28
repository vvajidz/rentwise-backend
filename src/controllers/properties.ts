import { Response , Request, response } from "express"
import Property from "../models/propertiesModel"
import Owner from "../models/ownerModel";
import { log } from "console";

// -----------------------ALL PROPERTY-------------------------------


export const properties = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: properties
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// -------------------------------------PROPERTY BY ID--------------------


export const propertyId = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Your property",
      property,
    });
  } catch (error) {
    console.error("Error on fetching property:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// -----------------------------------------------------------ADD-PROPERTY-----

export const createProperty = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; 
    const userId = user.id;

    const {
      propertyName,
      propertyType,
      address,
      location,
      images,
      monthlyRent,
      leaseTerms,
      amenities,
      description,
      furnished,
      bedrooms,
      bathrooms,
      area,
    } = req.body;

    const newProperty = await Property.create({
      propertyName,
      propertyType,
      address,
      location,
      images,
      monthlyRent,
      leaseTerms,
      amenities,
      description,
      bedrooms,
      bathrooms,
      furnishing: furnished ? "fully-furnished" : "unfurnished",
      areaSqFt: parseInt(area),
      securityDeposit: monthlyRent * 2,
      availableFrom: new Date(),
      owner: userId,
    });

    const owner = await Owner.findOne({ userId });
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    owner.properties.push(newProperty._id);
    await owner.save();

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: newProperty,
    });
  } catch (error: any) {
    console.error("❌ Error in createProperty:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


