import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const rawUri = process.env.MONGO_URI?.trim()
        const mongoUri = rawUri && !['YOUR_MONGODB_CONNECTION_STRING', ''].includes(rawUri)
            ? rawUri
            : 'mongodb://127.0.0.1:27017/clearpath'

        const conn = await mongoose.connect(mongoUri)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error('MongoDB connection failed:', error.message)
        process.exit(1)
    }
}

export default connectDB
