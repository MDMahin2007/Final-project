import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { fileURLToPath } from 'url'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
export const uploadsDirectory = path.resolve(currentDirectory, '../uploads')
const documentsDirectory = path.join(uploadsDirectory, 'documents')
const avatarsDirectory = path.join(uploadsDirectory, 'avatars')

export const ensureUploadDirectories = async () => {
    await fs.promises.mkdir(documentsDirectory, { recursive: true })
    await fs.promises.mkdir(avatarsDirectory, { recursive: true })
}

const createStorage = (directory, prefix) => multer.diskStorage({
    destination: directory,
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase()
        callback(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`)
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
    storage: createStorage(documentsDirectory, 'document'),
    fileFilter: isPdf,
    limits: { files: 6, fileSize: 5 * 1024 * 1024 },
}).array('documents', 6)

const avatarUploader = multer({
    storage: createStorage(avatarsDirectory, 'avatar'),
    fileFilter: isImage,
    limits: { files: 1, fileSize: 2 * 1024 * 1024 },
}).single('avatar')

const runUploader = (uploader) => (req, res, next) => {
    uploader(req, res, async (error) => {
        if (error) {
            const files = req.files || (req.file ? [req.file] : [])
            await Promise.all(files.map((file) => removeUploadedFile(file.path)))
            return next(error)
        }
        next()
    })
}

export const uploadDocuments = runUploader(documentUploader)
export const uploadAvatar = runUploader(avatarUploader)

export const removeUploadedFile = async (filePath) => {
    if (!filePath) return
    try {
        await fs.promises.unlink(filePath)
    } catch (error) {
        if (error.code !== 'ENOENT') throw error
    }
}

export const getUploadedFilePath = (relativeUrl) => {
    if (!relativeUrl?.startsWith('/uploads/')) return null
    return path.join(uploadsDirectory, relativeUrl.replace('/uploads/', ''))
}