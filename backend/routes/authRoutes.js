import express from 'express'
import { registerUser, registerAdmin, loginUser, getMe } from '../controllers/authController.js'
import { protect, optionalProtect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/register-admin', optionalProtect, registerAdmin)
router.post('/login', loginUser)
router.get('/me', protect, getMe)

export default router
