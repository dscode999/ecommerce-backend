import dotenv from 'dotenv'
dotenv.config()

const clients = JSON.parse(process.env.CORS_CLIENTS || '[]')



export const corsOptions = {
    origin: function (origin, callback) {
        // allow Postman / mobile (no origin)
        if (!origin) return callback(null, true)

        const client = clients.find(c => c.origin === origin)

        if (client) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: function (req, callback) {
        const client = clients.find(c => c.origin === req.headers.origin)
        callback(null, client?.methods || ['GET'])
    },
    allowedHeaders: function (req, callback) {
        const client = clients.find(c => c.origin === req.headers.origin)
        callback(null, client?.allowedHeaders || ['Content-Type'])
    },
    credentials: true,
    maxAge: 86400
}