import express from 'express'
import { forgotPassword, login, register, verifyEmail ,resetPassword,logInForAdmin, verify2FA,logout, getMe} from '../controller/auth.controller.js'
import { validate } from '../../../shared/middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verify2FaSchema } from '../auth.schema.js'

const authRout = express.Router()

authRout.post('/register',validate(registerSchema),register)
authRout.post('/login',validate(loginSchema),login)
authRout.get('/verify-email/:token',verifyEmail)
authRout.post('/forgot-passowrd',validate(forgotPasswordSchema),forgotPassword)
authRout.post('/reset-password/:token', validate(resetPasswordSchema),resetPassword)
authRout.post('/login/admin',logInForAdmin)
authRout.post('/login/verify-2fa',validate(verify2FaSchema),verify2FA)
authRout.post('/logout',authenticate,logout)
authRout.get('/me', authenticate, getMe)

export default authRout