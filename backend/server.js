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
app.use(cors())

connectDB()

app.get('/', (req, res) => {
    res.json({ success: true, message: 'ClearPath API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/clearance', clearanceRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
