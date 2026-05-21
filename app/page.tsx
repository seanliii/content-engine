import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="text-6xl">⚡</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Content Engine
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-4">
          AI 驱动的多平台内容生成引擎
        </p>
        <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
          输入关键词，选择目标平台，AI 自动搜索热点并生成适配内容。
          支持公众号、小红书、Twitter、LinkedIn、知乎。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            开始使用 →
          </Link>
          <a
            href="https://github.com/seanliii/content-engine"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-slate-600 rounded-xl text-slate-300 font-semibold text-lg hover:border-slate-400 hover:text-white transition-all"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
        <FeatureCard
          icon="🔍"
          title="智能热点搜索"
          description="自动搜索 DuckDuckGo 获取最新热点资讯，让内容紧跟趋势"
        />
        <FeatureCard
          icon="🤖"
          title="AI 内容生成"
          description="根据平台特性定制内容风格，一键生成适配不同平台的高质量内容"
        />
        <FeatureCard
          icon="📊"
          title="项目管理"
          description="按主题创建项目，统一管理所有生成的内容，一键复制导出"
        />
      </div>

      {/* Footer */}
      <footer className="mt-24 pb-8 text-center text-slate-500 text-sm">
        Built with Next.js + Supabase + AI
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}
