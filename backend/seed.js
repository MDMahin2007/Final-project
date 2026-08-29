import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import connectDB from './config/db.js'
import User from './models/User.js'
import ClearanceRequest from './models/ClearanceRequest.js'

dotenv.config()

// Creates only the initial administrator. Set ADMIN_EMAIL and ADMIN_PASSWORD
// in .env before using this outside local development.
const seedAdmin = async () => {
    try {
        await connectDB()

        if (process.argv.includes('--reset')) {
            await ClearanceRequest.deleteMany({})
            await User.deleteMany({})
            console.log('ClearPath users and clearance requests removed.')
        }

        const email = process.env.ADMIN_EMAIL || 'admin@clearpath.edu'
        const password = process.env.ADMIN_PASSWORD || 'Admin123!'
        const existingAdmin = await User.findOne({ email })

        if (!existingAdmin) {
            await User.create({
                name: 'ClearPath Administrator',
                email,
                password: await bcrypt.hash(password, 10),
                role: 'admin',
            })
            console.log(`Admin account created: ${email}`)
        } else {
            console.log('Admin account already exists.')
        }
    } catch (error) {
        console.error('Seed failed:', error.message)
        process.exitCode = 1
    } finally {
        await User.db.close()
    }
}

seedAdmin()
