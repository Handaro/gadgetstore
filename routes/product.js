const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const { verify, verifyAdmin } = require("../auth");

// Routes
router.post("/", verify, verifyAdmin, productController.createProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/active", productController.getAllActiveProducts);

router.get("/:productid", productController.getProductById);

router.patch(
  "/:productid/update",
  verify,
  verifyAdmin,
  productController.updateProduct
);

router.patch(
  "/:productid/archive",
  verify,
  verifyAdmin,
  productController.archiveProduct
);

router.patch(
  "/:productid/activate",
  verify,
  verifyAdmin,
  productController.activateProduct
);

router.post("/search-by-name", productController.searchProductsByName);

router.post("/search-by-price", productController.searchProductsByPrice);

module.exports = router;
