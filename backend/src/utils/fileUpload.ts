import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const uploadDir = 'D:/图片'

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase()
        cb(null, `${uuidv4()}${ext || '.jpg'}`)
    },
})

export const uploadAvatar = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb: any) => {
        const ok = /^(image\/jpeg|image\/jpg|image\/png|image\/webp|image\/gif)$/.test(file.mimetype)
        if (!ok) return cb(new Error('仅支持上传图片格式：jpg/png/webp/gif'), false)
        return cb(null, true)
    },
}).fields([{ name: 'avatar', maxCount: 1 }])

