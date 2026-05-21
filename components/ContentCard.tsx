'use client'

import { useState } from 'react'

interface ContentCardProps {
  content: {
    id: string
    platform: string
    title: string
    body: string
    status: string
    created_at: string
  }
  onDelete: () => void
}

const PLATFORM_COLORS: Record<string, string> = {
  '公众号': 'bg-green-500/20 text-green-300 border-green-500/30',
  '小红书': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Twitter': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'LinkedIn': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '知乎': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
}

export default function ContentCard({ content, onDelete }: ContentCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(content.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const platformColor = PLATFORM_COLORS[content.platform] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  const preview = content.body.length > 150 ? content.body.slice(0, 150) + '...' : content.body
  const timeAgo = getTimeAgo(content.created_at)

  return (
    <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-white line-clamp-2 flex-1 mr-2">
          {content.title || '无标题'}
        </h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${platformColor}`}>
          {content.platform}
        </span>
      </div>

      {/* Body Preview */}
      <div
        className="text-sm text-slate-400 leading-relaxed mb-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? content.body : preview}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{timeAgo}</span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
          >
            {copied ? '✓ 已复制' : '📋 复制'}
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg bg-red-900/30 text-xs text-red-400 hover:bg-red-900/50 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  if (diffHour < 24) return `${diffHour} 小时前`
  if (diffDay < 7) return `${diffDay} 天前`
  return date.toLocaleDateString('zh-CN')
}
