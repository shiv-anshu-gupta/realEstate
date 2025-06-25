const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/createWishlist.controller");

router.post("/create", wishlistController.addToWishlist);

router.get("/:userId", wishlistController.getWishlistByUser);

router.delete("/delete", wishlistController.removeFromWishlist);

module.exports = router;
