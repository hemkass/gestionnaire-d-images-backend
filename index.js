require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(
  formidable({
    multiples: true,
  })
);

mongoose.connect("mongodb://localhost/PhotoLib");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photoRoutes = require("./routes/photo");
app.use(photoRoutes);

const UserRoutes = require("./routes/user");
app.use(UserRoutes);

app.all("*", (req, res) => {
  res.json("All routes");
});

app.listen(4000, () => {
  console.log("Serveur has started");
});
