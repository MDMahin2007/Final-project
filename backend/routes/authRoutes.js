import express from 'express'
import { registerUser, registerAdmin, loginUser, getMe, updateMe, updateAvatar } from '../controllers/authController.js'
import { protect, optionalProtect, authorize } from '../middleware/authMiddleware.js'
import { uploadAvatar } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/register-admin', optionalProtect, registerAdmin)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.patch('/me', protect, authorize(['student']), updateMe)
router.post('/me/avatar', protect, uploadAvatar, updateAvatar)

export default router
