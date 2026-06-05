import { NextRequest, NextResponse } from 'next/server'
import { searchDuckDuckGo } from '../../../lib/search'
import { generateContent } from '../../../lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keywords, platform } = body

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 })
    }
    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 })
    }

    // Search for trending content
    const searchQuery = keywords.join(' ') + ` ${platform} 最新 热点`
    const searchResults = await searchDuckDuckGo(searchQuery)

    // Generate content with AI
    const { title, body: contentBody } = await generateContent({
      keywords,
      platform,
      searchResults,
    })

    return NextResponse.json({
      success: true,
      content: {
        id: `local-${Date.now()}`,
        platform,
        title,
        body: contentBody,
        sources: searchResults,
        status: 'draft',
        created_at: new Date().toISOString(),
      },
      searchResults,
      dbSaved: false,
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
