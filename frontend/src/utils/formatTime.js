export default function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const rest = Math.floor(seconds % 60)
    return `${minutes}:${String(rest).padStart(2, '0')}`
}