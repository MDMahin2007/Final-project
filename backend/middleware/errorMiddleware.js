export const notFound = (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
}

export const errorHandler = (err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server error',
    })
}
