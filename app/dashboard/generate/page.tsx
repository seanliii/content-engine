'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GenerateForm from '../../../components/GenerateForm'

const STORAGE_KEY = 'content-engine-contents'

export default function GeneratePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleGenerate(keywords: string[], platform: string) {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords, platform }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '生成失败')
      }

      setResult(data)

      // Save to localStorage
      if (data.content) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY)
          const list = saved ? JSON.parse(saved) : []
          list.unshift(data.content)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || '生成内容时出错')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">生成内容</h1>
            <p className="text-slate-400 mt-1">
              输入关键词，选择平台，AI 帮你生成内容
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 border border-slate-600 rounded-lg text-slate-300 hover:border-slate-400 hover:text-white transition-all text-sm"
          >
            ← 返回
          </button>
        </div>

        {/* Generate Form */}
        <GenerateForm onSubmit={handleGenerate} loading={loading} />

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Result */}
        {result && result.content && (
          <div className="mt-8 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {result.content.title}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {result.content.platform}
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed font-sans">
                  {result.content.body}
                </pre>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.content.body)
                  }}
                  className="px-4 py-2 bg-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  📋 复制内容
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  查看全部内容 →
                </button>
              </div>
            </div>

            {/* Sources */}
            {result.searchResults && result.searchResults.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30">
                <h3 className="text-sm font-medium text-slate-400 mb-3">参考来源</h3>
                <div className="space-y-2">
                  {result.searchResults.map((source: any, i: number) => (
                    <div key={i} className="text-sm">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {source.title}
                      </a>
                      <p className="text-slate-500 text-xs mt-0.5">{source.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
