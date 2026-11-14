import express from 'express'
import { decideApproval, getAssignedRequests } from '../controllers/staffController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, authorize(['officeStaff']))
router.get('/requests', getAssignedRequests)
router.patch('/approvals/:approvalId/approve', decideApproval('APPROVED'))
router.patch('/approvals/:approvalId/reject', decideApproval('REJECTED'))

export default router