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

export const sendOrderConfirmationEmail = async (user, order) => {
    const itemsList = order.items.map(item =>
        `<li>${item.name} x${item.quantity} — ₪${item.price * item.quantity}</li>`
    ).join('')

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Order Confirmation #${order._id}`,
        html: `
            <h2>Thank you ${user.name}!</h2>
            <p>Your order has been received.</p>
            <ul>${itemsList}</ul>
            <p><strong>Total: ₪${order.totalPrice}</strong></p>
            <p>Shipping to: ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
        `
    })
}

export const sendOrderStatusUpdateEmail = async (user, order) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Order Update #${order._id}`,
        html: `
            <h2>Hello ${user.name}</h2>
            <p>Your order status has been updated to: 
               <strong>${order.orderStatus}</strong>
            </p>
        `
    })
}