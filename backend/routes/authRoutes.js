import express from 'express'
import rateLimit from 'express-rate-limit'
import { registerUser, loginUser, getMe, updateMe, updateAvatar } from '../controllers/authController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'
import { uploadAvatar } from '../middleware/uploadMiddleware.js'

const router = express.Router()
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
})

router.post('/register', authLimiter, registerUser)
router.post('/register-student', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.get('/me', protect, getMe)
router.patch('/me', protect, authorize(['student']), updateMe)
router.post('/me/avatar', protect, uploadAvatar, updateAvatar)

export default router
