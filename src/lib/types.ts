export type Letter = {
    id: string
    created_at: string
    content: string
    title: string | null
    category: string | null
    ip_hash: string
    ai_response?: string
    vote_count?: number
  }
  
  export type Comment = {
    id: string
    created_at: string
    letter_id: string
    content: string
    is_ai: boolean
    ip_hash: string | null
  }
  
  export type Vote = {
    id: string
    letter_id: string
    comment_id: string | null
    vote_type: boolean
    ip_hash: string
    created_at: string
  }