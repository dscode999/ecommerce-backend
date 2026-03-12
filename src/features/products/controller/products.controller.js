import {
    createProductService,
    findProductById,
    findProducts,
    findProductsByCategory,
    softDeleteProductService,
    updateProductService
} from '../products.service.js'
import { deleteFromCloudinary } from '../../../shared/middleware/uploadToCloudinary.middleware.js'


export const getAllProducts = async (req, res) => {
    try {
        // ===== 1️⃣ Filtering =====
        const { category, minPrice, maxPrice } = req.query

        let filter = { isActive: true }

        if (category) {
            filter.category = category
        }

        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = Number(minPrice)
            if (maxPrice) filter.price.$lte = Number(maxPrice)
        }

        // ===== 2️⃣ Sorting =====
        let sortOption = {}

        if (req.query.sort) {
            const sortField = req.query.sort
            if (sortField.startsWith('-')) {
                sortOption[sortField.substring(1)] = -1
            } else {
                sortOption[sortField] = 1
            }
        }

        // ===== 3️⃣ Pagination =====
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10

        // ===== Query Execution via Service =====
        const { products } = await findProducts(filter, sortOption, page, limit)

        res.status(200).json({
            status: 200,
            message: 'Fetch all products',
            page,
            limit,
            data: products
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to fetch products',
            data: null
        })
    }
}


export const getProductById = async (req, res) => {
    const { id } = req.params

    try {
        const product = await findProductById(id)
        if (!product || !product.isActive) {
            return res.status(404).json({
                status: 404,
                message: 'product not found',
                data: null
            })
        }

        res.status(200).json({
            status: 200,
            message: 'found product',
            data: product

        })


    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: 500,
            message: 'product not found',
            data: null
        })

    }

}

export const createProduct = async (req, res) => {
    try {

        const { name, description, price, stock, category } = req.body

        const product = await createProductService({
            name,
            description,
            price,
            stock,
            category,
            images: req.imageUrls || []
        })

        res.status(201).json({
            status: 201,
            message: "Product created successfully",
            data: product
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Server error",
            data: null
        })
    }
}

export const getProductsByCatgory = async (req, res) => {
    try {

        const { cat } = req.params

        const products = await findProductsByCategory(cat)


        if (!products) {
            return res.status(404).json({
                status: 404,
                message: "No products found in this category",
                data: []
            })
        }


        res.status(200).json({
            status: 200,
            message: "Products fetched successfully",
            data: products
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to fetch products",
            data: null
        })
    }
}


export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, price, stock, category } = req.body

        const updateData = { name, description, price, stock, category }

        // if new images uploaded — delete old ones first
        if (req.imageUrls && req.imageUrls.length > 0) {
            const existingProduct = await findProductById(id)
            if (existingProduct.images.length > 0) {
                await Promise.all(existingProduct.images.map(url => deleteFromCloudinary(url)))
            }
            updateData.images = req.imageUrls
        }

        const updatedProduct = await updateProductService(id, updateData)

        if (!updatedProduct) {
            return res.status(404).json({
                status: 404,
                message: "Product not found",
                data: null
            })
        }

        res.status(200).json({
            status: 200,
            message: "Product updated successfully",
            data: updatedProduct
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to update product",
            data: null
        })
    }
}
export const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params

        const deletedProduct = await softDeleteProductService(id)
        // delete images from Cloudinary when product is soft deleted
        if (deletedProduct.images.length > 0) {
            await Promise.all(deletedProduct.images.map(url => deleteFromCloudinary(url)))
        }

        if (!deletedProduct) {
            return res.status(404).json({
                status: 404,
                message: "Product not found",
                data: null
            })
        }

        res.status(200).json({
            status: 200,
            message: "Product soft deleted successfully",
            data: deletedProduct
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Failed to delete product",
            data: null
        })
    }
}

export const addProductReview = async (req, res) => {
    try {
        const { id } = req.params
        const { rating, comment } = req.body
        const userId = req.user.userId

        // ✅ בדיקת תקינות
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 400,
                message: "Rating must be between 1 and 5",
                data: null
            })
        }

        const product = await findProductById(id)

        if (!product || !product.isActive) {
            return res.status(404).json({
                status: 404,
                message: "Product not found",
                data: null
            })
        }

        // ✅ לוודא שמערך rating קיים
        if (!product.rating) {
            product.rating = []
        }

        // ❌ בדיקה אם כבר דירג
        const alreadyReviewed = product.rating.find(
            review => review.user.toString() === userId
        )

        if (alreadyReviewed) {
            return res.status(400).json({
                status: 400,
                message: "You already reviewed this product",
                data: null
            })
        }

        // ➕ הוספת ביקורת
        product.rating.push({
            user: userId,
            rating: Number(rating),
            comment
        })

        // 🧮 חישוב ממוצע מחדש
        const total = product.rating.reduce(
            (sum, item) => sum + item.rating,
            0
        )

        product.averageRating = Number(
            (total / product.rating.length).toFixed(1)
        )

        await product.save()

        res.status(201).json({
            status: 201,
            message: "Review added successfully",
            data: {
                averageRating: product.averageRating,
                totalReviews: product.rating.length
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Failed to add review",
            data: null
        })
    }
}