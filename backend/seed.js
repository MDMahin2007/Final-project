import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import connectDB from './config/db.js'
import Approval from './models/Approval.js'
import AuditLog from './models/AuditLog.js'
import User from './models/User.js'
import ClearanceRequest from './models/ClearanceRequest.js'
import Office from './models/Office.js'
import { calculateRequestStatus } from './utils/statusCalculator.js'

dotenv.config()

const defaultOffices = [
    { name: 'Library', code: 'LIB', workflowOrder: 1 },
    { name: 'Accounts', code: 'ACC', workflowOrder: 2 },
    { name: 'Department', code: 'DEP', workflowOrder: 3 },
]

const seedDemoData = async (offices) => {
    const password = process.env.DEMO_ACCOUNT_PASSWORD
    if (!password || password.length < 12) {
        throw new Error('Set DEMO_ACCOUNT_PASSWORD to at least 12 characters before using seed:demo')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const officeByCode = new Map(offices.map((office) => [office.code, office]))
    if (['LIB', 'ACC', 'DEP'].some((code) => !officeByCode.has(code))) {
        throw new Error('Demo seeding requires active Library, Accounts, and Department offices')
    }
    const demoUsers = [
        { name: 'Demo Student Pending', studentId: 'DEMO-2026-001', department: 'CSE', email: 'demo.pending@clearpath.edu', role: 'student' },
        { name: 'Demo Student In Progress', studentId: 'DEMO-2026-002', department: 'EEE', email: 'demo.progress@clearpath.edu', role: 'student' },
        { name: 'Demo Student Rejected', studentId: 'DEMO-2026-003', department: 'BBA', email: 'demo.rejected@clearpath.edu', role: 'student' },
        ...[
            ['LIB', 'demo.library@clearpath.edu'],
            ['ACC', 'demo.accounts@clearpath.edu'],
            ['DEP', 'demo.department@clearpath.edu'],
        ].map(([code, email]) => ({
            name: `Demo ${officeByCode.get(code)?.name || code} Staff`,
            email,
            role: 'officeStaff',
            officeId: officeByCode.get(code)?._id,
        })),
    ]

    const userByEmail = new Map()
    for (const userData of demoUsers) {
        const existingUser = await User.findOne({ email: userData.email })
        if (existingUser) {
            if (existingUser.role !== userData.role || (userData.officeId && String(existingUser.officeId) !== String(userData.officeId))) {
                throw new Error(`Demo account ${userData.email} already exists with a different role or office`)
            }
            userByEmail.set(userData.email, existingUser)
            continue
        }
        const user = await User.create({ ...userData, password: passwordHash })
        userByEmail.set(userData.email, user)
    }

    const staffByOffice = new Map(demoUsers.filter((user) => user.role === 'officeStaff').map((user) => [String(user.officeId), userByEmail.get(user.email)]))
    const scenarios = [
        { studentEmail: 'demo.pending@clearpath.edu', purpose: 'Demo: Pending review', outcome: 'pending' },
        { studentEmail: 'demo.progress@clearpath.edu', purpose: 'Demo: In progress', outcome: 'progress' },
        { studentEmail: 'demo.rejected@clearpath.edu', purpose: 'Demo: Rejected by Accounts', outcome: 'rejected' },
    ]

    for (const scenario of scenarios) {
        const student = userByEmail.get(scenario.studentEmail)
        const existingRequest = await ClearanceRequest.findOne({ studentUserId: student._id, purpose: scenario.purpose })
        if (existingRequest) continue

        const accountsOrder = offices.findIndex((office) => office.code === 'ACC')
        const requestApprovals = offices.map((office, index) => ({
            officeId: office._id,
            stepOrder: index + 1,
            status: scenario.outcome === 'progress'
                ? (index === 0 ? 'APPROVED' : 'PENDING')
                : scenario.outcome === 'rejected'
                    ? (index < accountsOrder ? 'APPROVED' : index === accountsOrder ? 'REJECTED' : 'PENDING')
                    : 'PENDING',
        }))
        const request = await ClearanceRequest.create({
            studentUserId: student._id,
            purpose: scenario.purpose,
            overallStatus: calculateRequestStatus(requestApprovals),
        })
        const decidedAt = new Date()
        await Approval.insertMany(requestApprovals.map((approval) => ({
            ...approval,
            requestId: request._id,
            staffId: approval.status === 'PENDING' ? null : staffByOffice.get(String(approval.officeId))?._id,
            decidedAt: approval.status === 'PENDING' ? null : decidedAt,
            remarks: approval.status === 'REJECTED' ? 'Demo: outstanding office dues must be resolved.' : '',
        })))
        const auditEvents = [{
            action: 'REQUEST_CREATED',
            actorUserId: student._id,
            requestId: request._id,
            message: `Submitted clearance request: ${scenario.purpose}`,
        }, ...requestApprovals.filter((approval) => approval.status !== 'PENDING').map((approval) => ({
            action: approval.status,
            actorUserId: staffByOffice.get(String(approval.officeId))._id,
            requestId: request._id,
            officeId: approval.officeId,
            message: approval.status === 'REJECTED' ? 'Demo: outstanding office dues must be resolved.' : 'Demo office requirements verified.',
        }))]
        await AuditLog.insertMany(auditEvents)
    }
    console.log('Demo students, office staff, and workflow requests are ready. Use DEMO_ACCOUNT_PASSWORD to sign in.')
}

const seed = async () => {
    try {
        await connectDB()

        if (process.argv.includes('--reset')) {
            await Approval.deleteMany({})
            await AuditLog.deleteMany({})
            await ClearanceRequest.deleteMany({})
            await User.deleteMany({})
            await Office.deleteMany({})
            console.log('ClearPath data removed.')
        }

        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
        const password = process.env.ADMIN_PASSWORD
        if (!email || !password || password.length < 8) {
            throw new Error('ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters are required')
        }
        const existingAdmin = await User.findOne({ email })

        if (!existingAdmin) {
            await User.create({
                name: 'ClearPath Super Admin',
                email,
                password: await bcrypt.hash(password, 10),
                role: 'superAdmin',
            })
            console.log(`Super admin account created: ${email}`)
        } else {
            if (!['admin', 'superAdmin'].includes(existingAdmin.role)) {
                throw new Error('ADMIN_EMAIL already belongs to a non-admin account; choose a different email')
            }
            if (existingAdmin.role !== 'superAdmin') {
                existingAdmin.role = 'superAdmin'
                await existingAdmin.save()
            }
            console.log('Super admin account already exists.')
        }

        for (const office of defaultOffices) {
            await Office.updateOne({ code: office.code }, { $setOnInsert: office }, { upsert: true })
        }
        console.log('Default approval offices are ready: Library, Accounts, Department.')

        if (process.argv.includes('--demo')) {
            const offices = await Office.find({ isActive: true }).sort({ workflowOrder: 1, name: 1 })
            await seedDemoData(offices)
        }
    } catch (error) {
        console.error('Seed failed:', error.message)
        process.exitCode = 1
    } finally {
        await User.db.close()
    }
}

seed()
