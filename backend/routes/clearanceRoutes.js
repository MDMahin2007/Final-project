import express from 'express'
import {
    createClearance,
    getMyRequests,
    getRequestById,
    getAllRequests,
    updateRequestStatus,
} from '../controllers/clearanceController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, authorize(['student']), createClearance)
router.get('/my', protect, authorize(['student']), getMyRequests)
router.get('/:id', protect, getRequestById)
router.get('/', protect, authorize(['admin']), getAllRequests)
router.put('/:id', protect, authorize(['admin']), updateRequestStatus)

export default router
