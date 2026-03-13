import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import hpp from 'hpp'
import { connectDB } from './config/db.js'
import { corsOptions } from './config/cors.js'
import { errorHandler } from './shared/middleware/error.handler.js'
import { apiLimiter, authLimiter } from './shared/middleware/rateLimiter.js' // ← add authLimiter
import authRout from './features/auth/routes/auth.route.js'
import productRouter from './features/products/routes/product.route.js'
import orderRouter from './features/orders/routes/order.route.js'
import userRoute from './features/users/routes/user.route.js'
import cartRoute from './features/cart/routes/cart.route.js'

const app = express()
const port = process.env.PORT || 3010

// ===== Security Middleware =====
app.use(helmet())                        // security headers
app.use(cors(corsOptions))               // CORS
app.use(hpp())                           // HTTP Parameter Pollution

// ===== General Middleware =====
app.use(express.json())
app.use(morgan('dev'))                   // request logging
app.use('/api', apiLimiter)             // rate limiting on all API routes

// ===== Routes =====
app.use("/api/v1/auth",authLimiter,authRout)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/users", userRoute)
app.use("/api/v1/cart", cartRoute)

// ===== Fallback =====
app.use("/", (req, res) => {
    res.status(404).send("404 Not Found")
})

// ===== Global Error Handler =====
app.use(errorHandler)

await connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`)
        })
    })
    .catch((err) => {
        console.error("Database connection failed:", err)
    })