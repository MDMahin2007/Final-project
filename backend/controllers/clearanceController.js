import ClearanceRequest, { CLEARANCE_DEPARTMENTS } from '../models/ClearanceRequest.js'

// A student can submit one immutable request. Its four items start pending.
export const createClearance = async (req, res, next) => {
    try {
        const existingRequest = await ClearanceRequest.findOne({ student: req.user._id })
        if (existingRequest) {
            return res.status(409).json({ success: false, message: 'You have already submitted a clearance request' })
        }

        const clearance = await ClearanceRequest.create({
            student: req.user._id,
            items: CLEARANCE_DEPARTMENTS.map((department) => ({ department })),
        })

        res.status(201).json({ success: true, message: 'Clearance request created successfully', data: clearance })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'You have already submitted a clearance request' })
        }
        next(error)
    }
}

export const getMyRequest = async (req, res, next) => {
    try {
        const request = await ClearanceRequest.findOne({ student: req.user._id })
            .populate('student', 'name email studentId department')
        res.json({ success: true, data: request })
    } catch (error) {
        next(error)
    }
}

export const getAllRequests = async (req, res, next) => {
    try {
        const { status } = req.query
        const filter = {}

        if (status) {
            if (!['pending', 'completed', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status filter' })
            }
            filter.overallStatus = status
        }

        const requests = await ClearanceRequest.find(filter)
            .sort({ createdAt: -1 })
            .populate('student', 'name email studentId department')
        res.json({ success: true, data: requests })
    } catch (error) {
        next(error)
    }
}

export const updateClearanceItem = async (req, res, next) => {
    try {
        const { status, remarks } = req.body || {}
        const { requestId, itemId } = req.params
        const cleanRemarks = typeof remarks === 'string' ? remarks.trim() : ''

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be approved or rejected' })
        }

        if (cleanRemarks.length > 1000) {
            return res.status(400).json({ success: false, message: 'Remarks must be 1000 characters or fewer' })
        }

        const request = await ClearanceRequest.findById(requestId)
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' })
        }

        const item = request.items.id(itemId)
        if (!item) {
            return res.status(404).json({ success: false, message: 'Clearance item not found' })
        }

        item.status = status
        item.remarks = cleanRemarks
        item.updatedAt = new Date()
        await request.save()

        const populatedRequest = await request.populate('student', 'name email studentId department')
        res.json({ success: true, message: `${item.department} clearance updated successfully`, data: populatedRequest })
    } catch (error) {
        next(error)
    }
}
