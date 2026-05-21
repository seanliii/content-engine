import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient, createServerClient } from '../../../lib/supabase'
import { searchDuckDuckGo } from '../../../lib/search'
import { generateContent } from '../../../lib/ai'

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createAuthClient(token)

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { keywords, platform, projectId } = body

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 })
    }

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 })
    }

    // Step 1: Search for trending content
    const searchQuery = keywords.join(' ') + ` ${platform} 最新 热点`
    const searchResults = await searchDuckDuckGo(searchQuery)

    // Step 2: Generate content with AI
    const { title, body: contentBody } = await generateContent({
      keywords,
      platform,
      searchResults,
    })

    // Step 3: Save to database
    const serverSupabase = createServerClient()
    const { data: content, error: insertError } = await serverSupabase
      .from('contents')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        platform,
        title,
        body: contentBody,
        sources: searchResults,
        status: 'draft',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      content,
      searchResults,
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
