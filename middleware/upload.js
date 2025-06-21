// middleware/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: isVideo ? "property_videos" : "properties",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "mov", "avi", "webm"]
        : ["jpg", "jpeg", "png"],
      public_id: `media-${Date.now()}-${file.originalname.split(".")[0]}`,
      transformation: !isVideo
        ? [{ width: 800, height: 600, crop: "limit" }]
        : undefined,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
