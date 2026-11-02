import mongoose from 'mongoose'
import AuditLog from '../models/AuditLog.js'
import Approval from '../models/Approval.js'
import ClearanceRequest from '../models/ClearanceRequest.js'
import { removeUploadedFile } from '../middleware/uploadMiddleware.js'
import Office from '../models/Office.js'
import { calculateRequestStatus } from '../utils/statusCalculator.js'

export const requestDetail = async (request) => {
    const [approvals, timeline] = await Promise.all([
        Approval.find({ requestId: request._id })
            .sort({ stepOrder: 1 })
            .populate('officeId', 'name code')
            .populate('staffId', 'name'),
        AuditLog.find({ requestId: request._id })
            .sort({ createdAt: 1 })
            .populate('actorUserId', 'name role')
            .populate('officeId', 'name code'),
    ])

    return { ...request.toObject(), approvals, timeline }
}

export const createRequest = async (req, res, next) => {
    let request
    try {
        const purpose = typeof req.body?.purpose === 'string' ? req.body.purpose.trim() : ''
        if (purpose.length < 3 || purpose.length > 200) {
            return res.status(400).json({ success: false, message: 'Purpose must be between 3 and 200 characters' })
        }

        const offices = await Office.find({ isActive: true }).sort({ workflowOrder: 1, name: 1 })
        if (!offices.length) {
            return res.status(503).json({ success: false, message: 'The clearance workflow is not configured yet' })
        }

        const activeRequest = await ClearanceRequest.findOne({
            studentUserId: req.user._id,
            overallStatus: { $in: ['PENDING', 'IN_PROGRESS'] },
        })
        if (activeRequest) {
            return res.status(409).json({ success: false, message: 'You already have an active clearance request' })
        }

        request = await ClearanceRequest.create({
            studentUserId: req.user._id,
            purpose,
            overallStatus: 'PENDING',
        })
        await Approval.insertMany(offices.map((office, index) => ({
            requestId: request._id,
            officeId: office._id,
            stepOrder: index + 1,
        })))
        await AuditLog.create({
            action: 'REQUEST_CREATED',
            actorUserId: req.user._id,
            requestId: request._id,
            message: `Submitted clearance request: ${purpose}`,
        })

        res.status(201).json({
            success: true,
            message: 'Clearance request submitted successfully',
            data: await requestDetail(request),
        })
    } catch (error) {
        if (request?._id) {
            await Promise.all([
                Approval.deleteMany({ requestId: request._id }),
                AuditLog.deleteMany({ requestId: request._id }),
                ClearanceRequest.deleteOne({ _id: request._id }),
            ])
        }
        next(error)
    }
}

export const getMyRequests = async (req, res, next) => {
    try {
        const requests = await ClearanceRequest.find({ studentUserId: req.user._id }).sort({ submittedAt: -1 })
        const data = await Promise.all(requests.map(requestDetail))
        res.json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

export const getRequestDetails = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid request ID' })
        }
        const filter = { _id: req.params.id }
        if (req.user.role === 'student') filter.studentUserId = req.user._id
        if (req.user.role === 'officeStaff' && req.user.officeId) {
            const assigned = await Approval.exists({ requestId: req.params.id, officeId: req.user.officeId })
            if (!assigned) return res.status(404).json({ success: false, message: 'Request not found' })
        }
        const request = await ClearanceRequest.findOne(filter).populate('studentUserId', 'name email studentId department')
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' })
        res.json({ success: true, data: await requestDetail(request) })
    } catch (error) {
        next(error)
    }
}

export const cancelRequest = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid request ID' })
        }
        const request = await ClearanceRequest.findOne({ _id: req.params.id, studentUserId: req.user._id })
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' })
        const decidedCount = await Approval.countDocuments({ requestId: request._id, status: { $ne: 'PENDING' } })
        if (decidedCount || request.overallStatus !== 'PENDING') {
            return res.status(409).json({ success: false, message: 'A request can only be cancelled before an office starts reviewing it' })
        }

        const updated = await ClearanceRequest.updateOne(
            { _id: request._id, studentUserId: req.user._id, overallStatus: 'PENDING' },
            { $set: { overallStatus: 'CANCELLED' } },
        )
        if (!updated.modifiedCount) {
            return res.status(409).json({ success: false, message: 'This request has already started processing' })
        }
        await AuditLog.create({
            action: 'CANCELLED',
            actorUserId: req.user._id,
            requestId: request._id,
            message: 'Student cancelled the request before office review began',
        })
        const cancelled = await ClearanceRequest.findById(request._id)
        res.json({ success: true, message: 'Request cancelled', data: await requestDetail(cancelled) })
    } catch (error) {
        next(error)
    }
}

export const uploadRequestDocuments = async (req, res, next) => {
    try {
        const request = await ClearanceRequest.findOne({
            _id: req.params.id,
            studentUserId: req.user._id,
        })
        if (!request) {
            await Promise.all((req.files || []).map((file) => removeUploadedFile(file.path)))
            return res.status(404).json({ success: false, message: 'Request not found' })
        }
        if (['CLEARED', 'CANCELLED'].includes(request.overallStatus)) {
            await Promise.all((req.files || []).map((file) => removeUploadedFile(file.path)))
            return res.status(400).json({ success: false, message: 'Documents cannot be added to a closed request' })
        }
        if (!req.files?.length) {
            return res.status(400).json({ success: false, message: 'Select at least one PDF document' })
        }
        if (request.documents.length + req.files.length > 6) {
            await Promise.all((req.files || []).map((file) => removeUploadedFile(file.path)))
            return res.status(400).json({ success: false, message: 'A request can contain up to 6 documents' })
        }
        request.documents.push(...req.files.map((file) => ({
            name: file.originalname,
            url: `/uploads/documents/${file.filename}`,
            uploadedAt: new Date(),
        })))
        await request.save()
        res.status(201).json({ success: true, message: 'Documents uploaded', data: await requestDetail(request) })
    } catch (error) {
        await Promise.all((req.files || []).map((file) => removeUploadedFile(file.path)))
        next(error)
    }
}