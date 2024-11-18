const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

const app = express();
require("dotenv").config();

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once("open", () =>
  console.log("Now connected to MongoDB Atlas")
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://zuitt-bootcamp-prod-481-7888-parpan.s3-website.us-east-1.amazonaws.com",
    "https://gadgetstore-mern.vercel.app",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

if (require.main === module) {
  app.listen(process.env.PORT, () =>
    console.log(`API is now online on port ${process.env.PORT}`)
  );
}

module.exports = { app, mongoose };
