'use client'

import { useState, useEffect } from 'react'
import { Letter } from '@/lib/types'
import LetterCard from '@/components/LetterCard'
import ComposeLetter from '@/components/ComposeLetter'
import { fetchLetters } from '@/lib/api'

export default function Home() {
  const [sortBy, setSortBy] = useState<'newest' | 'votes'>('newest')
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch letters on initial load and when sort changes
  useEffect(() => {
    const loadLetters = async () => {
      setLoading(true)
      try {
        const fetchedLetters = await fetchLetters(sortBy, 1)
        setLetters(fetchedLetters)
        setHasMore(fetchedLetters.length === 10) // Assuming 10 is our page size
        setPage(1)
      } catch (error) {
        console.error('Failed to fetch letters', error)
      } finally {
        setLoading(false)
      }
    }

    loadLetters()
  }, [sortBy])

  // Load more letters
  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const nextPage = page + 1
      const moreLetters = await fetchLetters(sortBy, nextPage)
      
      if (moreLetters.length === 0) {
        setHasMore(false)
      } else {
        setLetters([...letters, ...moreLetters])
        setPage(nextPage)
        setHasMore(moreLetters.length === 10) // Assuming 10 is our page size
      }
    } catch (error) {
      console.error('Failed to load more letters', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle new letter submission
  const handleLetterSubmit = (letter: Letter) => {
    setLetters([letter, ...letters])
  }

  return (
    <div className="space-y-6">
      {/* Banner explaining the concept */}
      <div className="py-2">
        <h2 className="text-xl font-semibold mb-2">Open Letters to AI</h2>
        <p className="text-secondary-text">
          Write anonymous open letters to artificial intelligence systems, with the existential 
          understanding that AI will probably figure out who you are anyway. Share your thoughts, 
          fears, hopes, and questions about our AI future.
        </p>
      </div>

      {/* Letter composition area */}
      <ComposeLetter onLetterSubmit={handleLetterSubmit} />

      {/* Sorting options */}
      <div className="flex justify-end text-sm">
        <span className="text-secondary-text mr-2">Sort by:</span>
        <button 
          onClick={() => setSortBy('newest')}
          className={`mr-4 ${sortBy === 'newest' ? 'text-white border-b border-white' : 'text-secondary-text hover:text-white'}`}
        >
          Newest
        </button>
        <button 
          onClick={() => setSortBy('votes')}
          className={`${sortBy === 'votes' ? 'text-white border-b border-white' : 'text-secondary-text hover:text-white'}`}
        >
          Top rated
        </button>
      </div>

      {/* Letter feed */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="card p-6 text-center border border-[#333333] border-opacity-50">
            <p className="text-secondary-text">Loading letters...</p>
          </div>
        ) : letters.length > 0 ? (
          letters.map((letter) => (
            <LetterCard key={letter.id} letter={letter} />
          ))
        ) : (
          <div className="card p-6 text-center border border-[#333333] border-opacity-50">
            <p className="text-secondary-text">No letters yet. Be the first to write one!</p>
          </div>
        )}
      </div>

      {/* Load more button */}
      {letters.length > 0 && hasMore && (
        <div className="text-center mt-6">
          <button 
            onClick={loadMore} 
            className="px-4 py-2 rounded-full border border-[#333333] text-secondary-text hover:text-white transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load more letters'}
          </button>
        </div>
      )}
    </div>
  )
}