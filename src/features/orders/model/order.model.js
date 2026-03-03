import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    }
});
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    image: {
        type: String
    }
});




const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    item: {
        type: [orderItemSchema],
        required: true
    },
    shippingAddres: {
        type: addressSchema,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['paypal', 'credit', 'simulated', 'visa'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'fialed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: {
        type: String,
        required: true

    },
    notes: {
        type: String,


    },


}, { timestamps: true })