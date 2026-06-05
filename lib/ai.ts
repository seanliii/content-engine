/**
 * AI content generation using GLM API (ZhipuAI)
 * Fallback: any OpenAI-compatible API
 */

import { SearchResult } from './search'

interface GenerateContentParams {
  keywords: string[]
  platform: string
  searchResults: SearchResult[]
}

interface GenerateContentResult {
  title: string
  body: string
}

const PLATFORM_PROMPTS: Record<string, string> = {
  '公众号': `你是一个专业的微信公众号内容创作者。请生成一篇适合公众号的文章：
- 标题要吸引眼球，适合在朋友圈传播
- 正文使用中文，语言流畅易读
- 段落清晰，适当使用 emoji 和小标题
- 字数 800-1500 字
- 结尾可加引导关注/转发的话术`,

  '小红书': `你是一个小红书爆款笔记创作者。请生成一篇小红书笔记：
- 标题要有吸引力，包含 emoji，适合小红书风格
- 正文轻松活泼，适当使用 emoji 和换行
- 加入适当的话题标签 #xxx#
- 字数 300-800 字
- 带有个人体验感和种草感`,

  'Twitter': `You are a Twitter/X content creator. Generate a tweet thread:
- First tweet should be a strong hook
- Use short, punchy sentences
- Include relevant hashtags
- 3-5 tweets in the thread
- Each tweet under 280 characters
- Engaging and shareable`,

  'LinkedIn': `You are a LinkedIn thought leadership content creator. Generate a post:
- Professional but personable tone
- Start with a hook/insight
- Share actionable value
- Use line breaks for readability
- 500-1000 words
- End with a question or call to discussion`,

  '知乎': `你是一个知乎高赞回答创作者。请生成一篇知乎风格的回答：
- 开头直击要点，不绕弯
- 逻辑清晰，有理有据
- 适当引用数据或案例
- 段落分明，重点加粗
- 字数 800-2000 字
- 专业但不晦涩`,
}

export async function generateContent({
  keywords,
  platform,
  searchResults,
}: GenerateContentParams): Promise<GenerateContentResult> {
  const platformPrompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS['公众号']

  const searchContext = searchResults.length > 0
    ? `\n\n以下是关于这个主题的最新热点信息：\n${searchResults.map((r, i) => `${i + 1}. ${r.title}: ${r.snippet}`).join('\n')}`
    : ''

  const userMessage = `主题关键词：${keywords.join('、')}${searchContext}\n\n请基于以上信息，生成一篇高质量的内容。请用 JSON 格式返回，包含 title 和 body 两个字段。`

  // Try GLM API first (available in sandbox)
  const glmApiKey = process.env.GLM_API_KEY || '1d79aecd1d2349eca01c04b39cd37c08.4GHNgZ2F5Cw13PBW'
  const glmBaseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

  try {
    const response = await fetch(glmBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${glmApiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: platformPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GLM API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content returned from GLM API')
    }

    // Try to extract JSON from content
    try {
      // Try direct JSON parse
      const parsed = JSON.parse(content)
      return {
        title: parsed.title || `${keywords[0]} - ${platform}`,
        body: parsed.body || content,
      }
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1])
          return {
            title: parsed.title || `${keywords[0]} - ${platform}`,
            body: parsed.body || content,
          }
        } catch {}
      }
      // Use raw content as body
      return {
        title: `${keywords[0]} - ${platform}内容`,
        body: content,
      }
    }
  } catch (glmError) {
    console.warn('GLM API failed, trying AISA fallback:', glmError)
    
    // Fallback to AISA API
    const response = await fetch(process.env.AISA_BASE_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AISA_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AISA_MODEL || 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: platformPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content returned from AI')
    }

    try {
      const parsed = JSON.parse(content)
      return {
        title: parsed.title || `${keywords[0]} - ${platform}`,
        body: parsed.body || content,
      }
    } catch {
      return {
        title: `${keywords[0]} - ${platform}`,
        body: content,
      }
    }
  }
}
