import mongoose from 'mongoose'

const clearanceSchema = new mongoose.Schema(
    {
        requestId: { type: String, required: true, unique: true },
        studentName: { type: String, required: true, trim: true },
        studentId: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        semester: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        reason: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        remarks: { type: String, default: '' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
)

const Clearance = mongoose.model('Clearance', clearanceSchema)
export default Clearance
