import express from 'express'
import {
    createClearance,
    getMyRequest,
    resubmitClearance,
    getAllRequests,
    updateClearanceItem,
    uploadClearanceDocuments,
} from '../controllers/clearanceController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'
import { uploadDocuments } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/', protect, authorize(['student']), createClearance)
router.get('/my', protect, authorize(['student']), getMyRequest)
router.post('/my/resubmit', protect, authorize(['student']), resubmitClearance)
router.post('/documents', protect, authorize(['student']), uploadDocuments, uploadClearanceDocuments)
router.get('/', protect, authorize(['admin']), getAllRequests)
router.patch('/:requestId/item/:itemId', protect, authorize(['admin']), updateClearanceItem)

export default router
