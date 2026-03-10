import Joi from 'joi'


export const createProductSchema = Joi.object({
    name: Joi
        .string()
        .min(2)
        .max(200)
        .trim()
        .required()
        .messages({
            'string.min': 'Product name must be at least 2 characters',
            'string.max': 'Product name cannot exceed 200 characters',
            'any.required': 'Product name is required'
        }),

    description: Joi
        .string()
        .min(10)
        .max(2000)
        .required()
        .messages({
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 2000 characters',
            'any.required': 'Description is required'
        }),

    price: Joi
        .number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.positive': 'Price must be a positive number',
            'any.required': 'Price is required'
        }),

    category: Joi
        .string()
        .valid('electronics', 'clothing', 'food', 'books', 'other')
        .required()
        .messages({
            'any.only': 'Category must be one of: electronics, clothing, food, books, other',
            'any.required': 'Category is required'
        }),

    stock: Joi
        .number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.min': 'Stock cannot be negative',
            'any.required': 'Stock is required'
        }),

    images: Joi  // ← Missing field added
        .array()
        .items(Joi.string().uri())
        .default([])
        .messages({
            'string.uri': 'Each image must be a valid URL'
        })
});


export const updateProductSchema = Joi.object({
    name:
        Joi
            .string()
            .min(2)
            .max(200)
            .trim()

    ,
    description:
        Joi
            .string()
            .min(10)
            .max(2000)

    ,
    price:
        Joi
            .number()
            .positive()
            .precision(2)

    ,
    category:
        Joi
            .string()
            .valid('electronics', 'clothing', 'food', 'books', 'other')


    ,
    stock:
        Joi
            .number()
            .integer()
            .min(0)
    ,
    images:
        Joi
            .array()
            .items(Joi.string().uri())
    ,
    isActive:
        Joi
            .boolean()


})

export const ratingSchema = Joi.object({
    rating: Joi
        .number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.min': 'Rating must be between 1 and 5',
            'number.max': 'Rating must be between 1 and 5',
            'any.required': 'Rating is required'
        }),

    comment: Joi
        .string()
        .max(500)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Comment cannot exceed 500 characters'
        })

})
