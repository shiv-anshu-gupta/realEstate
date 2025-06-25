const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/createWishlist.controller");

router.post("/create", wishlistController.addToWishlist);
module.exports = router;
