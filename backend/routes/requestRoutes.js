import express from 'express'
import { cancelRequest, createRequest, getMyRequests, getRequestDetails, uploadRequestDocuments } from '../controllers/requestController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'
import { uploadDocuments } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.use(protect)
router.post('/', authorize(['student']), createRequest)
router.get('/my', authorize(['student']), getMyRequests)
router.patch('/:id/cancel', authorize(['student']), cancelRequest)
router.post('/:id/documents', authorize(['student']), uploadDocuments, uploadRequestDocuments)
router.get('/:id', authorize(['student', 'officeStaff', 'superAdmin', 'admin']), getRequestDetails)

export default router