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

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields' })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            studentId: studentId || '',
            department: department || '',
            email,
            password: hashedPassword,
            role: 'student',
        })

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
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

        const user = await User.findOne({ email })
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
