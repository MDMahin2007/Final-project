import mongoose from 'mongoose'
import AuditLog from '../models/AuditLog.js'
import Approval from '../models/Approval.js'
import ClearanceRequest from '../models/ClearanceRequest.js'
import { calculateRequestStatus, isApprovalReady } from '../utils/statusCalculator.js'
import { requestDetail } from './requestController.js'

export const getAssignedRequests = async (req, res, next) => {
    try {
        if (!req.user.officeId) {
            return res.status(403).json({ success: false, message: 'Your account is not assigned to an office' })
        }
        const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'PENDING'
        if (!['PENDING', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'CANCELLED', 'ALL'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid request status filter' })
        }

        const approvalFilter = { officeId: req.user.officeId }
        if (status === 'PENDING') approvalFilter.status = 'PENDING'
        if (status === 'IN_PROGRESS') approvalFilter.status = { $in: ['PENDING', 'APPROVED'] }
        const approvals = await Approval.find(approvalFilter).select('requestId')
        const requestFilter = { _id: { $in: approvals.map((approval) => approval.requestId) } }
        if (status === 'PENDING') {
            requestFilter.overallStatus = { $in: ['PENDING', 'IN_PROGRESS'] }
        } else if (status !== 'ALL') {
            requestFilter.overallStatus = status
        }

        const requests = await ClearanceRequest.find(requestFilter)
            .sort({ submittedAt: 1 })
            .populate('studentUserId', 'name email studentId department semester phone')
        const requestData = await Promise.all(requests.map(requestDetail))
        const data = status === 'PENDING'
            ? requestData.filter((request) => {
                const currentApproval = request.approvals.find((approval) => String(approval.officeId?._id || approval.officeId) === String(req.user.officeId))
                return currentApproval && isApprovalReady(currentApproval, request.approvals)
            })
            : requestData

        res.json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

export const decideApproval = (status) => async (req, res, next) => {
    try {
        const { approvalId } = req.params
        const remarks = typeof req.body?.remarks === 'string' ? req.body.remarks.trim() : ''
        if (!mongoose.isValidObjectId(approvalId)) {
            return res.status(400).json({ success: false, message: 'Invalid approval ID' })
        }
        if (remarks.length > 1000) {
            return res.status(400).json({ success: false, message: 'Remarks must be 1000 characters or fewer' })
        }
        if (status === 'REJECTED' && remarks.length < 3) {
            return res.status(400).json({ success: false, message: 'A rejection reason of at least 3 characters is required' })
        }

        const approval = await Approval.findOne({ _id: approvalId, officeId: req.user.officeId })
        if (!approval) return res.status(404).json({ success: false, message: 'Assigned approval not found' })
        if (approval.status !== 'PENDING') {
            return res.status(409).json({ success: false, message: 'This office has already submitted its decision' })
        }

        let request = await ClearanceRequest.findById(approval.requestId)
        if (!request || !['PENDING', 'IN_PROGRESS'].includes(request.overallStatus)) {
            return res.status(409).json({ success: false, message: 'This request is no longer open for review' })
        }

        const approvalsBeforeDecision = await Approval.find({ requestId: request._id }).select('status stepOrder')
        if (!isApprovalReady(approval, approvalsBeforeDecision)) {
            return res.status(409).json({ success: false, message: 'The previous office must approve this request first' })
        }

        if (request.overallStatus === 'PENDING') {
            const claimed = await ClearanceRequest.updateOne(
                { _id: request._id, overallStatus: 'PENDING' },
                { $set: { overallStatus: 'IN_PROGRESS' } },
            )
            if (!claimed.modifiedCount) {
                request = await ClearanceRequest.findById(request._id)
                if (!request || request.overallStatus !== 'IN_PROGRESS') {
                    return res.status(409).json({ success: false, message: 'This request is no longer open for review' })
                }
            }
        }

        const decidedAt = new Date()
        const updatedApproval = await Approval.findOneAndUpdate(
            { _id: approval._id, officeId: req.user.officeId, status: 'PENDING' },
            { $set: { status, remarks, staffId: req.user._id, decidedAt } },
            { new: true },
        )
        if (!updatedApproval) {
            return res.status(409).json({ success: false, message: 'This office has already submitted its decision' })
        }

        const approvals = await Approval.find({ requestId: request._id }).select('status')
        request.overallStatus = calculateRequestStatus(approvals)
        await request.save()
        await AuditLog.create({
            action: status,
            actorUserId: req.user._id,
            requestId: request._id,
            officeId: approval.officeId,
            message: remarks,
        })

        const populatedRequest = await ClearanceRequest.findById(request._id).populate('studentUserId', 'name email studentId department semester phone')
        res.json({
            success: true,
            message: `Office decision recorded: ${status.toLowerCase()}`,
            data: {
                ...populatedRequest.toObject(),
                approvals: await Approval.find({ requestId: request._id }).sort({ stepOrder: 1 }).populate('officeId', 'name code').populate('staffId', 'name'),
                timeline: await AuditLog.find({ requestId: request._id }).sort({ createdAt: 1 }).populate('actorUserId', 'name role').populate('officeId', 'name code'),
            },
        })
    } catch (error) {
        next(error)
    }
}