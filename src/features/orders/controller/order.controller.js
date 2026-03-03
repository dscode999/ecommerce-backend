import Order from '../model/order.model.js'
import Product from '../../products/model/product.model.js'

export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, notes } = req.body

        const userId = req.user.userId

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items'
            })
        }

        let totalPrice = 0
        const orderItems = []

        for (const item of items) {
            const product = await Product.findById(item.productId)

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                })
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product.name}`
                })
            }

            totalPrice += product.price * item.quantity

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.images?.[0] || ''
            })

            product.stock -= item.quantity
            product.sold += item.quantity

            await product.save()
        }

        const order = await Order.create({
            user: userId,
            items: orderItems,
            shippingAddress,
            totalPrice,
            paymentMethod,
            notes
        })

        res.status(201).json({
            success: true,
            data: order
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const getAllOrdersToUser = async (req, res) => {
    try {

        const userId = req.user.userId

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 }).populate('items.product', 'name price images')   // מהחדש לישן

        res.status(200).json({
            success: true,
            message: "User orders fetched successfully",
            data: orders
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        })
    }
}
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        const userRole = req.user.role

        const order = await Order.findById(id).populate('items.product', 'name price images')

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        // אם לא אדמין – בדוק שההזמנה שייכת לו
        if (userRole !== 'admin' && order.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this order"
            })
        }

        res.status(200).json({
            success: true,
            message: "Order found successfully",
            data: order
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const getAllOrders = async (req, res) => {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const skip = (page - 1) * limit
  
      const total = await Order.countDocuments()
  
      const orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
  
      res.status(200).json({
        success: true,
        page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        data: orders
      })
  
    } catch (error) {
      console.error(error);
      // חשוב לדיבאג
      res.status(500).json({
        success: false,
        message: "Server error"
      })
    }
  }


export const updateOrderStatus = async (req, res) => {
    try {

        const { id } = req.params
        const { orderStatus } = req.body

        const validStatuses = [
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        ]

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            })
        }

        const order = await Order.findById(id)

        if (!order) {
            return res.status(404).json({
                status: 200,
                success: false,
                message: "Order not found"
            })
        }

        order.orderStatus = orderStatus
        await order.save()

        res.status(200).json({
            status: 200,
            success: true,
            message: "Order status updated successfully",
            data: order
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Server error"
        })
    }
}

export const cancelOrder = async (req, res) => {
    try {

        const { id } = req.params
        const userId = req.user.userId

        const order = await Order.findById(id)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        // בדיקה שההזמנה שייכת ללקוח
        if (order.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this order"
            })
        }

        // ניתן לבטל רק אם Pending
        if (order.orderStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be cancelled"
            })
        }

        // 🔥 החזרת מלאי
        for (const item of order.items) {
            const product = await Product.findById(item.product)

            if (product) {
                product.stock += item.quantity
                product.sold -= item.quantity
                await product.save()
            }
        }

        // שינוי סטטוס
        order.orderStatus = 'cancelled'
        await order.save()

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: order
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}