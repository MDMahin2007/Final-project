import mongoose from 'mongoose'

let connectionPromise

const getMongoUri = () => {
    const configuredUri = process.env.MONGODB_URI?.trim() || process.env.MONGO_URI?.trim()
    if (configuredUri && !configuredUri.startsWith('YOUR_')) {
        return configuredUri
    }

    const username = process.env.MONGO_USER?.trim()
    const password = process.env.MONGO_PASSWORD
    const database = process.env.DB_NAME?.trim() || 'clearpath'
    const host = process.env.MONGO_HOST?.trim() || '127.0.0.1:27017'

    if (!username || !password) {
        throw new Error('MongoDB configuration is missing. Set MONGO_URI (or MONGODB_URI), or set MONGO_USER and MONGO_PASSWORD')
    }

    const authSource = process.env.MONGO_AUTH_SOURCE?.trim()
    const query = authSource ? `?authSource=${encodeURIComponent(authSource)}` : ''
    return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}/${encodeURIComponent(database)}${query}`
}

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection
    }

    if (connectionPromise) {
        return connectionPromise
    }

    try {
        const mongoUri = getMongoUri()

        connectionPromise = mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
        })
        const conn = await connectionPromise
        console.log(`MongoDB connected: ${conn.connection.host}`)
        return conn.connection
    } catch (error) {
        connectionPromise = undefined
        if (error?.codeName === 'AuthenticationFailed' || error?.message?.includes('bad auth')) {
            throw new Error('MongoDB authentication failed. Check the database username, password, authSource, and URL-encoding of special password characters.')
        }
        throw new Error(`MongoDB connection failed: ${error.message}`)
    }
}

export default connectDB