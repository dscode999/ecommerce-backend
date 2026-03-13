import User from '../../users/model/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { sendVerificationEmail, sendResetPasswordEmail, send2FAEmail } from '../auth.service.js'

dotenv.config()

// ================= REGISTER =================
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // check if email already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                status: 409,
                message: "Email already exists",
                data: null
            })
        }

        // create user — password is hashed automatically via pre-save hook
        const user = await User.create({
            name,
            email,
            password,
            isVerified: false
        })

        // ✅ crypto.randomBytes instead of jwt.sign
        const emailToken = crypto.randomBytes(32).toString('hex')

        user.verificationToken = emailToken
        user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        await user.save()

        // send verification email with the token
        sendVerificationEmail(user, emailToken)

        return res.status(201).json({
            status: 201,
            message: "Register successful. Please verify your email.",
            data: null
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Register failed",
            data: null
        })
    }
}

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params

        // ✅ find user by token in DB + check expiry (no jwt.verify needed)
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({
                status: 400,
                message: "Invalid or expired token",
                data: null
            })
        }

        if (user.isVerified) {
            return res.status(400).json({
                status: 400,
                message: "Email already verified",
                data: null
            })
        }

        // ✅ clear token from DB — one time use only!
        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiry = undefined
        await user.save()

        res.status(200).json({
            status: 200,
            message: "Email verified successfully",
            data: null
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server error",
            data: null
        })
    }
}

// ================= LOGIN =================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // explicitly select password field (select: false in model)
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Invalid credentials",
                data: null
            })
        }

        // compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "Invalid credentials",
                data: null
            })
        }

        // check if account is verified
        if (!user.isVerified) {
            return res.status(403).json({
                status: 403,
                message: "Please verify your email first",
                data: null
            })
        }

        // generate JWT with userId and role — 7 day expiry
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn:process.env.JWT_EXPIRE }
        )

        res.status(200).json({
            status: 200,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Login failed",
            data: null
        })
    }
}

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })

        // always return 200 — never reveal if email exists or not (security)
        if (!user) {
            return res.status(200).json({
                status: 200,
                message: "If this email exists, a reset link has been sent",
                data: null
            })
        }

        // ✅ crypto.randomBytes for reset token
        const resetToken = crypto.randomBytes(32).toString('hex')

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000 // 1 hour
        await user.save()

        await sendResetPasswordEmail(user, resetToken)

        res.status(200).json({
            status: 200,
            message: "Reset email sent",
            data: null
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Failed to process request",
            data: null
        })
    }
}

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body

        // find user by token + check expiry
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({
                status: 400,
                message: "Invalid or expired token",
                data: null
            })
        }

        // update password — pre-save hook will hash it automatically
        user.password = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpiry = undefined
        await user.save()

        res.status(200).json({
            status: 200,
            message: "Password reset successfully",
            data: null
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Reset password failed",
            data: null
        })
    }
}

// ================= ADMIN LOGIN (Step 1) =================
export const logInForAdmin = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Invalid credentials",
                data: null
            })
        }

        // check role before password — fail fast
        if (user.role !== 'admin') {
            return res.status(403).json({
                status: 403,
                message: "Admins only",
                data: null
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "Invalid credentials",
                data: null
            })
        }

        // generate 6-digit 2FA code
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        user.twoFactorCode = code
        user.twoFactorExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
        await user.save()

        await send2FAEmail(user, code)

        res.status(200).json({
            status: 200,
            message: "2FA code sent to your email",
            data: null
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Login failed",
            data: null
        })
    }
}

// ================= VERIFY 2FA (Step 2) =================
export const verify2FA = async (req, res) => {
    try {
        const { email, code } = req.body
        // ✅ removed manual check — Joi handles it now

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        // check code + expiry
        if (
            user.twoFactorCode !== code ||
            !user.twoFactorExpiry ||
            user.twoFactorExpiry < Date.now()
        ) {
            return res.status(400).json({
                status: 400,
                message: "Invalid or expired 2FA code",
                data: null
            })
        }

        // generate full admin JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        // ✅ clear 2FA code from DB — one time use only!
        user.twoFactorCode = undefined
        user.twoFactorExpiry = undefined
        await user.save()

        res.status(200).json({
            status: 200,
            message: "Admin login successful",
            data: { token }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "2FA verification failed",
            data: null
        })
    }
}

// ================= LOGOUT =================
export const logout = (req, res) => {
    res.status(200).json({
        status: 200,
        message: "Logout successfully",
        data: null
    })
}

// ================= GET ME =================
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        res.status(200).json({
            status: 200,
            message: "User fetched successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to fetch user",
            data: null
        })
    }
}