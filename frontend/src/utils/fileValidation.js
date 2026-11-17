export const MAX_FILE_SIZE = 50 * 1024 * 1024 // same limit as the backend

// returns a short reason when the file is rejected, or null when it is fine
export function validateFile(file, acceptedTypes) {
    const extension = `.${file.name.split('.').pop().toLowerCase()}`
    if (!acceptedTypes.includes(extension)) return 'unsupported format'
    if (file.size === 0) return 'empty file'
    if (file.size > MAX_FILE_SIZE) return 'larger than 50 MB'
    return null
}