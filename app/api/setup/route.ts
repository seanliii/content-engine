import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const sql = `
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      keywords TEXT[] NOT NULL,
      platforms TEXT[] NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

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

    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_contents_user_id ON contents(user_id);
    CREATE INDEX IF NOT EXISTS idx_contents_project_id ON contents(project_id);
    CREATE INDEX IF NOT EXISTS idx_contents_platform ON contents(platform);
    CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);

    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

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

  try {
    const { error } = await supabase.rpc('exec_sql', { query: sql }).single()
    if (error) {
      // Try direct query approach
      const { error: e2 } = await supabase.from('projects').select('id').limit(1)
      if (!e2) {
        return NextResponse.json({ status: 'ok', message: 'Tables already exist' })
      }
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
    }
    return NextResponse.json({ status: 'ok', message: 'Database initialized successfully' })
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 })
  }
}
