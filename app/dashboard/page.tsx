'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
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

export default function DashboardPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setUser(session.user)
    fetchContents(session.access_token)
  }

  async function fetchContents(token: string) {
    try {
      const res = await fetch('/api/contents', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.contents) {
        setContents(data.contents)
      }
    } catch (err) {
      console.error('Failed to fetch contents:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      await fetch('/api/contents', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      setContents(contents.filter(c => c.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
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
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              {user?.email} · {contents.length} 篇内容
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/generate"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all text-sm"
            >
              + 生成内容
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 border border-slate-600 rounded-lg text-slate-300 hover:border-slate-400 hover:text-white transition-all text-sm"
            >
              退出
            </button>
          </div>
        </div>

        {/* Content Grid */}
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
