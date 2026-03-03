import User from '../../users/model/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { sendVerificationEmail, sendResetPasswordEmail, send2FAEmail } from '../auth.service.js'

dotenv.config()

// ================= REGISTER =================
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                status: 409,
                message: "Email already exists",
                data: null
            })
        }

        const hashed = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashed,
            isVerified: false
        })

        // יצירת טוקן אימות
        const emailToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        )

        user.verificationToken = emailToken
        user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000
        await user.save()

        sendVerificationEmail(user, emailToken)


        return res.status(201).json({
            status: 201,
            message: "Register successful. Please verify your email.",
            data: emailToken
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

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
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

        user.isVerified = true
        await user.save()

        res.status(200).json({
            status: 200,
            message: "Email verified successfully",
            data: null
        })

    } catch (error) {
        res.status(400).json({
            status: 400,
            message: "Invalid or expired token",
            data: null
        })
    }
}

// ================= LOGIN =================
export const login = async (req, res) => {
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

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "Invalid credentials",
                data: null
            })
        }

        if (!user.isVerified) {
            return res.status(403).json({
                status: 403,
                message: "Please verify your email first",
                data: null
            })
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
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

        if (!user) {
            return res.status(200).json({
                status: 200,
                message: "If this email exists, a reset link has been sent",
                data: null
            })
        }

        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000

        await user.save()

        await sendResetPasswordEmail(user, resetToken)

        res.status(200).json({
            status: 200,
            message: "Reset email sent",
            data: resetToken
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

        const hashed = await bcrypt.hash(password, 12)

        user.password = hashed
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
// ================= ADMIN LOGIN =================

export const logInForAdmin = async (req, res) => {
    try {

        const { email, password } = req.body
        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "user not found",
                data: null


            })
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                status: 403,
                message: "Admins only",
                data: null
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

            ;

        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "invalid password",
                data: null


            })
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        user.twoFactorCode = code
        user.twoFactorExpiry = Date.now() + 10 * 60 * 1000 // 10 דקות
        await user.save()
        await send2FAEmail(user, code)
        res.status(200).json({
            status: 200,
            message: "2FA code sent to your email",
            data: null
        })
    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: 500,
            message: "2FA verification failed",
            data: null
        })


    }


}

// ================= VERIFY2FA =================

export const verify2FA = async (req, res) => {
    try {
        const { email, code } = req.body

        if (!email || !code) {
            return res.status(400).json({
                status: 400,
                message: "Email and code are required",
                data: null
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

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

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        user.twoFactorCode = undefined
        user.twoFactorExpiry = undefined
        await user.save()

        res.status(200).json({
            status: 200,
            message: "Admin login successful",
            data: {
                token
            }
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

//GETME
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)

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