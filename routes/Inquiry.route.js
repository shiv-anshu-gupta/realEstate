const express = require("express");

const { handleAgentInquiry } = require("../controllers/inquiry.controller.js");

const router = express.Router();

router.post("/", handleAgentInquiry);

module.exports = router;
