const Cart = require("../models/Cart");
const auth = require("../auth");
const { errorHandler } = require("../auth");
const Product = require("../models/Product");

// Retrieve User's Cart
module.exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    return res.status(200).send(cart);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/* module.exports.getCart = async (req, res) => {
    try {
        // Extract token from the request header
        const token = req.headers.authorization.split(" ")[1];
        
        // Validate JWT and decode user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded._id;

        // Find the user's cart by their ID from the token
        const cart = await Cart.findOne({ user: userId });
        
        // If no cart is found, respond with a 404 status and message
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        // If cart is found, respond with a 200 status and the cart data
        return res.status(200).send(cart);
    } catch (error) {
        // Handle any errors, including JWT validation errors and DB errors
        return errorHandler(error, req, res);
    }
}; */

// Add To Cart
module.exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    console.log(productId);

    if (!cart) {
      cart = new Cart({ userId: userId, cartItems: [], totalPrice: 0 });
    }

    const cartItem = cart.cartItems.find(
      (item) => item.productId.toString() === productId
    );
    const productItem = await Product.findById(productId);

    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.subtotal += quantity * productItem.price;
    } else {
      // Add the new product to the cart
      cart.cartItems.push({
        productId,
        productName: productItem.name,
        price: productItem.price,
        quantity,
        subtotal: quantity * productItem.price,
      });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

    await cart.save();

    return res.status(200).send({ message: "Product added to cart", cart });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// Update Product Quantity in Cart
/* module.exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, newQuantity } = req.body;

        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

      
        const cartItem = cart.cartItems.find(item => item.productId.toString() === productId);
        if (!cartItem) {
            return res.status(404).send({ message: 'Product not found in cart' });
        }

      
        cartItem.quantity = newQuantity;
        cartItem.subtotal = cartItem.price * newQuantity;

        console.log(cartItem.quantity);

       
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

        
        await cart.save();

        return res.status(200).send({ message: 'Cart updated', cart });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};
 */

module.exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, newQuantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ message: "No cart found for this user." });
    }

    const productIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      const unitPrice =
        cart.cartItems[productIndex].subtotal /
        cart.cartItems[productIndex].quantity;

      cart.cartItems[productIndex].quantity = newQuantity;
      cart.cartItems[productIndex].subtotal = newQuantity * unitPrice;
    } else {
      return res.status(404).send({ message: "Item not found in cart" });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

    await cart.save();

    res.status(200).send({
      message: "Item quantity updated successfully",
      updatedCart: cart,
    });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating cart quantity", error: err.message });
  }
};

// S54
module.exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const productIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      cart.cartItems.splice(productIndex, 1);

      cart.totalPrice = cart.cartItems.reduce(
        (acc, item) => acc + item.subtotal,
        0
      );

      await cart.save();
      return res.status(200).send({ message: "Item removed from cart", cart });
    } else {
      return res.status(404).send({ message: "Product not found in cart" });
    }
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    if (cart.cartItems.length > 0) {
      // Clear all items from the cart
      cart.cartItems = [];
      cart.totalPrice = 0;

      // Save the updated cart
      await cart.save();
      return res
        .status(200)
        .send({ message: "Cart cleared successfully", cart });
    } else {
      return res.status(400).send({ message: "Cart is already empty" });
    }
  } catch (error) {
    return errorHandler(error, req, res);
  }
};
