const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

// const User = require("../Vinted/models/User");
// const Offer = require("../Vinted/models/Offer");
const OfferRoutes = require("./routes/OfferRoutes.js");
const UserRoutes = require("./routes/UserRoute.js");

app.use(UserRoutes);
app.use(OfferRoutes);

mongoose.connect(process.env.MONGODB_URI);

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
