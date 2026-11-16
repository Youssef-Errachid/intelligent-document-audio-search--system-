import {
  CloudUpload,
  FileText,
  Headphones,
  MessageSquare,
  Search,
  Settings,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Chat', to: '/', icon: MessageSquare, end: true },
  { label: 'Search', to: '/search', icon: Search },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Audio Files', to: '/audio', icon: Headphones },
  { label: 'Upload', to: '/upload/documents', icon: CloudUpload },
  { label: 'Settings', to: '/settings', icon: Settings },
]