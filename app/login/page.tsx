'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-slate-400 text-lg">正在进入...</div>
    </main>
  )
}
