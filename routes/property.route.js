const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const upload = require("../middleware/upload");
const { verifyUser } = require("../middleware/auth.middleware");

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

router.get("/", propertyController.getAllProperties);

router.get("/recent", propertyController.getRecentProperties);

router.get("/search", propertyController.searchProperties);

router.get("/my", verifyUser, propertyController.getPropertiesByLoggedInUser);

router.get("/user/:userId", propertyController.getPropertiesByUserId);

router.get("/:id", propertyController.getPropertyById);

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

router.delete("/:id", verifyUser, propertyController.deleteProperty);

module.exports = router;
