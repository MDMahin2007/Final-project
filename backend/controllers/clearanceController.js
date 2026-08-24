import Clearance from '../models/Clearance.js'
import generateRequestId from '../utils/generateRequestId.js'

export const createClearance = async (req, res, next) => {
    try {
        const { semester, phone, reason } = req.body
        const { name, studentId, department, _id } = req.user

        if (![semester, phone, reason].every((value) => typeof value === 'string' && value.trim())) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields' })
        }

        if (!studentId || !department) {
            return res.status(400).json({ success: false, message: 'Your student profile is incomplete. Contact an administrator.' })
        }

        if (!/^[0-9+\- ]{7,15}$/.test(phone.trim())) {
            return res.status(400).json({ success: false, message: 'Please enter a valid phone number' })
        }

        const cleanReason = reason.trim()
        if (!['Course Completion', 'Internship', 'Certificate Collection', 'Library Clearance', 'Other'].includes(cleanReason)) {
            return res.status(400).json({ success: false, message: 'Invalid reason selected' })
        }

        const existingPendingRequest = await Clearance.findOne({ createdBy: _id, reason: cleanReason, status: 'Pending' })
        if (existingPendingRequest) {
            return res.status(409).json({ success: false, message: 'You already have a pending request for this reason' })
        }

        let clearance
        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                clearance = await Clearance.create({
                    requestId: await generateRequestId(), studentName: name, studentId, department,
                    semester: semester.trim(), phone: phone.trim(), reason: cleanReason, createdBy: _id,
                })
                break
            } catch (error) {
                if (error.code !== 11000 || attempt === 2) throw error
            }
        }

        res.status(201).json({
            success: true,
            message: 'Clearance request created successfully',
            data: clearance,
        })
    } catch (error) {
        next(error)
    }
}

export const getMyRequests = async (req, res, next) => {
    try {
        const requests = await Clearance.find({ createdBy: req.user._id }).sort({ createdAt: -1 })
        res.json({ success: true, data: requests })
    } catch (error) {
        next(error)
    }
}

export const getRequestById = async (req, res, next) => {
    try {
        const request = await Clearance.findById(req.params.id).populate('reviewedBy', 'name email')
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' })
        }

        if (req.user.role === 'student' && String(request.createdBy) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Forbidden' })
        }

        res.json({ success: true, data: request })
    } catch (error) {
        next(error)
    }
}

export const getAllRequests = async (req, res, next) => {
    try {
        const requests = await Clearance.find().sort({ createdAt: -1 }).populate('createdBy', 'name studentId department email').populate('reviewedBy', 'name email')
        res.json({ success: true, data: requests })
    } catch (error) {
        next(error)
    }
}

export const updateRequestStatus = async (req, res, next) => {
    try {
        const { status, remarks } = req.body
        const { id } = req.params
        const cleanRemarks = typeof remarks === 'string' ? remarks.trim() : ''

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' })
        }

        if (status === 'Rejected' && !cleanRemarks) {
            return res.status(400).json({ success: false, message: 'Remarks are required for rejection' })
        }

        const request = await Clearance.findById(id)
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' })
        }

        if (request.status !== 'Pending') {
            return res.status(409).json({ success: false, message: 'Only pending requests can be reviewed' })
        }

        request.status = status
        request.remarks = cleanRemarks
        request.reviewedBy = req.user._id
        request.reviewedAt = new Date()
        await request.save()

        res.json({ success: true, message: 'Request updated successfully', data: request })
    } catch (error) {
        next(error)
    }
}
