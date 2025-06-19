const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");

// ✅ Import the database connection file (this will log the env check)
require("./connect"); // this runs your DB connection setup

const userRoutes = require("./routes/user.route");
const propertyRoutes = require("./routes/property.route");
const contactRoute = require("./routes/contact.route");
const inquiryRoute = require("./routes/Inquiry.route");

const cors = require("cors");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL;

console.log("🌍 FRONTEND_URL =", frontendUrl);

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.use("/property", propertyRoutes);
app.use("/user", userRoutes);
app.use("/contact", contactRoute);
app.use("/Inquiry", inquiryRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
