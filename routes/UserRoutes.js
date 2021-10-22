const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary");
const dotenv = require("dotenv").config();

const User = require("../models/User");
const isAuthenticated = require("../middlewares/isAuthenticated");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

cloudinary.config({
  cloud_name: "dtzfzb7ju",
  api_key: "881765573571266",
  api_secret: "np_r6u7EHuvSAMDPn-e0f2M0lE4",
});

router.post("/user/signup", async (req, res) => {
  try {
    if (req.fields.email) {
    } else {
      return res.json({ Message: "Please enter your email." });
    }

    if (req.fields.username) {
    } else {
      return res.json({ Message: "Please choose a Username." });
    }

    if (req.fields.phone) {
    } else {
      return res.json({ Message: "Please indicate your phone number." });
    }

    if (req.fields.password) {
    } else {
      return res.json({ Message: "Please choose a password." });
    }

    try {
      const userEmailSearch = await User.findOne({ email: req.fields.email });
      if (req.fields.email === userEmailSearch.email) {
        return res.json({
          Error: "This email is already associated with an account.",
        });
      }
    } catch {}

    let pictureToUpload = req.files.avatar.path;
    const result = await cloudinary.uploader.upload(pictureToUpload, {
      folder: "Vinted/usersAvatarPhotos",
    });

    const password = req.fields.password;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);
    const newUser = new User({
      email: req.fields.email,
      account: {
        username: req.fields.username,
        phone: req.fields.phone,
        avatar: result,
      },
      token: token,
      hash: hash,
      salt: salt,
    });
    await newUser.save();
    res.json({
      _id: newUser._id,
      email: newUser.email,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const userEmailSearch = await User.findOne({ email: req.fields.email });
    const hashUserLogIn = SHA256(
      req.fields.password + userEmailSearch.salt
    ).toString(encBase64);
    if (userEmailSearch.hash === hashUserLogIn) {
      res.json({
        _id: userEmailSearch._id,
        token: userEmailSearch.token,
        account: userEmailSearch.account,
      });
    } else {
      res.json({ Error: "Please enter a valid email address and password" });
    }
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
});

module.exports = router;
