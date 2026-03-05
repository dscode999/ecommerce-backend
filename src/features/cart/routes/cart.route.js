import express from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import { addToCart, clearCart, deleteItemFromCart, getCart, syncCart, updateCartItemQuantity } from '../controllers/cart.controller.js'



const cartRoute=express.Router()

cartRoute.get('/',authenticate,authorize('customer'),getCart)
cartRoute.post('/',authenticate,authorize('customer'),addToCart)
cartRoute.put('/:productId',authenticate,authorize('customer'),updateCartItemQuantity)
cartRoute.delete('/:productId',authenticate,authorize('customer'),deleteItemFromCart)
cartRoute.delete('/',authenticate,authorize('customer'),clearCart)
cartRoute.post('/sync',authenticate,authorize('customer'),syncCart)





export default cartRoute