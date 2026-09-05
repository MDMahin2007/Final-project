import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import { getMe, loginUser } from './controllers/authController.js'
import { protect } from './middleware/authMiddleware.js'
import clearanceRoutes from './routes/clearanceRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import { ensureUploadDirectories, uploadsDirectory } from './middleware/uploadMiddleware.js'

dotenv.config()
const app = express()

app.use(express.json())
app.use('/uploads', express.static(uploadsDirectory))

const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'https://smartcumpas2.netlify.app',
]
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

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'ClearPath API is healthy' })
})

app.use('/api/auth', authRoutes)
app.post('/api/login', loginUser)
app.get('/api/auth/status', protect, getMe)
app.use('/api/clearance', clearanceRoutes)

app.use(notFound)
app.use(errorHandler)

export default app

const PORT = process.env.PORT || 5000

const startServer = async () => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be configured with at least 32 characters')
    }

    await connectDB()
    await ensureUploadDirectories()
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

if (!process.env.VERCEL) {
    startServer().catch((error) => {
        console.error('Server startup failed:', error.message)
        process.exit(1)
    })
}
