import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import { getMe } from './controllers/authController.js'
import { protect } from './middleware/authMiddleware.js'
import requestRoutes from './routes/requestRoutes.js'
import staffRoutes from './routes/staffRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    dotenv.config()
}
const app = express()

app.set('trust proxy', true) // Trust the first proxy in front of the server (e.g., Vercel, Netlify, or AWS Lambda)

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'https://smart-campus-clearance.vercel.app',
]
    .filter(Boolean)
    .flatMap((value) => value.split(',').map((origin) => origin.trim()))
    .filter(Boolean)

app.use(cors({
    optionsSuccessStatus: 204,
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        const error = new Error('CORS origin not allowed')
        error.status = 403
        return callback(error)
    },
}))

app.use(express.json({ limit: '1mb' }))
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
}))

app.get('/', (req, res) => {
    res.json({ success: true, message: 'ClearPath API is running' })
})

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'ClearPath API is healthy' })
})

app.get('/api', (req, res) => {
    res.json({ success: true, message: 'ClearPath API is running' })
})

// Reuse the cached Mongoose connection across warm serverless function invocations.
app.use('/api', async (_req, _res, next) => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        return _res.status(503).json({ success: false, message: 'Authentication is not configured on this server' })
    }
    try {
        await connectDB()
        next()
    } catch (error) {
        next(error)
    }
})

app.use('/api/auth', authRoutes)
app.get('/api/auth/status', protect, getMe)
app.use('/api/requests', requestRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/reports', reportRoutes)

app.use(notFound)
app.use(errorHandler)

export default app

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

if (!process.env.VERCEL && !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    startServer().catch((error) => {
        console.error('Server startup failed:', error.message)
        process.exit(1)
    })
}
