const express = require("express");
const { isValidObjectId } = require("mongoose");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

//import du modèle
const User = require("../models/user");

// Inscription
router.post("/user/signup", async (req, res) => {
  if (req.fields.email !== undefined && req.fields.username !== undefined) {
    try {
      const isUser = await User.findOne({ email: req.fields.email });

      if (isUser) {
        res.json({ message: "email déjà présent" });
      } else {
        const password = req.fields.password;
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);

        const newUser = new User({
          token: uid2(16),
          salt: salt,
          hash: hash,
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
            //avatar:
          },
        });
        if (req.files.picture) {
          let avatarToUpload = req.files.picture.path;

          const result = await cloudinary.uploader.upload(avatarToUpload, {
            public_id: `PhotoLib/${newUser._id}/`,
            width: 100,
            height: 100,
            gravity: "faces",
            crop: "thumb",
            radius: "max",
          });

          newUser.account.avatar = result.secure_url;
        } else {
          newUser.account.avatar =
            "https: //res.cloudinary.com/dyj84szrx/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_mx,bo_5px_solid_red,b_rgb:262c35/v1635089804/vinted/users/blank-profile-picture-973461_1280_uxswkl.png";
        }
        console.log(newUser.account.avatar);
        await newUser.save();

        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
            phone: newUser.account.phone,
            avatar: newUser.account.avatar,
          },
        });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.status(428).json({ message: "mail and username required" });
  }
});

// Se connecter:
router.post("/user/login", async (req, res) => {
  try {
    const isUser = await User.findOne({ email: req.fields.email });

    if (isUser) {
      const newHash = SHA256(req.fields.password + isUser.salt).toString(
        encBase64
      );
      if (newHash === isUser.hash) {
        res.status(200).json({
          _id: isUser._id,
          token: isUser.token,
          account: {
            username: isUser.account.username,
            phone: isUser.account.phone,
          },
        });
      } else {
        res.status(428).json({ message: "Invalid password or mail" });
      }
    } else {
      res.status(428).json({ message: "Invalid request" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Trouver l'id d'un user via son token
router.get("/user/:token", async (req, res) => {
  try {
    console.log(req.params.token);
    const isUser = await User.findOne({ token: req.params.token });

    if (isUser) {
      res.json(isUser);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
