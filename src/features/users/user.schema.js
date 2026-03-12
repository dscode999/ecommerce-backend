import Joi from 'joi'

export const updateProfileSchema=Joi.object({
    name:Joi.string().min(2).max(50).trim(),
    email:Joi.string().email({ tlds: false }).lowercase()
})
export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        })
})

export const addAddressSchema = Joi.object({
    street: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    zipCode: Joi.string().min(2).required(),
    country: Joi.string().min(2).required()
})