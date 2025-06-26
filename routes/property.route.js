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

router.get("/", propertyController.getAllProperties);

router.get("/recent", propertyController.getRecentProperties);

router.get("/search", propertyController.searchProperties);

router.get("/listings/buy", (req, res) =>
  propertyController.searchProperties(
    { ...req, query: { ...req.query, type: "sale" } },
    res
  )
);

router.get("/listings/rent", (req, res) =>
  propertyController.searchProperties(
    { ...req, query: { ...req.query, type: "rent" } },
    res
  )
);

router.get("/listings/office", (req, res) =>
  propertyController.searchProperties(
    { ...req, query: { ...req.query, sub_type: "office" } },
    res
  )
);

router.get("/listings/aggricultural", (req, res) =>
  propertyController.searchProperties(
    { ...req, query: { ...req.query, sub_type: "aggricultural" } },
    res
  )
);

router.get("/listings/plots", (req, res) =>
  propertyController.searchProperties(
    { ...req, query: { ...req.query, sub_type: "plot" } },
    res
  )
);

router.get("/listings/new-projects", (req, res) =>
  propertyController.searchProperties(
    { ...req, query: { ...req.query, sub_type: "new-project" } },
    res
  )
);

router.get("/with-wishlist", propertyController.getPropertiesWithWishlist);

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
