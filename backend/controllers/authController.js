import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
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

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token: generateToken(user),
                user: user.toJSON(),
            },
        })
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

        const token = generateToken(user)
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: user.toJSON(),
            },
        })
    } catch (error) {
        next(error)
    }
}
