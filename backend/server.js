import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import clearanceRoutes from './routes/clearanceRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

dotenv.config()
const app = express()

app.use(express.json())

const allowedOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
    .filter(Boolean)
    .flatMap((value) => value.split(',').map((origin) => origin.trim()))
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        const error = new Error('CORS origin not allowed')
        error.status = 403
        return callback(error)
    },
}))

app.get('/', (req, res) => {
    res.json({ success: true, message: 'ClearPath API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/clearance', clearanceRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const startServer = async () => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be configured with at least 32 characters')
    }

    await connectDB()
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

startServer().catch((error) => {
    console.error('Server startup failed:', error.message)
    process.exit(1)
})
