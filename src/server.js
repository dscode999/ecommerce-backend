import express from 'express'
import { connectDB } from './config/db.js';

import authRout from './features/auth/routes/auth.route.js';
import productRouter from './features/products/routes/product.route.js';
import orderRouter from './features/orders/routes/order.route.js';
import userRoute from './features/users/routes/user.route.js';
import cartRoute from './features/cart/routes/cart.route.js';

const app = express();
const port = 3010;

app.use(express.json());

app.use("/api/v1/auth", authRout);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/cart",cartRoute)

app.use("/", (req, res) => {
    res.send("fallback-404 Error");
});

await connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });