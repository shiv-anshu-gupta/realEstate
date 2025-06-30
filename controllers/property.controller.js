const { z } = require("zod");
const propertyModel = require("../models/property.model");

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
  console.log("📥 Raw req.body keys:");
  Object.keys(req.body).forEach((key) => {
    console.log(`${key} =>`, req.body[key]);
  });

  console.log("📥 Files received:");
  console.log("Images:", req.files?.images?.length || 0);
  console.log("Video:", req.files?.video?.[0]?.originalname || "None");
  console.log(
    "Floor Plan:",
    req.files?.floor_plan?.[0]?.originalname || "None"
  );

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

    // ✅ Parse JSON strings (like nearby, features) to objects/arrays
    ["nearby", "features"].forEach((key) => {
      if (typeof propertyData[key] === "string") {
        try {
          propertyData[key] = JSON.parse(propertyData[key]);
        } catch (err) {
          return res.status(400).json({
            error: `Invalid JSON format in '${key}' field`,
            debugValue: propertyData[key],
          });
        }
      }
    });

    // ✅ Handle optional numeric fields passed as empty strings
    ["rooms", "bedrooms", "bathrooms", "age", "latitude", "longitude"].forEach(
      (field) => {
        if (propertyData[field] === "") {
          propertyData[field] = undefined;
        }
      }
    );

    console.log("✅ Parsed propertyData:");
    console.dir(propertyData, { depth: null });

    // ✅ Validate data
    const validatedData = propertySchema.parse(propertyData);

    const newProperty = await propertyModel.insertProperty(validatedData);

    res.status(201).json({
      message: "Property created successfully",
      data: newProperty,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      console.error("❌ Zod validation failed:", err.errors);
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });
    }

    console.error("❌ Internal Server Error:", err);
    res.status(500).json({
      error: "Failed to create property",
      message: err.message,
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
    console.log("📥 Search filters:", filters);
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
exports.getPropertiesByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid or missing userId" });
    }

    const properties = await propertyModel.getPropertiesByUserId(userId);

    res.status(200).json({
      message: "Properties fetched successfully",
      data: properties,
    });
  } catch (err) {
    console.error("❌ Error fetching properties by userId:", err);
    res.status(500).json({
      error: "Failed to fetch properties",
      message: err.message,
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deleted = await propertyModel.deletePropertyById(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Property not found or already deleted" });
    }

    res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting property:", err);
    res.status(500).json({
      error: "Failed to delete property",
      message: err.message,
    });
  }
};

// ✅ UPDATE property by ID
exports.updateProperty = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const imageUrls = (req.files?.images || []).map((file) => file.path);
    const videoUrl = req.files?.video?.[0]?.path || null;
    const floorPlanUrl = req.files?.floor_plan?.[0]?.path || null;

    let propertyData = {
      ...req.body,
      images: imageUrls.length > 0 ? imageUrls : req.body.images,
      video: videoUrl || req.body.video,
      floor_plan: floorPlanUrl || req.body.floor_plan,
    };

    // Parse JSON fields
    ["nearby", "features", "images"].forEach((key) => {
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

    // Remove empty numeric fields
    ["rooms", "bedrooms", "bathrooms", "age", "latitude", "longitude"].forEach(
      (field) => {
        if (propertyData[field] === "") {
          propertyData[field] = undefined;
        }
      }
    );

    // Validate updated data
    const validatedData = propertySchema.parse(propertyData);

    const updated = await propertyModel.updatePropertyById(id, validatedData);

    if (!updated) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.status(200).json({
      message: "Property updated successfully",
      data: updated,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });
    }

    console.error("❌ Error updating property:", err);
    res.status(500).json({
      error: "Failed to update property",
      message: err.message,
    });
  }
};

exports.getBuyProperties = async (req, res) => {
  try {
    const buyProps = await propertyModel.searchProperties({ type: "buy" });
    res.status(200).json({
      message: "Buy properties fetched successfully",
      data: buyProps,
    });
  } catch (err) {
    console.error("❌ Error fetching buy properties:", err);
    res.status(500).json({
      error: "Failed to fetch buy properties",
      message: err.message,
    });
  }
};

exports.getRentProperties = async (req, res) => {
  try {
    const rentProps = await propertyModel.searchProperties({ type: "rent" });
    res.status(200).json({
      message: "Rent properties fetched successfully",
      data: rentProps,
    });
  } catch (err) {
    console.error("❌ Error fetching rent properties:", err);
    res.status(500).json({
      error: "Failed to fetch rent properties",
      message: err.message,
    });
  }
};

exports.getOfficeProperties = async (req, res) => {
  try {
    const officeProps = await propertyModel.searchProperties({
      sub_type: "office",
    });
    res.status(200).json({
      message: "Office properties fetched successfully",
      data: officeProps,
    });
  } catch (err) {
    console.error("❌ Error fetching office properties:", err);
    res.status(500).json({
      error: "Failed to fetch office properties",
      message: err.message,
    });
  }
};

exports.getAggreculturalProperties = async (req, res) => {
  try {
    const agProps = await propertyModel.searchProperties({
      sub_type: "Agricultural Land",
    });
    res.status(200).json({
      message: "Aggrecultural properties fetched successfully",
      data: agProps,
    });
  } catch (err) {
    console.error("❌ Error fetching aggricultural properties:", err);
    res.status(500).json({
      error: "Failed to fetch aggricultural properties",
      message: err.message,
    });
  }
};

exports.getPlotProperties = async (req, res) => {
  try {
    const plotProps = await propertyModel.searchProperties({
      sub_type: "plot",
    });
    res.status(200).json({
      message: "Plot properties fetched successfully",
      data: plotProps,
    });
  } catch (err) {
    console.error("❌ Error fetching plot properties:", err);
    res.status(500).json({
      error: "Failed to fetch plot properties",
      message: err.message,
    });
  }
};

exports.getNewProjectProperties = async (req, res) => {
  try {
    const newProps = await propertyModel.searchProperties({
      sub_type: "new-project",
    });
    res.status(200).json({
      message: "New project properties fetched successfully",
      data: newProps,
    });
  } catch (err) {
    console.error("❌ Error fetching new project properties:", err);
    res.status(500).json({
      error: "Failed to fetch new project properties",
      message: err.message,
    });
  }
};

exports.getPropertiesWithWishlist = async (req, res) => {
  try {
    const properties = await propertyModel.getAllPropertiesWithWishlist();

    // Debug log
    properties.forEach((p) => {
      if (!Number.isInteger(p.id)) {
        console.warn("⚠️ Invalid property ID found in DB:", p.id);
      }
    });

    res.status(200).json({
      message: "Properties with wishlist fetched successfully",
      data: properties,
    });
  } catch (err) {
    console.error("❌ Controller Error:", err);
    res.status(500).json({
      error: "Failed to fetch properties with wishlist",
      message: err.message || "Unexpected error occurred",
    });
  }
};

exports.getTotalPropertyCount = async (req, res) => {
  try {
    console.log("📥 Count request received");
    const totalCount = await propertyModel.countAllProperties();
    res.status(200).json({
      message: "Total properties count fetched successfully",
      count: totalCount,
    });
  } catch (err) {
    console.error("❌ Controller Error in getTotalPropertyCount:", err);
    res.status(500).json({
      error: "Failed to fetch property count",
      message: err.message,
    });
  }
};
