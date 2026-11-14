import test from 'node:test'
import assert from 'node:assert/strict'
import { getCloudinary } from '../middleware/uploadMiddleware.js'

test('uploads fail with a clear 503 when Cloudinary credentials are absent', () => {
    const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]))
    keys.forEach((key) => delete process.env[key])

    try {
        assert.throws(getCloudinary, (error) =>
            error.status === 503 && error.message === 'Cloudinary storage is not configured'
        )
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key]
            else process.env[key] = value
        }
    }
})