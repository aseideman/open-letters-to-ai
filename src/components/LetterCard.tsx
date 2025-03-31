'use client'

import { useState, useEffect } from 'react'
import { Letter, Comment } from '@/lib/types'
import { fetchComments, createComment, voteOnLetter } from '@/lib/api'

interface LetterCardProps {
  letter: Letter
}

export default function LetterCard({ letter }: LetterCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [votes, setVotes] = useState(letter.vote_count || 0)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [loading, setLoading] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)

  // Format date to a readable format
  const formattedDate = new Date(letter.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Load comment count on initial render
  useEffect(() => {
    const getCommentCount = async () => {
      try {
        const fetchedComments = await fetchComments(letter.id)
        setCommentCount(fetchedComments.length)
      } catch (error) {
        console.error('Failed to get comment count:', error)
      }
    }
    
    getCommentCount()
  }, [letter.id])

  // Load comments when expanded
  useEffect(() => {
    if (showComments && !commentsLoaded) {
      const loadComments = async () => {
        try {
          const fetchedComments = await fetchComments(letter.id)
          setComments(fetchedComments)
          setCommentCount(fetchedComments.length)
          setCommentsLoaded(true)
        } catch (error) {
          console.error('Failed to load comments:', error)
        }
      }
      
      loadComments()
    }
  }, [showComments, commentsLoaded, letter.id])

  // Handle voting
  const handleVote = async (type: 'up' | 'down') => {
    // Convert up/down to boolean
    const voteValue = type === 'up'
    
    try {
      await voteOnLetter(letter.id, voteValue)
      
      // If user already voted the same way, remove their vote
      if (userVote === type) {
        setUserVote(null)
        setVotes(type === 'up' ? votes - 1 : votes + 1)
      } 
      // If user voted the opposite way, switch their vote
      else if (userVote !== null) {
        setUserVote(type)
        setVotes(type === 'up' ? votes + 2 : votes - 2)
      } 
      // If user hasn't voted yet
      else {
        setUserVote(type)
        setVotes(type === 'up' ? votes + 1 : votes - 1)
      }
    } catch (error) {
      console.error('Failed to register vote:', error)
    }
  }

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return
    
    setLoading(true)
    
    try {
      const newComment = await createComment(letter.id, commentText)
      setComments([...comments, newComment])
      setCommentCount(prev => prev + 1)
      setCommentText('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border border-[rgba(51,51,51,0.5)] rounded-lg">
      {/* Letter content */}
      <div className="mb-4">
        <div className="text-secondary-text text-sm mb-2">
          Anonymous • {formattedDate}
        </div>
        <p className="whitespace-pre-line">{letter.content}</p>
      </div>

      {/* AI response */}
      {letter.ai_response && (
        <div className="bg-[#1e1e1e] p-3 rounded-md mb-4 border-l-[2px] border-[#9333ea]">
          <div className="text-secondary-text text-sm mb-1">AI Response:</div>
          <p>{letter.ai_response}</p>
        </div>
      )}

      {/* Vote and comment controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleVote('up')}
              className={`p-1 ${userVote === 'up' ? 'text-green-500' : 'text-secondary-text'}`}
              aria-label="Upvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            
            <span className={userVote === 'up' ? 'text-green-500' : userVote === 'down' ? 'text-red-500' : ''}>
              {votes}
            </span>
            
            <button 
              onClick={() => handleVote('down')}
              className={`p-1 ${userVote === 'down' ? 'text-red-500' : 'text-secondary-text'}`}
              aria-label="Downvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
          </div>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-secondary-text hover:text-white transition-colors flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>{commentCount} comments</span>
          </button>
        </div>
      </div>

      {/* Comment section (expandable) */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[rgba(51,51,51,0.5)]">
          {/* Comment input */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-[#1e1e1e] border border-[rgba(51,51,51,0.5)] rounded-full px-4 py-2 text-white focus:outline-none"
            />
            <button 
              onClick={handleAddComment}
              disabled={!commentText.trim() || loading}
              className={`px-4 py-2 rounded-full font-medium ${
                !commentText.trim()
                  ? 'bg-[#2d2d2d] text-[#6e767d] cursor-not-allowed'
                  : 'bg-white text-black hover:bg-opacity-90'
              }`}
            >
              {loading ? 'Sending...' : 'Comment'}
            </button>
          </div>

          {/* Comments list */}
          <div className="space-y-3">
            {!commentsLoaded && (
              <p className="text-center text-secondary-text">Loading comments...</p>
            )}
            {commentsLoaded && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className={`p-3 rounded-md ${
                  comment.is_ai 
                    ? 'bg-[#1e1e1e] border-l-[2px] border-[#9333ea]' 
                    : 'bg-[#1e1e1e] border border-[rgba(51,51,51,0.5)]'
                }`}>
                  <div className="text-secondary-text text-xs mb-1">
                    {comment.is_ai ? 'AI' : 'Anonymous'} • {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))
            ) : commentsLoaded ? (
              <p className="text-secondary-text text-center py-2">No comments yet. Be the first to comment!</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
} 