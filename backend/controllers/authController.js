import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { removeUploadedFile } from '../middleware/uploadMiddleware.js'

const generateToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })
}

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
        const { name, studentId, department, email, password, semester } = req.body

        if (![name, studentId, department, email, password].every((value) => typeof value === 'string' && value.trim())) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields' })
        }

        if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{2,29}$/.test(studentId.trim())) {
            return res.status(400).json({ success: false, message: 'Student ID must be 3-30 letters, numbers, or . _ / - characters' })
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
            semester: typeof semester === 'string' ? semester.trim() : '',
        })

        sendAuthResponse(res, 201, 'Registration successful', user)
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req, res, next) => {
    try {
        const identifier = req.body?.identifier || req.body?.email || req.body?.studentId
        const { password } = req.body || {}

        if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier.trim() || !password) {
            return res.status(400).json({ success: false, message: 'Student ID or email and password are required' })
        }

        const value = identifier.trim()
        const user = await User.findOne({
            $or: [{ email: value.toLowerCase() }, { studentId: value }],
        }).select('+password')
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

export const updateMe = async (req, res, next) => {
    try {
        const allowedFields = ['phone', 'program', 'session', 'semester']
        const providedFields = allowedFields.filter((field) => req.body?.[field] !== undefined)

        if (!providedFields.length) {
            return res.status(400).json({ success: false, message: 'Provide at least one profile field to update' })
        }

        for (const field of providedFields) {
            if (typeof req.body[field] !== 'string') {
                return res.status(400).json({ success: false, message: `${field} must be a text value` })
            }
        }

        providedFields.forEach((field) => {
            req.user[field] = req.body[field].trim()
        })

        await req.user.save()
        res.json({ success: true, message: 'Profile updated successfully', data: { user: req.user.toJSON() } })
    } catch (error) {
        next(error)
    }
}

export const updateAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'A JPG or PNG profile picture is required' })
        }

        const previousPictureId = req.user.profilePicturePublicId
        req.user.profilePicture = req.file.path
        req.user.profilePicturePublicId = req.file.filename
        await req.user.save()
        try {
            await removeUploadedFile(previousPictureId, 'image')
        } catch (cleanupError) {
            console.error('Previous profile picture cleanup failed:', cleanupError.message)
        }

        res.json({ success: true, message: 'Profile picture updated successfully', data: { user: req.user.toJSON() } })
    } catch (error) {
        if (req.file?.filename) await removeUploadedFile(req.file.filename, req.file.resourceType)
        next(error)
    }
}