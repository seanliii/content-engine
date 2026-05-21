# Content Engine ⚡

AI 驱动的多平台内容生成引擎。输入关键词，选择目标平台，自动搜索热点并生成适配内容。

## 功能

- 🔍 **智能搜索** — 自动搜索 DuckDuckGo 获取最新热点
- 🤖 **AI 生成** — 根据平台特性定制内容（公众号/小红书/Twitter/LinkedIn/知乎）
- 📊 **Dashboard** — 统一管理所有生成内容
- 📋 **一键复制** — 快速导出到目标平台
- 🔐 **用户系统** — Supabase Auth 邮箱登录

## 技术栈

- **前端**: Next.js 14 (App Router)
- **样式**: Tailwind CSS (暗色主题)
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **AI**: AISA API (OpenAI 兼容)
- **搜索**: DuckDuckGo HTML (服务端)
- **部署**: Vercel

## 部署到 Vercel

### 1. 设置 Supabase 数据库

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目 → SQL Editor
3. 复制 `supabase/migrations/001_initial.sql` 的内容并执行

### 2. 配置 Supabase Auth

1. 在 Supabase Dashboard → Authentication → Settings
2. 启用 Email 登录
3. 可选：关闭邮箱确认（开发阶段方便测试）

### 3. 部署到 Vercel

#### 方式一：通过 Vercel CLI

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 部署
npx vercel --prod
```

#### 方式二：通过 GitHub

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 设置环境变量（见下方）
4. 部署

### 4. 环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon/Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key（仅服务端） |
| `AISA_API_KEY` | AISA API Key |
| `AISA_BASE_URL` | `https://api.aisa.one/v1/chat/completions` |
| `AISA_MODEL` | `gpt-4.1-mini` |

### 5. 本地开发

```bash
# 克隆项目
git clone <repo-url>
cd content-engine

# 安装依赖
npm install

# 复制环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 keys

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
content-engine/
├── app/
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # Landing page
│   ├── globals.css         # 全局样式
│   ├── login/page.tsx      # 登录/注册页
│   ├── dashboard/
│   │   ├── page.tsx        # Dashboard 主页
│   │   └── generate/page.tsx  # 内容生成页
│   └── api/
│       ├── generate/route.ts   # 生成 API
│       └── contents/route.ts   # 内容 CRUD API
├── lib/
│   ├── supabase.ts         # Supabase 客户端
│   ├── ai.ts               # AI 生成逻辑
│   └── search.ts           # DuckDuckGo 搜索
├── components/
│   ├── AuthForm.tsx        # 认证表单组件
│   ├── ContentCard.tsx     # 内容卡片组件
│   └── GenerateForm.tsx    # 生成表单组件
├── supabase/
│   └── migrations/
│       └── 001_initial.sql # 数据库迁移
└── .env.local              # 环境变量（不提交）
```

## API 接口

### POST /api/generate

生成内容。

```json
{
  "keywords": ["AI", "创业"],
  "platform": "公众号",
  "projectId": "optional-uuid"
}
```

### GET /api/contents

获取内容列表。支持 `?projectId=xxx&platform=xxx&limit=50`

### DELETE /api/contents

删除内容。

```json
{
  "id": "content-uuid"
}
```

## License

MIT
