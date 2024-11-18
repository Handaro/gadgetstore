const Product = require("../models/Product");
const { errorHandler } = require("../auth");

module.exports.createProduct = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).send({ error: "Access denied. Admins only." });
    }

    const { name, description, price } = req.body;

    if (!name || !description || !price) {
      return res
        .status(400)
        .send({ error: "All fields (name, description, price) are required" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
    });

    const savedProduct = await newProduct.save();

    return res
      .status(201)
      .send({ message: "Product created successfully", product: savedProduct });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.getAllProducts = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).send({ error: "Access denied. Admins only." });
    }

    const products = await Product.find({});

    return res.status(200).send(products);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.getAllActiveProducts = async (req, res) => {
  try {
    const activeProducts = await Product.find({ isActive: true });

    return res.status(200).send(activeProducts);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.getProductById = async (req, res) => {
  try {
    const { productid } = req.params;

    const product = await Product.findById(productid);

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    return res.status(200).send(product);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).send({ error: "Access denied. Admins only." });
    }

    const { productid } = req.params;

    const { name, description, price } = req.body;

    if (!name && !description && !price) {
      return res.status(400).send({
        error:
          "At least one field (name, description, price) must be provided to update",
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (price) updateFields.price = price;

    const updatedProduct = await Product.findByIdAndUpdate(
      productid,
      updateFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    return res.status(200).send({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.archiveProduct = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).send({ error: "Access denied. Admins only." });
    }

    const { productid } = req.params;

    const product = await Product.findById(productid);

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    product.isActive = false;
    await product.save();

    return res
      .status(200)
      .send({ message: "Product archived successfully", product });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};
module.exports.activateProduct = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).send({ error: "Access denied. Admins only." });
    }

    const { productid } = req.params;

    const product = await Product.findById(productid);

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    product.isActive = true;
    await product.save();

    return res
      .status(200)
      .send({ message: "Product activated successfully", product });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.searchProductsByName = async (req, res) => {
  try {
    const { name } = req.body;

    // Perform case-insensitive search for products by name
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
    });

    return res.status(200).send(products);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.searchProductsByPrice = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;

    if (minPrice === undefined || maxPrice === undefined) {
      return res
        .status(400)
        .send({ message: "Both minPrice and maxPrice are required" });
    }

    const products = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice },
    });

    return res.status(200).send(products);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};
