import mongoose from 'mongoose'

const officeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
        code: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 12 },
        isActive: { type: Boolean, default: true, index: true },
        workflowOrder: { type: Number, required: true, min: 1, default: 1 },
    },
    { timestamps: true }
)

officeSchema.index({ workflowOrder: 1, name: 1 })

export default mongoose.model('Office', officeSchema)