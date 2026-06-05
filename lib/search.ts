/**
 * Search implementation using catclaw-search (baidu engine)
 * Fallback: DuckDuckGo HTML search
 */

export interface SearchResult {
  title: string
  url: string
  snippet: string
}

export async function searchDuckDuckGo(query: string, maxResults = 5): Promise<SearchResult[]> {
  // Try catclaw-search via baidu first (available in sandbox)
  try {
    const results = await searchViaCatclaw(query, maxResults)
    if (results.length > 0) return results
  } catch (err) {
    console.warn('Catclaw search failed, trying DuckDuckGo:', err)
  }

  // Fallback: DuckDuckGo HTML
  const encodedQuery = encodeURIComponent(query)
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (!response.ok) {
      console.error(`DuckDuckGo search failed: ${response.status}`)
      return []
    }

    const html = await response.text()
    return parseResults(html, maxResults)
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

async function searchViaCatclaw(query: string, maxResults: number): Promise<SearchResult[]> {
  // Call catclaw search via local subprocess or HTTP
  // Since this runs server-side in Next.js, we use child_process
  const { execSync } = require('child_process')
  
  const output = execSync(
    `python3 /app/skills/catclaw-search/scripts/catclaw_search.py search "${query.replace(/"/g, '\\"')}" -s baidu-search-v2`,
    { timeout: 10000, encoding: 'utf8' }
  )
  
  const data = JSON.parse(output)
  const items = data.results || []
  
  return items.slice(0, maxResults).map((item: any) => ({
    title: item.title || '',
    url: item.url || '',
    snippet: item.snippet || item.content?.slice(0, 200) || '',
  }))
}

function parseResults(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = []

  const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>(.*?)<\/a>/g

  let match
  while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
    const url = decodeURIComponent(match[1].replace(/.*uddg=/, '').replace(/&.*/, ''))
    const title = match[2].replace(/<[^>]*>/g, '').trim()
    const snippet = match[3].replace(/<[^>]*>/g, '').trim()

    if (title && url) {
      results.push({ title, url, snippet })
    }
  }

  if (results.length === 0) {
    const simpleRegex = /<a[^>]*class="result__a"[^>]*>(.*?)<\/a>/g
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>(.*?)<\/a>/g

    const titles: string[] = []
    const snippets: string[] = []

    let m
    while ((m = simpleRegex.exec(html)) !== null) {
      titles.push(m[1].replace(/<[^>]*>/g, '').trim())
    }
    while ((m = snippetRegex.exec(html)) !== null) {
      snippets.push(m[1].replace(/<[^>]*>/g, '').trim())
    }

    for (let i = 0; i < Math.min(titles.length, maxResults); i++) {
      results.push({
        title: titles[i],
        url: '',
        snippet: snippets[i] || '',
      })
    }
  }

  return results
}
