import Joi from 'joi'


export const objectIdSchema = Joi.object({
    id: Joi.string().length(24).hex().required()
        .messages({
            'string.length': 'ID must be 24 characters',
            'string.hex': 'ID must be a valid MongoDB ObjectId',
            'any.required': 'ID is required'
        })
})