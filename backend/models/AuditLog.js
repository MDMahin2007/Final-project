import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
    {
        action: { type: String, enum: ['REQUEST_CREATED', 'APPROVED', 'REJECTED', 'CANCELLED'], required: true },
        actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClearanceRequest', required: true, index: true },
        officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', default: null },
        message: { type: String, trim: true, maxlength: 1000, default: '' },
    },
    { timestamps: true }
)

export default mongoose.model('AuditLog', auditLogSchema)