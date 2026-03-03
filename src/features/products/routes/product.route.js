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

const productRouter = express.Router()

productRouter.get('/', getAllProducts)
productRouter.get('/category/:cat', getProductsByCatgory)
productRouter.get('/:id', getProductById)

productRouter.post('/', authenticate, authorize('admin'), createProduct)
productRouter.put('/:id', authenticate, authorize('admin'), updateProduct)
productRouter.delete('/:id', authenticate, authorize('admin'), deleteProduct)
productRouter.post('/:id/rating', authenticate, authorize('customer'), addProductReview)

export default productRouter
