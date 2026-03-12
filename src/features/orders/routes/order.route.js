import express from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import { cancelOrder, createOrder, getAllOrders, getAllOrdersToUser, getOrderById, updateOrderStatus } from '../controller/order.controller.js'
import { validate } from '../../../shared/middleware/validate.middleware.js'
import { createOrderSchema, updateOrderStatusSchema } from '../order.schemas.js';
import { objectIdSchema } from '../../../shared/schemas/objectId.schema.js'

const orderRouter = express.Router();

orderRouter.post('/', authenticate, authorize('customer'), validate(createOrderSchema), createOrder)
orderRouter.get('/', authenticate, authorize('admin'), getAllOrders)
orderRouter.get('/my-order', authenticate, authorize('customer'), getAllOrdersToUser)
orderRouter.get('/:id', authenticate, authorize('customer', 'admin'), validate(objectIdSchema, 'params'), getOrderById)
orderRouter.put('/:id/status', authenticate, authorize('admin'), validate(objectIdSchema, 'params'), validate(updateOrderStatusSchema), updateOrderStatus)
orderRouter.put('/:id/cancel', authenticate, authorize('customer'), validate(objectIdSchema, 'params'), cancelOrder)















export default orderRouter