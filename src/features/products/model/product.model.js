import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   // 🔥 Reference to User model
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        trim: true
    }

}, { timestamps: true })
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['clothing', 'electronics', 'food','computers']
    },
    images: {// מערך נתיבי תמונות למוצרים 
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sold: {
        type: Number,
        default: 0

    },
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        type: [ratingSchema],
        default: []
    },
    averageRating: {
        type: Number,
        max: 5,
        default: 0
    },


}, { timestamps: true })


export default mongoose.model('Product', productSchema)