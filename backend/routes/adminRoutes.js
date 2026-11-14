import express from 'express'
import { createOffice, createStaff, getAdminRequests, getOffices, getStaff, updateOffice } from '../controllers/adminController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, authorize(['superAdmin', 'admin']))
router.get('/offices', getOffices)
router.post('/offices', createOffice)
router.patch('/offices/:id', updateOffice)
router.get('/staff', getStaff)
router.post('/staff', createStaff)
router.get('/requests', getAdminRequests)

export default router