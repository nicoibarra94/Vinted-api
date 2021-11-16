const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv").config();
const stripe = require("stripe")("sk_test_votreCléPrivée");

const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CONFIG_NAME,
  api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
  api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.title) {
      if (req.fields.title[51]) {
        return res.json({
          Error:
            "Please choose a title of your announcement of 50 characters maximum.",
        });
      }
    } else {
      return res.json({
        Message: "Please choose a title for your announcement.",
      });
    }

    if (req.fields.description) {
      if (req.fields.description[501]) {
        return res.json({
          Error: "Your description should be 500 characters at the maximum.",
        });
      }
    } else {
      return res.json({
        Message: "Please add a description for your announcement.",
      });
    }

    if (req.fields.price) {
      if (req.fields.price > 10000) {
        return res.json({
          Message: "Your announcement can not have a price higher than 10000e.",
        });
      }
    } else {
      return res.json({
        Message: "Please indicate the price of what you sell.",
      });
    }

    if (req.fields.condition) {
    } else {
      return res.json({
        Message: "Please indicate the condition of what you sell.",
      });
    }

    if (req.fields.city) {
    } else {
      return res.json({
        Message: "Please indicate where are you located.",
      });
    }

    if (req.fields.brand) {
    } else {
      return res.json({
        Message: "Please indicate the brand of what you sell.",
      });
    }

    if (req.fields.size) {
    } else {
      return res.json({
        Message: "Please indicate the size of what you sell.",
      });
    }

    if (req.fields.color) {
    } else {
      return res.json({
        Message: "Please indicate the color of what you sell.",
      });
    }

    let pictureToUpload = req.files.picture.path;
    const result = await cloudinary.uploader.upload(pictureToUpload, {
      folder: "/Vinted/Offers",
    });
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ETAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
        { produc_image: result },
      ],
      owner: req.user,
    });
    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
});

router.post("/offer/update", isAuthenticated, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
});

router.post("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.id) {
      const offerToDelete = await Offer.findById(req.fields.id);
      offerToDelete.remove();
      return res.json({ Message: "Your announcement has been deleted." });
    } else {
      return res.json({
        Message: "Please indicate the announcement you want to delete.",
      });
    }
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    if (req.params.id) {
      const search = await Offer.findById(req.params.id).populate({
        path: "owner",
        select: "account",
      });
      return res.json(search);
    } else {
      return res.json("Please enter a valid ID.");
    }
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMax) {
      filters.product_price = { $lte: req.query.priceMax };
    }

    if (req.query.priceMin) {
      if (filters.product_price) {
        filters.product_price.$gte = req.query.priceMin;
      } else {
        filters.product_price = { $gte: req.query.priceMin };
      }
    }

    let sort = "";

    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    } else {
      sort = { product_price: 1 };
    }

    let page = 1;
    let limit = 20;

    if (req.query.page) {
      page = Number(req.query.page);
    }

    const offers = await Offer.find(filters)
      .populate({ path: "owner", select: "account" })
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    let counter = offers.length;

    return res.json({ count: counter, offers: offers });
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
});

router.post("/payment", async (req, res) => {
  try {
    const stripeToken = req.fields.stripeToken;
    const amount = req.fields.price;
    const description = req.fields.name;

    const response = await stripe.charges.create({
      amount: amount,
      currency: "eur",
      description: description,
      source: stripeToken,
    });
    res.json(response);
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
});

module.exports = router;
