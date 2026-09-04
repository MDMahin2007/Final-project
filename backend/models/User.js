import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
        // Required for student accounts. `sparse` lets admin accounts omit it.
        studentId: { type: String, trim: true, unique: true, sparse: true },
        department: { type: String, trim: true },
        phone: { type: String, trim: true, maxlength: 30, default: '' },
        program: { type: String, trim: true, maxlength: 120, default: '' },
        session: { type: String, trim: true, maxlength: 30, default: '' },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
        },
        password: { type: String, required: true, minlength: 8, select: false },
        role: { type: String, enum: ['student', 'admin'], default: 'student' },
    },
    {
        timestamps: true,
    }
)

userSchema.methods.toJSON = function () {
    const user = this.toObject()
    delete user.password
    return user
}

const User = mongoose.model('User', userSchema)
export default User
