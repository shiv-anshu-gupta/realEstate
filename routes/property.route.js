const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const upload = require("../middleware/upload");

// ✅ Create a new property with images, video, and floor plan
router.post(
  "/create",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "floor_plan", maxCount: 1 },
  ]),
  propertyController.createProperty
);

router.get("/", propertyController.getAllProperties);

router.get("/recent", propertyController.getRecentProperties);

router.get("/search", propertyController.searchProperties);

router.get("/:id", propertyController.getPropertyById);

module.exports = router;
