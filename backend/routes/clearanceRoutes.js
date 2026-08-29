import express from 'express'
import {
    createClearance,
    getMyRequest,
    getAllRequests,
    updateClearanceItem,
} from '../controllers/clearanceController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, authorize(['student']), createClearance)
router.get('/my', protect, authorize(['student']), getMyRequest)
router.get('/', protect, authorize(['admin']), getAllRequests)
router.patch('/:requestId/item/:itemId', protect, authorize(['admin']), updateClearanceItem)

export default router
