import mongoose from 'mongoose'

const approvalSchema = new mongoose.Schema(
    {
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClearanceRequest', required: true },
        officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
        staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
        remarks: { type: String, trim: true, maxlength: 1000, default: '' },
        decidedAt: { type: Date, default: null },
        stepOrder: { type: Number, required: true, min: 1 },
    },
    { timestamps: true }
)

approvalSchema.index({ requestId: 1, officeId: 1 }, { unique: true })
approvalSchema.index({ officeId: 1, status: 1, createdAt: -1 })

export default mongoose.model('Approval', approvalSchema)