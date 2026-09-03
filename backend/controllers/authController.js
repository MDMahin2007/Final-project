import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    })
}

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '')

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const sendAuthResponse = (res, statusCode, message, user) => {
    res.status(statusCode).json({
        success: true,
        message,
        data: {
            token: generateToken(user),
            user: user.toJSON(),
        },
    })
}

export const registerUser = async (req, res, next) => {
    try {
        const { name, studentId, department, email, password } = req.body

        if (![name, studentId, department, email, password].every((value) => typeof value === 'string' && value.trim())) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields' })
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
        }

        const normalizedEmail = email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' })
        }
        const normalizedStudentId = studentId.trim()
        const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }] })
        if (existingUser) {
            return res.status(409).json({ success: false, message: existingUser.email === normalizedEmail ? 'Email already registered' : 'Student ID already registered' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name: name.trim(),
            studentId: normalizedStudentId,
            department: department.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'student',
        })

        sendAuthResponse(res, 201, 'Registration successful', user)
    } catch (error) {
        next(error)
    }
}

export const registerAdmin = async (req, res, next) => {
    try {
        const { name, email, password, adminSecretKey } = req.body

        const isAuthorizedAdmin = req.user && req.user.role === 'admin'

        if (![name, email, password].every((value) => typeof value === 'string' && value.trim())) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields' })
        }

        if (!isAuthorizedAdmin) {
            if (!adminSecretKey || typeof adminSecretKey !== 'string' || !adminSecretKey.trim()) {
                return res.status(400).json({ success: false, message: 'Admin security key is required' })
            }
            const expectedKey = process.env.ADMIN_SECRET_KEY || 'ClearPathAdmin2026!'
            if (adminSecretKey.trim() !== expectedKey.trim()) {
                return res.status(403).json({ success: false, message: 'Invalid admin security key' })
            }
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' })
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
        }

        const normalizedEmail = normalizeEmail(email)
        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' })
        }

        const existingUser = await User.findOne({ email: normalizedEmail })
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered' })
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 10),
            role: 'admin',
        })

        if (isAuthorizedAdmin) {
            return res.status(201).json({
                success: true,
                message: 'Admin registration successful',
                data: { user: user.toJSON() },
            })
        }

        sendAuthResponse(res, 201, 'Admin registration successful', user)
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' })
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' })
        }

        sendAuthResponse(res, 200, 'Login successful', user)
    } catch (error) {
        next(error)
    }
}

export const getMe = async (req, res) => {
    res.json({ success: true, data: { user: req.user.toJSON() } })
}
