import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ status: 'error', error: 'Missing env vars' }, { status: 500 })
  }

  // Use Supabase Management API to run SQL
  // Extract project ref from URL: https://{ref}.supabase.co
  const refMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!refMatch) {
    return NextResponse.json({ status: 'error', error: 'Cannot parse project ref' }, { status: 500 })
  }
  const ref = refMatch[1]

  const sql = `
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  platforms TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create contents table
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  sources JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_contents_user_id ON contents(user_id);
CREATE INDEX IF NOT EXISTS idx_contents_project_id ON contents(project_id);
CREATE INDEX IF NOT EXISTS idx_contents_platform ON contents(platform);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Policies (ignore errors if already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='Users can manage own projects') THEN
    CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contents' AND policyname='Users can manage own contents') THEN
    CREATE POLICY "Users can manage own contents" ON contents FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='Users can insert own projects') THEN
    CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contents' AND policyname='Users can insert own contents') THEN
    CREATE POLICY "Users can insert own contents" ON contents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
`

  // Try Supabase Management API
  const mgmtToken = process.env.SUPABASE_MANAGEMENT_TOKEN
  if (mgmtToken) {
    try {
      const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mgmtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      })
      const data = await res.json()
      if (res.ok) {
        return NextResponse.json({ status: 'ok', message: 'Tables created via Management API', data })
      }
      // Fall through to next method
    } catch (e) {
      // Fall through
    }
  }

  // Fallback: check if tables already exist via REST API
  try {
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/contents?limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    })
    if (checkRes.ok) {
      return NextResponse.json({ status: 'ok', message: 'Tables already exist' })
    }
    const errBody = await checkRes.json()
    // Table doesn't exist
    return NextResponse.json({
      status: 'needs_setup',
      message: 'Tables do not exist. Please run the SQL migration in Supabase Dashboard > SQL Editor.',
      sql_to_run: sql,
      supabase_dashboard: `https://supabase.com/dashboard/project/${ref}/editor`,
      error: errBody,
    }, { status: 503 })
  } catch (e: any) {
    return NextResponse.json({ status: 'error', error: e.message }, { status: 500 })
  }
}
