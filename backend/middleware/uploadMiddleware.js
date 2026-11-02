import { randomUUID } from 'crypto'
import path from 'path'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'

const MAX_DOCUMENT_SIZE = 4 * 1024 * 1024
const MAX_AVATAR_SIZE = 2 * 1024 * 1024

export const getCloudinary = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
    if (!cloudName || !apiKey || !apiSecret) {
        const error = new Error('Cloudinary storage is not configured')
        error.status = 503
        throw error
    }
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
    return cloudinary
}

const createStorage = (folder, resourceType) => ({
    _handleFile(_req, file, callback) {
        let uploadStream
        let finished = false
        const complete = (...args) => {
            if (finished) return
            finished = true
            callback(...args)
        }
        try {
            const client = getCloudinary()
            const extension = path.extname(file.originalname).toLowerCase()
            const publicId = `${randomUUID()}${resourceType === 'raw' ? extension : ''}`
            uploadStream = client.uploader.upload_stream({
                folder,
                public_id: publicId,
                resource_type: resourceType,
                overwrite: false,
                unique_filename: false,
            }, (error, result) => {
                if (error) return complete(error)
                complete(null, {
                    path: result.secure_url,
                    filename: result.public_id,
                    resourceType: result.resource_type,
                    size: result.bytes,
                })
            })
            file.stream.once('error', complete)
            uploadStream.once('error', complete)
            file.stream.pipe(uploadStream)
        } catch (error) {
            complete(error)
        }
    },
    _removeFile(_req, file, callback) {
        removeUploadedFile(file.filename, file.resourceType).then(() => callback(null), callback)
    },
})

const isPdf = (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    if (extension !== '.pdf' || file.mimetype !== 'application/pdf') {
        return callback(new Error('Only PDF clearance documents are allowed'))
    }
    callback(null, true)
}

const isImage = (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const validExtension = ['.jpg', '.jpeg', '.png'].includes(extension)
    const validMimeType = ['image/jpeg', 'image/png'].includes(file.mimetype)
    if (!validExtension || !validMimeType) {
        return callback(new Error('Only JPG or PNG profile pictures are allowed'))
    }
    callback(null, true)
}

const documentUploader = multer({
    storage: createStorage('clearpath/documents', 'raw'),
    fileFilter: isPdf,
    limits: { files: 1, fileSize: MAX_DOCUMENT_SIZE },
}).array('documents', 1)

const avatarUploader = multer({
    storage: createStorage('clearpath/avatars', 'image'),
    fileFilter: isImage,
    limits: { files: 1, fileSize: MAX_AVATAR_SIZE },
}).single('avatar')

const runUploader = (uploader) => (req, res, next) => {
    uploader(req, res, async (error) => {
        if (error) {
            const files = req.files || (req.file ? [req.file] : [])
            await Promise.all(files.map((file) => removeUploadedFile(file.filename, file.resourceType)))
            return next(error)
        }
        next()
    })
}

export const uploadDocuments = runUploader(documentUploader)
export const uploadAvatar = runUploader(avatarUploader)

export const removeUploadedFile = async (publicId, resourceType = 'image') => {
    if (!publicId) return
    getCloudinary()
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true })
}