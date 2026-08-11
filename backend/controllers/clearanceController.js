import Clearance from '../models/Clearance.js'
import generateRequestId from '../utils/generateRequestId.js'

export const createClearance = async (req, res, next) => {
    try {
        const { semester, phone, reason } = req.body
        const { name, studentId, department, _id } = req.user

        if (!semester || !phone || !reason) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields' })
        }

        if (!['Course Completion', 'Internship', 'Certificate Collection', 'Library Clearance', 'Other'].includes(reason)) {
            return res.status(400).json({ success: false, message: 'Invalid reason selected' })
        }

        const requestId = await generateRequestId()
        const clearance = await Clearance.create({
            requestId,
            studentName: name,
            studentId: studentId || '',
            department: department || '',
            semester,
            phone,
            reason,
            createdBy: _id,
        })

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
        const request = await Clearance.findById(req.params.id)
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
        const requests = await Clearance.find().sort({ createdAt: -1 }).populate('createdBy', 'name studentId department email')
        res.json({ success: true, data: requests })
    } catch (error) {
        next(error)
    }
}

export const updateRequestStatus = async (req, res, next) => {
    try {
        const { status, remarks } = req.body
        const { id } = req.params

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' })
        }

        if (status === 'Rejected' && !remarks?.trim()) {
            return res.status(400).json({ success: false, message: 'Remarks are required for rejection' })
        }

        const request = await Clearance.findById(id)
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' })
        }

        request.status = status
        request.remarks = remarks || ''
        await request.save()

        res.json({ success: true, message: 'Request updated successfully', data: request })
    } catch (error) {
        next(error)
    }
}
