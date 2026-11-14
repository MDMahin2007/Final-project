import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Approval from '../models/Approval.js'
import ClearanceRequest from '../models/ClearanceRequest.js'
import Office from '../models/Office.js'
import User from '../models/User.js'
import { requestDetail } from './requestController.js'

const parseDateRange = (query) => {
    const filter = {}
    if (query.dateFrom) {
        const from = new Date(query.dateFrom)
        if (Number.isNaN(from.valueOf())) throw new Error('dateFrom must be a valid date')
        from.setHours(0, 0, 0, 0)
        filter.$gte = from
    }
    if (query.dateTo) {
        const to = new Date(query.dateTo)
        if (Number.isNaN(to.valueOf())) throw new Error('dateTo must be a valid date')
        to.setHours(23, 59, 59, 999)
        filter.$lte = to
    }
    return Object.keys(filter).length ? filter : null
}

export const getOffices = async (_req, res, next) => {
    try {
        const offices = await Office.find().sort({ workflowOrder: 1, name: 1 })
        res.json({ success: true, data: offices })
    } catch (error) {
        next(error)
    }
}

export const createOffice = async (req, res, next) => {
    try {
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
        const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : ''
        if (name.length < 2 || name.length > 80 || !/^[A-Z0-9_-]{2,12}$/.test(code)) {
            return res.status(400).json({ success: false, message: 'Provide an office name and a 2-12 character code' })
        }
        const workflowOrder = Number(req.body?.workflowOrder)
        if (!Number.isInteger(workflowOrder) || workflowOrder < 1) {
            return res.status(400).json({ success: false, message: 'Workflow order must be a positive whole number' })
        }
        const office = await Office.create({ name, code, workflowOrder })
        res.status(201).json({ success: true, message: 'Office created', data: office })
    } catch (error) {
        next(error)
    }
}

export const updateOffice = async (req, res, next) => {
    try {
        const { id } = req.params
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid office ID' })
        const updates = {}
        if (typeof req.body?.name === 'string') updates.name = req.body.name.trim()
        if (typeof req.body?.code === 'string') updates.code = req.body.code.trim().toUpperCase()
        if (typeof req.body?.isActive === 'boolean') updates.isActive = req.body.isActive
        if (req.body?.workflowOrder !== undefined) updates.workflowOrder = Number(req.body.workflowOrder)
        if (updates.isActive === false) {
            const pendingRequestIds = await Approval.distinct('requestId', { officeId: id, status: 'PENDING' })
            const pendingCount = await ClearanceRequest.countDocuments({
                _id: { $in: pendingRequestIds },
                overallStatus: { $in: ['PENDING', 'IN_PROGRESS'] },
            })
            if (pendingCount) {
                return res.status(409).json({ success: false, message: 'Resolve this office\'s pending approvals before deactivating it' })
            }
        }
        if (Object.hasOwn(updates, 'workflowOrder') && (!Number.isInteger(updates.workflowOrder) || updates.workflowOrder < 1)) {
            return res.status(400).json({ success: false, message: 'Workflow order must be a positive whole number' })
        }
        const office = await Office.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        if (!office) return res.status(404).json({ success: false, message: 'Office not found' })
        res.json({ success: true, message: 'Office updated', data: office })
    } catch (error) {
        next(error)
    }
}

export const getStaff = async (_req, res, next) => {
    try {
        const staff = await User.find({ role: 'officeStaff' }).select('-password').populate('officeId', 'name code isActive').sort({ name: 1 })
        res.json({ success: true, data: staff })
    } catch (error) {
        next(error)
    }
}

export const createStaff = async (req, res, next) => {
    try {
        const { name, email, password, officeId } = req.body || {}
        const cleanName = typeof name === 'string' ? name.trim() : ''
        const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
        if (cleanName.length < 2 || cleanName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({ success: false, message: 'Provide a valid staff name and email' })
        }
        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
        }
        if (!mongoose.isValidObjectId(officeId)) {
            return res.status(400).json({ success: false, message: 'Select a valid office' })
        }
        const office = await Office.findOne({ _id: officeId, isActive: true })
        if (!office) return res.status(404).json({ success: false, message: 'Active office not found' })
        if (await User.exists({ email: cleanEmail })) {
            return res.status(409).json({ success: false, message: 'Email is already registered' })
        }
        const staff = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: await bcrypt.hash(password, 10),
            role: 'officeStaff',
            officeId: office._id,
        })
        res.status(201).json({ success: true, message: 'Office staff account created', data: { ...staff.toJSON(), officeId: office } })
    } catch (error) {
        next(error)
    }
}

export const getAdminRequests = async (req, res, next) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : ''
        if (status && !['PENDING', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid overall status filter' })
        }
        const filter = {}
        if (status) filter.overallStatus = status
        const dateRange = parseDateRange(req.query)
        if (dateRange) filter.submittedAt = dateRange
        if (req.query.officeId) {
            if (!mongoose.isValidObjectId(req.query.officeId)) {
                return res.status(400).json({ success: false, message: 'Invalid office filter' })
            }
            const requestIds = await Approval.distinct('requestId', { officeId: req.query.officeId })
            filter._id = { $in: requestIds }
        }
        const requests = await ClearanceRequest.find(filter)
            .sort({ submittedAt: -1 })
            .populate('studentUserId', 'name email studentId department semester phone')
        res.json({ success: true, data: await Promise.all(requests.map(requestDetail)) })
    } catch (error) {
        if (error.message.startsWith('dateFrom') || error.message.startsWith('dateTo')) {
            return res.status(400).json({ success: false, message: error.message })
        }
        next(error)
    }
}