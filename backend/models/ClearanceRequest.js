import mongoose from 'mongoose'

export const REQUEST_STATUSES = ['PENDING', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'CANCELLED']

const clearanceRequestSchema = new mongoose.Schema(
    {
        studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        purpose: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
        overallStatus: { type: String, enum: REQUEST_STATUSES, default: 'PENDING', index: true },
        documents: {
            type: [{
                name: { type: String, required: true, trim: true },
                url: { type: String, required: true, trim: true },
                publicId: { type: String, default: '' },
                resourceType: { type: String, enum: ['raw', 'image'], default: 'raw' },
                uploadedAt: { type: Date, default: Date.now },
            }],
            default: [],
        },
        attachmentUrl: { type: String, trim: true, default: '' },
        submittedAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true, collection: 'clearanceRequests' }
)

clearanceRequestSchema.index({ studentUserId: 1, submittedAt: -1 })

const ClearanceRequest = mongoose.model('ClearanceRequest', clearanceRequestSchema)

export default ClearanceRequest
