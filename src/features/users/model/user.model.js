import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: true })

const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },

    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationToken: {
        type: String,
        default: null
    },

    verificationTokenExpiry: {
        type: Date,
        default: null
    },

    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordExpiry: {
        type: Date,
        default: null
    },

    twoFactorCode: {
        type: String,
        default: null
    },

    twoFactorExpiry: {
        type: Date,
        default: null
    },

    addresses: {
        type: [addressSchema],
        default: []
    },

    cart: {
        type: [cartItemSchema],
        default: []
    }

}, { timestamps: true })


// 🔐 Pre-save middleware להצפנת סיסמה
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return

    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
})


// 🔐 השוואת סיסמה
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

 export default mongoose.model('User', userSchema)