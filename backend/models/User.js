import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        studentId: { type: String, trim: true },
        department: { type: String, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true },
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
