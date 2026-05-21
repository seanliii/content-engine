import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Content Engine - AI 内容自动化',
  description: '基于 AI 的多平台内容生成引擎',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
