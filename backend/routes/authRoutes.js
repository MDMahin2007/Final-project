import express from 'express'
import { registerUser, registerAdmin, loginUser, getMe } from '../controllers/authController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/register-admin', protect, authorize(['admin']), registerAdmin)
router.post('/login', loginUser)
router.get('/me', protect, getMe)

export default router
