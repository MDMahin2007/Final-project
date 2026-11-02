import mongoose from 'mongoose'
import Approval from '../models/Approval.js'
import ClearanceRequest from '../models/ClearanceRequest.js'

const makeSubmittedAtMatch = (query) => {
    const submittedAt = {}
    if (query.dateFrom) {
        const from = new Date(query.dateFrom)
        if (Number.isNaN(from.valueOf())) throw new Error('dateFrom must be a valid date')
        from.setHours(0, 0, 0, 0)
        submittedAt.$gte = from
    }
    if (query.dateTo) {
        const to = new Date(query.dateTo)
        if (Number.isNaN(to.valueOf())) throw new Error('dateTo must be a valid date')
        to.setHours(23, 59, 59, 999)
        submittedAt.$lte = to
    }
    return Object.keys(submittedAt).length ? submittedAt : null
}

export const getReportSummary = async (req, res, next) => {
    try {
        const dateRange = makeSubmittedAtMatch(req.query)
        const requestFilter = dateRange ? { submittedAt: dateRange } : {}
        if (req.query.officeId) {
            if (!mongoose.isValidObjectId(req.query.officeId)) {
                return res.status(400).json({ success: false, message: 'Invalid office filter' })
            }
            requestFilter._id = {
                $in: await Approval.distinct('requestId', { officeId: req.query.officeId }),
            }
        }

        const [requestCounts, officeBacklog, averageApprovalTime] = await Promise.all([
            ClearanceRequest.aggregate([
                { $match: requestFilter },
                { $group: { _id: '$overallStatus', count: { $sum: 1 } } },
            ]),
            Approval.aggregate([
                { $match: { status: 'PENDING' } },
                { $lookup: { from: 'clearanceRequests', localField: 'requestId', foreignField: '_id', as: 'request' } },
                { $unwind: '$request' },
                { $match: {
                    'request.overallStatus': { $in: ['PENDING', 'IN_PROGRESS'] },
                    ...(dateRange ? { 'request.submittedAt': dateRange } : {}),
                    ...(req.query.officeId ? { officeId: new mongoose.Types.ObjectId(req.query.officeId) } : {}),
                } },
                { $group: { _id: '$officeId', pending: { $sum: 1 } } },
                { $lookup: { from: 'offices', localField: '_id', foreignField: '_id', as: 'office' } },
                { $unwind: '$office' },
                { $project: { _id: 0, officeId: '$_id', name: '$office.name', code: '$office.code', pending: 1 } },
                { $sort: { pending: -1, name: 1 } },
            ]),
            Approval.aggregate([
                { $match: { status: { $in: ['APPROVED', 'REJECTED'] }, decidedAt: { $ne: null } } },
                { $lookup: { from: 'clearanceRequests', localField: 'requestId', foreignField: '_id', as: 'request' } },
                { $unwind: '$request' },
                ...(dateRange ? [{ $match: { 'request.submittedAt': dateRange } }] : []),
                ...(req.query.officeId ? [{ $match: { officeId: new mongoose.Types.ObjectId(req.query.officeId) } }] : []),
                { $group: {
                    _id: '$officeId',
                    averageMilliseconds: { $avg: { $subtract: ['$decidedAt', '$createdAt'] } },
                    decisions: { $sum: 1 },
                } },
                { $lookup: { from: 'offices', localField: '_id', foreignField: '_id', as: 'office' } },
                { $unwind: '$office' },
                { $project: {
                    _id: 0,
                    officeId: '$_id',
                    name: '$office.name',
                    code: '$office.code',
                    decisions: 1,
                    averageHours: { $round: [{ $divide: ['$averageMilliseconds', 3600000] }, 1] },
                } },
                { $sort: { name: 1 } },
            ]),
        ])

        const counts = Object.fromEntries(requestCounts.map(({ _id, count }) => [_id, count]))
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
        res.json({
            success: true,
            data: {
                total,
                pending: counts.PENDING || 0,
                inProgress: counts.IN_PROGRESS || 0,
                cleared: counts.CLEARED || 0,
                rejected: counts.REJECTED || 0,
                cancelled: counts.CANCELLED || 0,
                officeBacklog,
                averageApprovalTime,
            },
        })
    } catch (error) {
        if (error.message.startsWith('dateFrom') || error.message.startsWith('dateTo')) {
            return res.status(400).json({ success: false, message: error.message })
        }
        next(error)
    }
}