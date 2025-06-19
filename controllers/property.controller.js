const propertyModel = require("../models/property.model.js");
const { z } = require("zod");

// ✅ Updated Zod schema
const propertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10).max(5000),
  status: z.enum(["available", "sold", "pending", "onBid"]).optional(),
  type: z.enum(["rent", "sale"]),
  sub_type: z.string().optional(),
  rooms: z.coerce.number().min(1).optional(),
  area: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  images: z.array(z.string()).optional(),
  video: z.string().nullable().optional(),
  floor_plan: z.string().nullable().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  age: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  features: z.array(z.string()).optional(),
  nearby: z
    .array(
      z.object({
        title: z.string(),
        distance: z.string().optional(),
      })
    )
    .optional(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string(),
  user_id: z.coerce.number(),
});

exports.createProperty = async (req, res) => {
  try {
    const imageUrls = (req.files?.images || []).map((file) => file.path);
    const videoUrl = req.files?.video?.[0]?.path || null;
    const floorPlanUrl = req.files?.floor_plan?.[0]?.path || null;

    let propertyData = {
      ...req.body,
      images: imageUrls,
      video: videoUrl,
      floor_plan: floorPlanUrl,
    };

    // ✅ Parse 'nearby' and 'features' if sent as JSON strings
    ["nearby", "features"].forEach((key) => {
      if (typeof propertyData[key] === "string") {
        try {
          propertyData[key] = JSON.parse(propertyData[key]);
        } catch (err) {
          return res.status(400).json({
            error: `Invalid JSON format in '${key}' field`,
          });
        }
      }
    });

    // ✅ Remove empty strings from numeric optional fields
    ["rooms", "bedrooms", "bathrooms", "age", "latitude", "longitude"].forEach(
      (field) => {
        if (propertyData[field] === "") {
          propertyData[field] = undefined;
        }
      }
    );

    // ✅ Validate data
    const validatedData = propertySchema.parse(propertyData);

    console.log(
      "📦 Validated property data:",
      JSON.stringify(validatedData, null, 2)
    );

    const newProperty = await propertyModel.insertProperty(validatedData);

    res.status(201).json({
      message: "Property created successfully",
      data: newProperty,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });
    }

    console.error("❌ Error creating property:", err);
    res.status(500).json({
      error: "Failed to create property",
      message: err.message,
      pgCode: err.code,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await propertyModel.getAllProperties();
    res.status(200).json({
      message: "Properties fetched successfully",
      data: properties,
    });
  } catch (err) {
    console.error("❌ Error fetching properties:", err);
    res.status(500).json({
      error: "Failed to fetch properties",
      message: err.message,
    });
  }
};

exports.searchProperties = async (req, res) => {
  try {
    const {
      keyword,
      type,
      sub_type,
      location,
      page = 1,
      limit = 9,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filters = {};
    if (keyword) filters.keyword = keyword;
    if (type) filters.type = type;
    if (sub_type) filters.sub_type = sub_type;
    if (location) filters.location = location;

    const [properties, totalCount] = await Promise.all([
      propertyModel.searchProperties(filters, skip, parseInt(limit)),
      propertyModel.countFilteredProperties(filters),
    ]);

    res.status(200).json({
      message: "Properties fetched successfully",
      data: properties,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("❌ Error searching properties:", err);
    res.status(500).json({
      error: "Failed to search properties",
      message: err.message,
    });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const property = await propertyModel.getPropertyById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Property fetched successfully",
      data: property,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch property",
      message: err.message,
    });
  }
};

// ✅ NEW: Fetch latest 3 properties
exports.getRecentProperties = async (req, res) => {
  try {
    const recent = await propertyModel.getRecentProperties(3);
    res.status(200).json({
      message: "Latest properties fetched successfully",
      data: recent,
    });
  } catch (err) {
    console.error("❌ Error fetching recent properties:", err);
    res.status(500).json({
      error: "Failed to fetch recent properties",
      message: err.message,
    });
  }
};
