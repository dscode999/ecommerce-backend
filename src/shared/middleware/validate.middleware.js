// ✅ UPDATED — validates req.body OR req.params
export const validate = (schema, target = 'body') => {    // 1. add target parameter
    return (req, res, next) => {
        const { error, value } = schema.validate(req[target], {  // 2. use req[target]
            abortEarly: false,
            stripUnknown: true
        })

        if (error) {
            const errors = error.details.map(e => ({
                field: e.path[0],
                message: e.message
            }))
            return res.status(422).json({ status: 422, message: "Validation failed", errors })
        }

        req[target] = value    // 3. update req.body OR req.params
        next()
    }
}