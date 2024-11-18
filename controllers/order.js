const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { errorHandler } = require("../auth");

module.exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    if (cart.cartItems.length === 0) {
      return res.status(400).send({ message: "No Items to Checkout" });
    }

    const newOrder = new Order({
      userId,
      productsOrdered: cart.cartItems,
      totalPrice: cart.totalPrice,
    });
    cart.cartItems = [];
    await cart.save();
    const savedOrder = await newOrder.save();

    return res.status(201).send({
      message: "Ordered successfully",
      order: savedOrder,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId });
    console.log(orders);
    if (!orders.length) {
      return res.status(404).send({ message: "No orders found" });
    }

    return res.status(200).send(orders);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.getAllOrders = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).send({ message: "Access denied. Admins only." });
    }

    const orders = await Order.find({});

    return res.status(200).send(orders);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};
