import { v2 as cloudinary } from 'cloudinary'

// Cloudinary auto-configures itself from the CLOUDINARY_URL env var.
// When it's not set, uploads fall back to local disk (dev mode).
export const cloudinaryEnabled = Boolean(process.env.CLOUDINARY_URL)

// Uploads an in-memory file buffer; resolves to { url, publicId }
export function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'ljlist/products',
        resource_type: 'image',
        public_id: filename.replace(/\.[^.]+$/, ''), // drop extension
      },
      (err, result) => {
        if (err) return reject(err)
        resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )
    stream.end(buffer)
  })
}

// Best-effort delete — never throws (a missing remote image shouldn't block the request)
export async function deleteFromCloudinary(publicId) {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message)
  }
}