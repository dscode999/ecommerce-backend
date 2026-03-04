import express from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import { addAddress, changePassword, deleteAddress, deleteUser, getAllUsers, getProfile, updateAddress, updateProfile, updateUserRole } from '../controller/user.controller.js'
const userRoute = express.Router()
//=====User-PART
userRoute.get('/profile', authenticate, authorize('customer'), getProfile)
userRoute.put('/profile', authenticate, authorize('customer'), updateProfile)
userRoute.put('/change-password', authenticate, authorize('customer'), changePassword)
userRoute.post('/addresses', authenticate, authorize('customer'), addAddress)
userRoute.put('/addresses/:addrId', authenticate, authorize('customer',), updateAddress)
userRoute.delete('/addresses/:addrId', authenticate, authorize('customer'), deleteAddress)
//====Admin-PART
userRoute.get('/', authenticate, authorize('admin'), getAllUsers)
userRoute.put('/:id/role', authenticate, authorize('admin'), updateUserRole)
userRoute.delete('/:id', authenticate, authorize('admin'), deleteUser)



export default userRoute