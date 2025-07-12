const jwt = require("jsonwebtoken");

exports.verifyUser = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided. Please log in.",
      });
    }

    const secret = process.env.JWT_SECRET || "your-secret-key";

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Invalid or expired token. Please log in again.",
        });
      }
      req.user = decoded;
      console.log("✅ User verified:", req.user);
      next();
    });
  } catch (error) {
    console.error("Error in verifyUser middleware:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};
