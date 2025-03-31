'use client'

import { useState, useRef, useEffect } from 'react'
import { Letter } from '@/lib/types'
import { createLetter } from '@/lib/api'

interface ComposeLetterProps {
  onLetterSubmit: (letter: Letter) => void
}

export default function ComposeLetter({ onLetterSubmit }: ComposeLetterProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const maxLength = 3000
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize the textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to auto to get the right scrollHeight
      textarea.style.height = 'auto'
      // Set the height to scrollHeight to expand the textarea
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || content.length > maxLength) return
    
    setLoading(true)
    setError(null)

    try {
      // Create a new letter using our API
      const newLetter = await createLetter(content)
      onLetterSubmit(newLetter)
      setContent('')
    } catch (err) {
      console.error('Error creating letter:', err)
      setError('Failed to post letter. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const remainingChars = maxLength - content.length
  const isOverLimit = remainingChars < 0
  const isEmpty = !content.trim()

  return (
    <div className="card p-4 border border-[rgba(51,51,51,0.5)]">
      {error && (
        <div className="bg-red-900 bg-opacity-50 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your open letter to AI..."
            className="w-full bg-secondary-bg border-none rounded p-3 text-white min-h-[120px] resize-none focus:outline-none"
            maxLength={maxLength}
          />
        </div>
        
        <div className="relative mt-4">
          {/* Separator line that doesn't reach full width */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4/5 h-px bg-[rgba(51,51,51,0.5)]"></div>
          
          <div className="pt-4 flex justify-between items-center px-[10%]">
            <div className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-secondary-text'}`}>
              {remainingChars} characters remaining
            </div>
            
            <button
              type="submit"
              disabled={isEmpty || isOverLimit || loading}
              className={`px-5 py-2 rounded-full font-medium transition-colors duration-200 ${
                isEmpty
                  ? 'bg-[#2d2d2d] text-[#6e767d] cursor-not-allowed'
                  : 'bg-white text-black hover:bg-opacity-90'
              }`}
            >
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 