import express from 'express'
import {
  addProductReview,
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCatgory,
  updateProduct
} from '../controller/products.controller.js'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import { validate } from '../../../shared/middleware/validate.middleware.js'
import { createProductSchema, ratingSchema, updateProductSchema } from '../product.schema.js'
import { objectIdSchema } from '../../../shared/schemas/objectId.schema.js'
import { upload } from '../../../shared/middleware/upload.middleware.js'
import { uploadToCloudinary } from '../../../shared/middleware/uploadToCloudinary.middleware.js'

const productRouter = express.Router()

productRouter.get('/', getAllProducts)
productRouter.get('/category/:cat', getProductsByCatgory)
productRouter.get('/:id', validate(objectIdSchema, 'params'), getProductById)

productRouter.post('/',
  authenticate,
  authorize('admin'),
  validate(createProductSchema),    // ← validate FIRST
  upload.array('images', 5),        // ← then upload
  uploadToCloudinary,
  createProduct
)

productRouter.put('/:id',
  authenticate,
  authorize('admin'),
  validate(objectIdSchema, 'params'),
  validate(updateProductSchema),    // ← validate FIRST
  upload.array('images', 5),        // ← then upload
  uploadToCloudinary,
  updateProduct
)



productRouter.delete('/:id',
  authenticate,
  authorize('admin'),
  validate(objectIdSchema, 'params'),
  deleteProduct
)

productRouter.post('/:id/rating',
  authenticate,
  authorize('customer'),
  validate(objectIdSchema, 'params'),
  validate(ratingSchema),
  addProductReview
)

export default productRouter