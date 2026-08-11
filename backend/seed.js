import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import connectDB from './config/db.js'
import User from './models/User.js'
import Clearance from './models/Clearance.js'

dotenv.config()

const shouldReset = process.argv.includes('--reset')

const seedData = async () => {
    try {
        await connectDB()

        if (shouldReset) {
            await Clearance.deleteMany({})
            await User.deleteMany({})
            console.log('Existing demo data removed.')
        }

        const existingAdmin = await User.findOne({ email: 'admin@clearpath.edu' })
        if (!existingAdmin) {
            const adminPassword = await bcrypt.hash('Admin123!', 10)
            await User.create({
                name: 'Demo Admin',
                studentId: '',
                department: 'Administration',
                email: 'admin@clearpath.edu',
                password: adminPassword,
                role: 'admin',
            })
            console.log('Demo admin account created: admin@clearpath.edu / Admin123!')
        } else {
            console.log('Demo admin account already exists.')
        }

        const demoUsers = [
            {
                name: 'Mahin Uddin',
                studentId: '221-15-001',
                department: 'CSE',
                email: 'mahin@clearpath.edu',
                password: 'Student123!',
                role: 'student',
            },
            {
                name: 'Rafia Khan',
                studentId: '221-15-002',
                department: 'EEE',
                email: 'rafia@clearpath.edu',
                password: 'Student123!',
                role: 'student',
            },
            {
                name: 'Omar Faruk',
                studentId: '221-15-003',
                department: 'BBA',
                email: 'omar@clearpath.edu',
                password: 'Student123!',
                role: 'student',
            },
        ]

        for (const userData of demoUsers) {
            const existingUser = await User.findOne({ email: userData.email })
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(userData.password, 10)
                await User.create({
                    ...userData,
                    password: hashedPassword,
                })
            }
        }

        const createdStudents = await User.find({ role: 'student' }).lean()

        const clearanceRequests = [
            {
                requestId: 'CLR-2026-001',
                studentName: createdStudents[0]?.name || 'Mahin Uddin',
                studentId: createdStudents[0]?.studentId || '221-15-001',
                department: createdStudents[0]?.department || 'CSE',
                semester: '8th',
                phone: '01700000001',
                reason: 'Course Completion',
                status: 'Pending',
                remarks: '',
                createdBy: createdStudents[0]?._id,
            },
            {
                requestId: 'CLR-2026-002',
                studentName: createdStudents[1]?.name || 'Rafia Khan',
                studentId: createdStudents[1]?.studentId || '221-15-002',
                department: createdStudents[1]?.department || 'EEE',
                semester: '6th',
                phone: '01700000002',
                reason: 'Internship',
                status: 'Approved',
                remarks: 'All requirements are cleared.',
                createdBy: createdStudents[1]?._id,
            },
            {
                requestId: 'CLR-2026-003',
                studentName: createdStudents[2]?.name || 'Omar Faruk',
                studentId: createdStudents[2]?.studentId || '221-15-003',
                department: createdStudents[2]?.department || 'BBA',
                semester: '4th',
                phone: '01700000003',
                reason: 'Library Clearance',
                status: 'Rejected',
                remarks: 'Library dues not cleared.',
                createdBy: createdStudents[2]?._id,
            },
            {
                requestId: 'CLR-2026-004',
                studentName: createdStudents[0]?.name || 'Mahin Uddin',
                studentId: createdStudents[0]?.studentId || '221-15-001',
                department: createdStudents[0]?.department || 'CSE',
                semester: '8th',
                phone: '01700000001',
                reason: 'Certificate Collection',
                status: 'Pending',
                remarks: '',
                createdBy: createdStudents[0]?._id,
            },
            {
                requestId: 'CLR-2026-005',
                studentName: createdStudents[1]?.name || 'Rafia Khan',
                studentId: createdStudents[1]?.studentId || '221-15-002',
                department: createdStudents[1]?.department || 'EEE',
                semester: '6th',
                phone: '01700000002',
                reason: 'Other',
                status: 'Approved',
                remarks: 'Approved after departmental verification.',
                createdBy: createdStudents[1]?._id,
            },
        ]

        for (const request of clearanceRequests) {
            const existingRequest = await Clearance.findOne({ requestId: request.requestId })
            if (!existingRequest) {
                await Clearance.create(request)
            }
        }

        console.log('Seed data completed successfully.')
        console.log('Demo admin: admin@clearpath.edu / Admin123!')
        console.log('Demo students: mahin@clearpath.edu, rafia@clearpath.edu, omar@clearpath.edu / Student123!')
    } catch (error) {
        console.error('Seed failed:', error.message)
        process.exit(1)
    }
}

seedData().then(() => process.exit(0))
