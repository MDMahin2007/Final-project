import express from 'express'
import { getReportSummary } from '../controllers/reportController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/summary', protect, authorize(['superAdmin', 'admin']), getReportSummary)

export default router