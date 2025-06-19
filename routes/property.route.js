const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const upload = require("../middleware/upload");
const { verifyUser } = require("../middleware/auth.middleware");

// ✅ Create a new property
router.post(
  "/create",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "floor_plan", maxCount: 1 },
  ]),
  verifyUser,
  propertyController.createProperty
);

// ✅ Get all properties
router.get("/", propertyController.getAllProperties);

// ✅ Get recent properties
router.get("/recent", propertyController.getRecentProperties);

// ✅ Search properties
router.get("/search", propertyController.searchProperties);

// ✅ Get properties by user ID
router.get("/user/:userId", propertyController.getPropertiesByUserId);

// ✅ Get property by ID
router.get("/:id", propertyController.getPropertyById);

// ✅ Update property by ID
router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "floor_plan", maxCount: 1 },
  ]),
  verifyUser,
  propertyController.updateProperty
);

// ✅ Delete property by ID
router.delete("/:id", verifyUser, propertyController.deleteProperty);

module.exports = router;
