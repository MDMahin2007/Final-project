import Clearance from '../models/Clearance.js'

const generateRequestId = async () => {
    const year = new Date().getFullYear()
    const prefix = `CLR-${year}`
    const latest = await Clearance.find({ requestId: new RegExp(`^${prefix}-`) })
        .sort({ createdAt: -1 })
        .limit(1)

    if (!latest.length) {
        return `${prefix}-001`
    }

    const lastId = latest[0].requestId
    const currentNumber = parseInt(lastId.split('-').pop(), 10)
    const nextNumber = String(currentNumber + 1).padStart(3, '0')
    return `${prefix}-${nextNumber}`
}

export default generateRequestId
