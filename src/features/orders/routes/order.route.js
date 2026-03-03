import express from 'express'
import{authenticate, authorize} from '../../../shared/middleware/auth.middleware.js'
import { cancelOrder, createOrder, getAllOrders, getAllOrdersToUser, getOrderById, updateOrderStatus } from '../controller/order.controller.js';

const orderRouter=express.Router();

orderRouter.post('/',authenticate,authorize('customer'),createOrder)
orderRouter.get('/',authenticate,authorize('admin'),getAllOrders)
orderRouter.get('/my-order',authenticate,authorize('customer'),getAllOrdersToUser)
orderRouter.get('/:id',authenticate,authorize('customer','admin'),getOrderById)

orderRouter.put('/:id/status',authenticate,authorize('admin'),updateOrderStatus)
orderRouter.put('/:id/cancel',authenticate,authorize('customer'),cancelOrder)

















export default orderRouter