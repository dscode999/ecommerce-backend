import express from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import { addAddress, changePassword, deleteAddress, deleteUser, getAllUsers, getProfile, updateAddress, updateProfile, updateUserRole } from '../controller/user.controller.js'
import {validate} from '../../../shared/middleware/validate.middleware.js'
import { addAddressSchema, changePasswordSchema, updateProfileSchema } from '../user.schema.js'
import { objectIdSchema } from '../../../shared/schemas/objectId.schema.js'
const userRoute = express.Router()
//=====User-PART
userRoute.get('/profile', authenticate, authorize('customer'), getProfile)
userRoute.put('/profile', authenticate, authorize('customer'),validate(updateProfileSchema) ,updateProfile)
userRoute.put('/change-password', authenticate, authorize('customer'),validate(changePasswordSchema) ,changePassword)
userRoute.post('/addresses', authenticate, authorize('customer'),validate(addAddressSchema) ,addAddress)
userRoute.put('/addresses/:addrId', authenticate, authorize('customer'),validate(addAddressSchema),validate(objectIdSchema, 'params'), updateAddress)
userRoute.delete('/addresses/:addrId', authenticate, authorize('customer'), deleteAddress)
//====Admin-PART
userRoute.get('/', authenticate, authorize('admin'), getAllUsers)
userRoute.put('/:id/role', authenticate, authorize('admin'), validate(objectIdSchema, 'params'), updateUserRole)
userRoute.delete('/:id', authenticate, authorize('admin'), validate(objectIdSchema, 'params'), deleteUser)



export default userRoute