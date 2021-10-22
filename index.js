const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

mongoose.connect(process.env.MONGODB_URI);

const app = express();
app.use(formidable());
app.use(cors());

// const User = require("../Vinted/models/User");
// const Offer = require("../Vinted/models/Offer");
const OfferRoutes = require("./routes/OfferRoutes");
const UserRoutes = require("./routes/UserRoutes");

app.use(UserRoutes);
app.use(OfferRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
