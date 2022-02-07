const mongoose = require("mongoose");
const Photo = mongoose.model("Photo", {
  public_id: { type: String },
  photo_name: { type: String, maxLength: 50 },
  product_description: { type: String, maxLength: 500 },
  created_at: { type: String },
  original_filename: { type: String },
  secure_url: { type: String },
  width: { type: String },
  height: { type: String },
  format: { type: String },
  product_image: { type: mongoose.Schema.Types.Mixed, default: {} },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Photo;
