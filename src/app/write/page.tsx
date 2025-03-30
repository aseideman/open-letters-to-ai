'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLetter } from '@/lib/api'

export default function WritePage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const maxLength = 3000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || content.length > maxLength) return
    
    setLoading(true)
    setError(null)

    try {
      // Create the letter using our API
      await createLetter(content)
      
      // Redirect to home page after successful submission
      router.push('/')
    } catch (err) {
      console.error('Error creating letter:', err)
      setError('Failed to submit letter. Please try again.')
      setLoading(false)
    }
  }

  const remainingChars = maxLength - content.length
  const isOverLimit = remainingChars < 0

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Write an Open Letter to AI</h1>
      
      <div className="card p-6 mb-4">
        <p className="text-secondary-text mb-4">
          Your letter will be posted anonymously. However, remember the premise: 
          AI will probably figure out who you are anyway. Be honest, be vulnerable, 
          be thoughtful.
        </p>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dear AI..."
              className="w-full bg-secondary-bg border border-border rounded p-3 text-white h-64 resize-none"
              maxLength={maxLength}
            />
            <div className={`text-right text-sm mt-1 ${isOverLimit ? 'text-red-500' : 'text-secondary-text'}`}>
              {remainingChars} characters remaining
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-secondary-text hover:text-white"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!content.trim() || isOverLimit || loading}
              className="btn-primary"
            >
              {loading ? 'Sending...' : 'Submit Letter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
