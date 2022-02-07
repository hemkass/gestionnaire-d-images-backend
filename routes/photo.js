const express = require("express");
const router = express.Router();

/* import des modèles */
const Photo = require("../Models/photo");
const User = require("../models/user");

// import de ma fonction middleware
const auth = require("../middleWare");

const cloudinary = require("cloudinary").v2;

router.post("/photo/add", auth, async (req, res) => {
  try {
    if (req.user) {
      if (req.files.picture) {
        let name = "untitled";
        let description = "No description";
        if (req.fields.name) {
          name = req.fields.name;
        }

        if (req.fields.description) {
          description = description;
        }

        const num = 10; // limite max de photos par produit
        if (req.files.picture.length > num) {
          res.status(408).json({ message: "${num} pictures maximum" });
        } else {
          let photosInfo = [];

          /* Traitement du cas où une seule photo est envoyée et donc ce n'est pas un array */

          if (Array.isArray(req.files.picture) === false) {
            const newPhoto = new Photo({
              photo_name: name,
              photo_desc: description,
              owner: req.user,
            });
            const picturesToUpload = req.files.picture.path;
            if ((name = "untitled")) {
              name = newPhoto._id;
            }

            const result = await cloudinary.uploader.upload(picturesToUpload, {
              public_id: `PhotoLib/photo/${newPhoto._id}`,
            });
            newPhoto.public_id = `PhotoLib/${req.user._id}/${newPhoto._id}`;
            newPhoto.created_at = result.created_at;
            newPhoto.original_filename = result.original_filename;
            newPhoto.secure_url = result.secure_url;
            newPhoto.width = result.width;
            newPhoto.height = result.height;
            newPhoto.format = result.format;

            await newPhoto.save();
            res.status(200).json(newPhoto);
          } else {
            /* Cas où plusieurs photos sont envoyées en même temps */
            for (let i = 0; i < req.files.picture.length; i++) {
              let picturesToUpload = "";
              const newPhoto = new Photo({
                photo_name: name,
                photo_desc: description,
                owner: req.user,
              });
              if ((name = "untitled")) {
                name = newPhoto._id;
              }
              picturesToUpload = req.files.picture[i].path;

              const result = await cloudinary.uploader.upload(
                picturesToUpload,
                {
                  public_id: `PhotoLib/${req.user._id}/${newPhoto._id}`,
                }
              );
              newPhoto.public_id = `PhotoLib/photo/${newPhoto._id}`;
              newPhoto.created_at = result.created_at;
              newPhoto.original_filename = result.original_filename;
              newPhoto.secure_url = result.secure_url;
              newPhoto.width = result.width;
              newPhoto.height = result.height;
              newPhoto.format = result.format;
              await newPhoto.save();
              photosInfo.push(newPhoto);
            }
            res.status(200).json(photosInfo);
          }
        }
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ errorAddPhoto: error.message });
  }
});

/* effacer une photo  */
router.get("/photo/deleteOne", async (req, res) => {
  try {
    const isPhoto = await Photo.findByIdAndDelete(req.query.id);

    if (isPhoto) {
      cloudinary.api.delete_resources(isPhoto.public_id);
      return res.json({
        message: `your photo  has been deleted`,
      });
    } else {
      return res.status(428).json({ error: "No photo found" });
    }
  } catch (error) {
    res.status(400).json({ errorDeleteOne: error.message });
  }
});

/* effacer plusieurs photos  */
router.post("/photo/deleteMany", async (req, res) => {
  try {
    console.log(req.fields.photos_ids.length);
    if (req.fields.photos_ids.length > 1) {
      for (let i = 0; i < req.fields.photos_ids.length; i++) {
        const isPhoto = await Photo.findByIdAndDelete(req.fields.photos_ids);
        if (isPhoto) {
          cloudinary.api.delete_resources(isPhoto.public_id);
        }
      }
      res.json({
        message: `yours photos  have been deleted`,
      });
      /*   const isPhoto = await Photo.findByIdAndDelete(req.query.id); */
    }
  } catch (error) {
    res.status(400).json({ errorDeleteMany: error.message });
  }
});

/* renommer une image  */
/* effacer une photo  */
router.post("/photo/rename", async (req, res) => {
  try {
    const isPhoto = await Photo.findByIdAndUpdate(
      req.fields.id,
      { photo_name: req.fields.name },
      { new: true }
    );
    if (isPhoto) {
      res.json({ isPhoto });
    } else {
      res.status(428).json({ message: "no photo found" });
    }
  } catch (error) {
    res.status(400).json({ errorDeleteOne: error.message });
  }
});

/* afficher mes images  */

module.exports = router;
