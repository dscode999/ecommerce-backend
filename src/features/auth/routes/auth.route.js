import express from 'express'
import { forgotPassword, login, register, verifyEmail ,resetPassword,logInForAdmin, verify2FA,logout, getMe} from '../controller/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const authRout = express.Router()

authRout.post('/register',register)
authRout.post('/login',login)
authRout.get('/verify-email/:token', verifyEmail)
authRout.post('/forgot-passowrd',forgotPassword)
authRout.post('/reset-password/:token', resetPassword)
authRout.post('/login/admin',logInForAdmin)
authRout.post('/login/verify-2fa',verify2FA)
authRout.post('/logout',authenticate,logout)
authRout.get('/me', authenticate, getMe)

export default authRout