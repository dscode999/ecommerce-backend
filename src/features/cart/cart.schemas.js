import Joi from 'joi'

export const addToCartSchema = Joi.object({
    productId: Joi.string().length(24).hex().required(),
    quantity: Joi.number().integer().min(1).required()
})


export const syncCartSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            productId: Joi.string().length(24).hex().required(),
            quantity: Joi.number().integer().min(1).required()
        })
    ).min(1).required()
})