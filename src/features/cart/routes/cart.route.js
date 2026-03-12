import express from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import { addToCart, clearCart, deleteItemFromCart, getCart, syncCart, updateCartItemQuantity } from '../controllers/cart.controller.js'
import {validate}from '../../../shared/middleware/validate.middleware.js'
import { addToCartSchema, syncCartSchema } from '../cart.schemas.js'



const cartRoute=express.Router()

cartRoute.get('/',authenticate,authorize('customer'),getCart)
cartRoute.post('/',authenticate,authorize('customer'),validate(addToCartSchema),addToCart)
cartRoute.put('/:productId',authenticate,authorize('customer'),updateCartItemQuantity)
cartRoute.delete('/:productId',authenticate,authorize('customer'),deleteItemFromCart)
cartRoute.delete('/',authenticate,authorize('customer'),clearCart)
cartRoute.post('/sync',authenticate,authorize('customer'),validate(syncCartSchema),syncCart)





export default cartRoute