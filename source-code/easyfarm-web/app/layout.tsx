import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/ui/Sidebar'
import QueryProvider from '@/components/ui/QueryProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EasyFarm — 식물 운영 관리 시스템',
  description: 'IoT 기반 식물 모니터링 및 자동 제어 어드민 시스템',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${geist.className} h-full bg-gray-50 flex`}>
        <QueryProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </QueryProvider>
      </body>
    </html>
  )
}
