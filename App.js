const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const wishlistRoutes = require("./routes/wishlist.routes");
const adminRoutes = require("./routes/admin.route");
// 🌐 Parse allowed origins from .env
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : [];

const PORT = process.env.PORT || 3000;

console.log("🌍 Allowed Frontend URLs:", allowedOrigins);

// ✅ Setup dynamic CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ CORS Not Allowed: " + origin));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

// ✅ DB connection
require("./connect");

// ✅ Routes
const userRoutes = require("./routes/user.route");
const propertyRoutes = require("./routes/property.route");
const contactRoute = require("./routes/contact.route");
const inquiryRoute = require("./routes/Inquiry.route");
const tourRoute = require("./routes/tour.route");

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.use("/property", propertyRoutes);
app.use("/user", userRoutes);
app.use("/contact", contactRoute);
app.use("/Inquiry", inquiryRoute);
app.use("/tour", tourRoute);
app.use("/wishlist", wishlistRoutes);
app.use("/admin", adminRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
