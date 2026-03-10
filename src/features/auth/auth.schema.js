import Joi from 'joi'
export const registerSchema = Joi.object({
    name: Joi
        .string()
        .min(2)
        .max(50)
        .trim()
        .required(),
    email: Joi
        .string()
        .email({ tlds: false })
        .lowercase()
        .required(),
    password: Joi
        .string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
        .required()


})
export const loginSchema = Joi.object({
    email: Joi
        .string()
        .email({ tlds: false })
        .lowercase()
        .required(),
    password: Joi
        .string()
        .required()


})
export const forgotPasswordSchema = Joi.object({
    email: Joi
        .string()
        .email({ tlds: false })
        .lowercase()
        .required(),

})
export const resetPasswordSchema = Joi.object({
    password: Joi
        .string()
        .min(8)
        .max(128)
        .required()
})

export const verify2FaSchema = Joi.object({
    email: Joi
        .string()
        .email({ tlds: false })
        .lowercase()
        .required(),
    code: Joi
        .string()
        .length(6)
        .required()


})