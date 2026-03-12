import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',    // ← spec requires this
    port: 587,                  // ← spec requires this
    secure: false,              // 587 uses STARTTLS, not SSL
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_APP_PASSWORD
    }
})

// shared template wrapper
const emailTemplate = (content) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #4F46E5;">
            <h1 style="color: #4F46E5; margin: 0;">🛍️ MyShop</h1>
        </div>
        <div style="padding: 30px 0;">
            ${content}
        </div>
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>© 2025 MyShop. All rights reserved.</p>
        </div>
    </div>
`

export const sendVerificationEmail = async (user, token) => {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Verify your email ✅",
        html: emailTemplate(`
            <h2 style="color: #333;">Hello ${user.name} 👋</h2>
            <p style="color: #555;">Thank you for registering! Please verify your account:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Verify Email
                </a>
            </div>
            <p style="color: #999; font-size: 13px;">This link expires in 24 hours.</p>
        `)
    })
}

export const sendResetPasswordEmail = async (user, token) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Reset Your Password 🔐",
        html: emailTemplate(`
            <h2 style="color: #333;">Hello ${user.name}</h2>
            <p style="color: #555;">Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #EF4444; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Reset Password
                </a>
            </div>
            <p style="color: #999; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        `)
    })
}

export const send2FAEmail = async (user, code) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Your 2FA Code 🔑",
        html: emailTemplate(`
            <h2 style="color: #333;">Hello ${user.name}</h2>
            <p style="color: #555;">Your admin verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #4F46E5; 
                             letter-spacing: 8px; padding: 15px 30px; 
                             background: #F3F4F6; border-radius: 8px;">
                    ${code}
                </span>
            </div>
            <p style="color: #999; font-size: 13px;">This code expires in 10 minutes.</p>
        `)
    })
}
