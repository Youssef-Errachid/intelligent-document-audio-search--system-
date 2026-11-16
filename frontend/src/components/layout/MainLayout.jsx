import { Outlet, useLocation } from 'react-router-dom'
import IconRail from './IconRail'
import TopBar from './TopBar'

const pageTitles = {
  '/': 'Ask, search, discover',
  '/search': 'Search',
  '/documents': 'Documents',
  '/upload/documents': 'Extract documents',
  '/audio': 'Audio files',
  '/audio/upload': 'Upload audio',
  '/assistant': 'AI Assistant',
  '/settings': 'Settings',
  '/404': 'Page not found',
}

export default function MainLayout() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'DocuMind AI'
  const isChat = pathname === '/'

  return (
      <div className="flex h-screen flex-col gap-4 bg-gradient-to-br from-[#ececee] to-[#f7f7f8] p-4 pb-24 text-slate-900 lg:pb-4">
        <TopBar title={title} />

        <div className="flex min-h-0 flex-1 gap-4">
          <IconRail />
          <main className="min-h-0 min-w-0 flex-1">
            {isChat ? (
                <Outlet />
            ) : (

                <div className="h-full overflow-y-auto rounded-[28px] border border-black/5 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
                  <Outlet />
                </div>
            )}
          </main>
        </div>
      </div>
  )
}