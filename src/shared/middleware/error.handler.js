// ================= GLOBAL ERROR HANDLER =================
// חייב להיות עם 4 פרמטרים כדי ש-Express יזהה אותו כ-error handler
export const errorHandler = (err, req, res, next) => {

    console.error(err)

    // Mongoose ValidationError → 400
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({
            status: 400,
            message: "Validation error",
            data: errors
        })
    }

    // Mongoose CastError (ObjectId לא תקין) → 404
    if (err.name === 'CastError') {
        return res.status(404).json({
            status: 404,
            message: "Resource not found",
            data: null
        })
    }

    // Duplicate Key (אימייל כפול וכד') → 409
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(409).json({
            status: 409,
            message: `${field} already exists`,
            data: null
        })
    }

    // JWT שגיאות
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 401,
            message: "Invalid token",
            data: null
        })
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 401,
            message: "Token expired",
            data: null
        })
    }

    // שגיאה כללית
    const statusCode = err.statusCode || err.status || 500

    // ב-development מחזיר stack trace, ב-production הודעה גנרית
    const message = process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error'

    res.status(statusCode).json({
        status: statusCode,
        message,
        data: process.env.NODE_ENV === 'development' ? err.stack : null
    })
}