import Joi from 'joi'

export const createOrderSchema = Joi.object({
    items: Joi.array().items(Joi.object({
        productId: Joi.string().length(24).hex().required(),
        quantity: Joi.number().integer().min(1).required()
    })).min(1).required(),
    shippingAddress: Joi.object({
        street: Joi.string().min(2).required(),
        city: Joi.string().min(2).required(),
        zipCode: Joi.string().min(2).required(),
        country: Joi.string().min(2).required()
    }),
    paymentMethod:
        Joi
            .string()
            .valid('paypal', 'credit', 'simulated', 'visa')
            .required()

    ,
    notes: Joi.string().max(500).optional()

})
export const updateOrderStatusSchema = Joi.object({
    orderStatus:
        Joi
            .string()
            .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
            .required()

})
