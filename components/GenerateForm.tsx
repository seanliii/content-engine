'use client'

import { useState } from 'react'

const PLATFORMS = [
  { id: '公众号', label: '公众号', icon: '📱' },
  { id: '小红书', label: '小红书', icon: '📕' },
  { id: 'Twitter', label: 'Twitter/X', icon: '🐦' },
  { id: 'LinkedIn', label: 'LinkedIn', icon: '💼' },
  { id: '知乎', label: '知乎', icon: '💡' },
]

interface GenerateFormProps {
  onSubmit: (keywords: string[], platform: string) => void
  loading: boolean
}

export default function GenerateForm({ onSubmit, loading }: GenerateFormProps) {
  const [keywordsInput, setKeywordsInput] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const keywords = keywordsInput
      .split(/[,，、\s]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0)

    if (keywords.length === 0 || !selectedPlatform) return
    onSubmit(keywords, selectedPlatform)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Keywords Input */}
      <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          主题关键词
        </label>
        <input
          type="text"
          value={keywordsInput}
          onChange={(e) => setKeywordsInput(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入关键词，用逗号或空格分隔（如：AI 创业, SaaS, 2024趋势）"
          required
        />
        <p className="mt-2 text-xs text-slate-500">
          多个关键词可以用逗号、顿号或空格分隔
        </p>
      </div>

      {/* Platform Selection */}
      <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          目标平台
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              type="button"
              onClick={() => setSelectedPlatform(platform.id)}
              className={`p-4 rounded-xl border text-center transition-all ${
                selectedPlatform === platform.id
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-slate-600 bg-slate-900/30 text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="text-2xl mb-1">{platform.icon}</div>
              <div className="text-xs font-medium">{platform.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !keywordsInput.trim() || !selectedPlatform}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            正在搜索热点并生成内容...
          </>
        ) : (
          '⚡ 生成内容'
        )}
      </button>
    </form>
  )
}
