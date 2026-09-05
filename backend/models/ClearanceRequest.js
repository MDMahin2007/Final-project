import mongoose from 'mongoose'

export const CLEARANCE_DEPARTMENTS = ['Library', 'Hostel', 'Accounts', 'Department']

const clearanceItemSchema = new mongoose.Schema(
    {
        department: { type: String, enum: CLEARANCE_DEPARTMENTS, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        remarks: { type: String, trim: true, maxlength: 1000, default: '' },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: true }
)

const clearanceRequestSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        documents: {
            type: [{
                name: { type: String, required: true, trim: true },
                url: { type: String, required: true, trim: true },
                uploadedAt: { type: Date, default: Date.now },
            }],
            default: [],
        },
        items: {
            type: [clearanceItemSchema],
            required: true,
            validate: {
                validator: (items) =>
                    items.length === CLEARANCE_DEPARTMENTS.length &&
                    new Set(items.map((item) => item.department)).size === CLEARANCE_DEPARTMENTS.length,
                message: 'A request must contain one item for every clearance department',
            },
        },
        overallStatus: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
    },
    { timestamps: true }
)

// A request is complete only after every department approves it. A rejection
// takes priority so students immediately know that action is required.
clearanceRequestSchema.pre('validate', function calculateOverallStatus() {
    if (this.items.some((item) => item.status === 'rejected')) {
        this.overallStatus = 'rejected'
    } else if (this.items.length && this.items.every((item) => item.status === 'approved')) {
        this.overallStatus = 'completed'
    } else {
        this.overallStatus = 'pending'
    }
})

const ClearanceRequest = mongoose.model('ClearanceRequest', clearanceRequestSchema)

export default ClearanceRequest
