export const notFound = (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
}

export const errorHandler = (err, req, res, _next) => {
    console.error(err.stack)
    let statusCode = err.status || err.statusCode || 500
    let message = statusCode >= 500 ? 'Server error' : (err.message || 'Request failed')

    if (err instanceof SyntaxError && 'body' in err) {
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
