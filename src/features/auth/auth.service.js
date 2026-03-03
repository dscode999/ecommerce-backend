import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_APP_PASSWORD
    }
})

// ================= VERIFY EMAIL =================
export const sendVerificationEmail = async (user, token) => {
    const verificationLink = `http://localhost:3010/api/v1/auth/verify-email/${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Verify your email",
        html: `
            <h2>Hello ${user.name}</h2>
            <p>Please verify your account:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>This link expires in 24 hours.</p>
        `
    })
}

// ================= RESET PASSWORD =================
export const sendResetPasswordEmail = async (user, token) => {
    const resetLink = `http://localhost:3010/api/v1/auth/reset-password/${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Reset Your Password",
        html: `
            <h2>Hello ${user.name}</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>This link expires in 1 hour.</p>
        `
    })
}

// ================= 2FA EMAIL =================
export const send2FAEmail = async (user, code) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Your 2FA Code",
        html: `
            <h2>Hello ${user.name}</h2>
            <p>Your 2FA verification code is:</p>
            <h1 style="color: blue;">${code}</h1>
            <p>This code expires in 10 minutes.</p>
        `
    })
}