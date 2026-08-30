import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI?.trim()
        if (!mongoUri || mongoUri === 'YOUR_MONGODB_CONNECTION_STRING') {
            throw new Error('MONGO_URI is not configured')
        }

        const conn = await mongoose.connect(mongoUri)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error('MongoDB connection failed:', error.message)
        throw error
    }
}

export default connectDB
