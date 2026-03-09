export const validate = (schema) => {        // 1
    return (req, res, next) => {             // 2
        const { error, value } = schema.validate(req.body, {  // 3
            abortEarly: false,
            stripUnknown: true
        })

        if (error) {                         // 4
            const errors = error.details.map(e => ({
                field: e.path[0],
                message: e.message
            }))
            return res.status(422).json({ status: 422, message: "Validation failed", errors })
        }

        req.body = value                     // 5
        next()                               // 6
    }
}