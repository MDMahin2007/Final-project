export const notFound = (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
}

export const errorHandler = (err, req, res, _next) => {
    console.error(err.stack)
    let statusCode = err.status || err.statusCode || 500
    let message = statusCode >= 500 ? 'Server error' : (err.message || 'Request failed')

    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400
        message = 'Uploaded file is too large'
    } else if (err.code === 'LIMIT_FILE_COUNT') {
        statusCode = 400
        message = 'Too many files uploaded'
    } else if (err.message === 'Only PDF clearance documents are allowed' || err.message === 'Only JPG or PNG profile pictures are allowed') {
        statusCode = 400
        message = err.message
    } else if (err instanceof SyntaxError && 'body' in err) {
        statusCode = 400
        message = 'Malformed JSON request'
    } else if (err.name === 'CastError') {
        statusCode = 400
        message = 'Invalid resource ID'
    } else if (err.code === 11000) {
        statusCode = 409
        message = 'A record with this value already exists'
    } else if (err.name === 'ValidationError') {
        statusCode = 400
        message = Object.values(err.errors).map((error) => error.message).join(', ')
    }

    res.status(statusCode).json({
        success: false,
        message,
    })
}
