import cloudinary from '../../config/cloudinary.js'

export const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) return next()

        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'products' },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result.secure_url)
                    }
                )
                stream.end(file.buffer)
            })
        })

        req.imageUrls = await Promise.all(uploadPromises)
        next()

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Image upload failed',
            data: null
        })
    }
}

export const deleteFromCloudinary = async (imageUrl) => {
    try {
        const parts = imageUrl.split('/')
        const filename = parts[parts.length - 1].split('.')[0]
        const publicId = `products/${filename}`

        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error)
    }
}