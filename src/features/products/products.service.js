import Product from './model/product.model.js'

export const findProducts = async (filter, sortOption, page, limit) => {
  const currentPage = Number(page) || 1
  const pageSize = Number(limit) || 10
  const skip = (currentPage - 1) * pageSize

  const products = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(pageSize)

  return { products, page: currentPage, limit: pageSize }
}

export const findProductById = async (id) => {
  return Product.findById(id)
}

export const findProductsByCategory = async (category) => {
  return Product.find({ category, isActive: true })
}

export const createProductService = async (data) => {
  return Product.create(data)
}

export const updateProductService = async (id, data) => {
  return Product.findByIdAndUpdate(
    { _id: id },
    data,
    { returnDocument: 'after' }
  )
}

export const softDeleteProductService = async (id) => {
  return Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { returnDocument: 'after' }
  )
}
