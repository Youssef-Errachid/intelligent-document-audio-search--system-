import {
  AudioLines,
  Bot,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Search', to: '/search', icon: Search },
  { label: 'Audio Files', to: '/audio', icon: AudioLines },
  { label: 'AI Assistant', to: '/assistant', icon: Bot },
  { label: 'Settings', to: '/settings', icon: Settings },
]
