const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  lookupProduct,
} = require("../controllers/productController");

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   brand:
 *                     type: string
 *                   picture:
 *                     type: string
 *                   price:
 *                     type: number
 *                   category:
 *                     type: string
 *                   nutritionalInfo:
 *                     type: object
 *                   quantityInStock:
 *                     type: integer
 *                   description:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       500:
 *         description: Error fetching products
 */
// Lookup by barcode (Open Food Facts)
router.get("/lookup/:barcode", lookupProduct);

router.get("/", getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 brand:
 *                   type: string
 *                 picture:
 *                   type: string
 *                 price:
 *                   type: number
 *                 category:
 *                   type: string
 *                 nutritionalInfo:
 *                   type: object
 *                 quantityInStock:
 *                   type: integer
 *                 description:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error fetching product
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Organic Almond Butter
 *               brand:
 *                 type: string
 *                 example: Nature's Choice
 *               picture:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               price:
 *                 type: number
 *                 example: 12.99
 *               category:
 *                 type: string
 *                 example: Nut Butter
 *               nutritionalInfo:
 *                 type: object
 *                 properties:
 *                   calories:
 *                     type: number
 *                     example: 190
 *                   protein:
 *                     type: number
 *                     example: 7
 *                   carbs:
 *                     type: number
 *                     example: 6
 *                   fat:
 *                     type: number
 *                     example: 18
 *                   fiber:
 *                     type: number
 *                     example: 3.5
 *               quantityInStock:
 *                 type: integer
 *                 example: 100
 *               description:
 *                 type: string
 *                 example: Creamy organic almond butter made from roasted almonds
 *             required:
 *               - name
 *               - brand
 *               - price
 *               - category
 *               - quantityInStock
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Error creating product
 */
router.post("/", auth, adminOnly, createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (Admin only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               brand:
 *                 type: string
 *               picture:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               nutritionalInfo:
 *                 type: object
 *               quantityInStock:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error updating product
 */
router.put("/:id", auth, adminOnly, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error deleting product
 */
router.delete("/:id", auth, adminOnly, deleteProduct);

module.exports = router;
