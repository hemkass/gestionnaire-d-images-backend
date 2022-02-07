const express = require("express");
const router = express.Router();

//import des modèles
const User = require("./models/user");

const auth = async (req, res, next) => {
  if (req.headers.authorization) {
    const mytoken = req.headers.authorization.replace("Bearer ", "");
    const isUser = await User.findOne({ token: mytoken });
    //console.log("hello", isUser);

    if (!isUser) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = isUser;
      //console.log("j'ai bien été identifié par le middle");

      return next();
    }
  } else {
    return res.status(401).json({ error: "Please log in" });
  }
};

module.exports = auth;
