import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const RULES: { tag: string; keywords: string[] }[] = [
  { tag: 'AI',             keywords: ['ai', 'ml', 'machine learning', 'gpt', 'llm', 'model', 'intelligence', 'neural', 'predict', 'classifier', 'nlp', 'chatbot'] },
  { tag: 'EdTech',         keywords: ['learn', 'education', 'study', 'course', 'teach', 'quiz', 'tutor', 'school', 'student', 'dictionary', 'translat'] },
  { tag: 'Fintech',        keywords: ['pay', 'finance', 'money', 'wallet', 'bank', 'invest', 'crypto', 'transaction', 'fund', 'budget', 'sharia', 'halal'] },
  { tag: 'Web3',           keywords: ['web3', 'blockchain', 'dao', 'nft', 'defi', 'decentrali', 'smart contract', 'wallet', 'token', 'ethereum', 'solana'] },
  { tag: 'Community',      keywords: ['community', 'sangat', 'connect', 'network', 'forum', 'social', 'volunteer', 'seva', 'panth', 'sikh'] },
  { tag: 'Music',          keywords: ['music', 'audio', 'kirtan', 'gurbani', 'sound', 'song', 'track', 'scraper', 'stream', 'playlist'] },
  { tag: 'Faith',          keywords: ['gurbani', 'sikh', 'kirtan', 'ardas', 'prayer', 'hukamnama', 'waheguru', 'gurmat', 'spiritual'] },
  { tag: 'Tools',          keywords: ['tool', 'util', 'scraper', 'api', 'cli', 'dashboard', 'automation', 'workflow', 'generator', 'tracker'] },
  { tag: 'Health',         keywords: ['health', 'fitness', 'medical', 'mental', 'wellness', 'doctor', 'patient', 'care'] },
  { tag: 'Infrastructure', keywords: ['infrastructure', 'platform', 'sdk', 'framework', 'database', 'server', 'cloud', 'devops', 'deploy'] },
  { tag: 'Media',          keywords: ['media', 'video', 'podcast', 'news', 'content', 'blog', 'article', 'broadcast'] },
  { tag: 'Productivity',   keywords: ['productivity', 'task', 'calendar', 'schedule', 'note', 'reminder', 'organiz', 'planner'] },
  { tag: 'Open Source',    keywords: ['open source', 'opensource', 'github', 'contribute', 'library', 'package'] },
]

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description } = await req.json()
  if (!name) return NextResponse.json({ tags: [] })

  const text = `${name} ${description ?? ''}`.toLowerCase()
  const matched: string[] = []

  for (const rule of RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      matched.push(rule.tag)
      if (matched.length === 2) break
    }
  }

  return NextResponse.json({ tags: matched })
}
