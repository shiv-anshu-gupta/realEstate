// routes/contact.js
const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

router.post("/", contactController.handleContactForm);
router.get("/msg", contactController.getMessageCount);
router.get("/recent", contactController.getRecentMessages);
module.exports = router;
