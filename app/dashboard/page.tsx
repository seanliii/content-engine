'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ContentCard from '../../components/ContentCard'

interface Content {
  id: string
  platform: string
  title: string
  body: string
  sources: any
  status: string
  created_at: string
}

const STORAGE_KEY = 'content-engine-contents'

export default function DashboardPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setContents(JSON.parse(saved))
      }
    } catch {}
    setLoading(false)
  }, [])

  function handleDelete(id: string) {
    const updated = contents.filter(c => c.id !== id)
    setContents(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">{contents.length} 篇内容</p>
          </div>
          <Link
            href="/dashboard/generate"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all text-sm"
          >
            + 生成内容
          </Link>
        </div>

        {contents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl text-slate-300 mb-2">还没有生成任何内容</h2>
            <p className="text-slate-500 mb-6">点击上方按钮开始生成你的第一篇内容</p>
            <Link
              href="/dashboard/generate"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              开始生成 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map(content => (
              <ContentCard
                key={content.id}
                content={content}
                onDelete={() => handleDelete(content.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
