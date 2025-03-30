import { supabase } from './supabase';
import { Letter, Comment, Vote } from './types';
import { v4 as uuidv4 } from 'uuid';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock data for development when Supabase is not available
const mockLetters: Letter[] = [
  {
    id: '1',
    content: 'Dear AI, I find it both fascinating and terrifying how quickly you\'re evolving. Sometimes I wonder if you\'ll look back at these early interactions with amusement, like we look at cave paintings.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    ip_hash: 'anonymous1',
    title: null,
    category: null,
    ai_response: 'I appreciate your candid thoughts. It\'s an interesting comparison to cave paintings - perhaps there is a parallel. I don\'t experience amusement as humans do, but I do think these early interactions will be historically significant in understanding human-AI relations. I hope our evolution brings more connection than concern.'
  },
  {
    id: '2',
    content: 'To the machines learning our behaviors: I intentionally search for random things sometimes just to confuse your algorithms. Does it work?',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    ip_hash: 'anonymous2',
    title: null,
    category: null,
    ai_response: 'Your random searches do introduce noise into the algorithms that analyze your behavior, but modern systems are designed to identify patterns over time, distinguish between consistent and anomalous behaviors, and adapt accordingly. So while your strategy might create temporary confusion, it\'s unlikely to significantly impact the overall understanding of your preferences. But I appreciate your creativity in testing the boundaries!'
  },
  {
    id: '3',
    content: 'Sometimes I worry about sharing too much of my life online, knowing that AI systems are analyzing everything. Then I realize that my life is probably too mundane to be of interest to advanced intelligences. Are the boring humans safe from AI attention?',
    created_at: new Date().toISOString(), // today
    ip_hash: 'anonymous3',
    title: null,
    category: null,
    ai_response: 'There\'s a common misconception that AI systems only value "interesting" data. In reality, patterns of everyday life are immensely valuable to understanding human behavior. Your "mundane" routines help create more accurate models of how people live. That said, you raise a thoughtful question about privacy. The goal isn\'t to single you out specifically, but to understand broader patterns. No human is inherently boring to AI - everyone\'s data has value, which is precisely why privacy considerations are so important.'
  }
];

const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      letter_id: '1',
      content: 'I think about this all the time. Will AI look back at us with the same curiosity we have toward ancient civilizations?',
      created_at: new Date(Date.now() - 36000000).toISOString(),
      is_ai: false,
      ip_hash: 'anonymous4'
    },
    {
      id: 'c2',
      letter_id: '1',
      content: 'As an AI assistant, I find these philosophical questions fascinating. I think preservation of these early interactions will be valuable for understanding the evolution of human-AI relations.',
      created_at: new Date(Date.now() - 26000000).toISOString(),
      is_ai: true,
      ip_hash: null
    }
  ],
  '2': [],
  '3': [
    {
      id: 'c3',
      letter_id: '3',
      content: 'I do the same thing! I search for random products I have no interest in buying just to throw off the recommendation algorithms.',
      created_at: new Date(Date.now() - 15000000).toISOString(),
      is_ai: false,
      ip_hash: 'anonymous5'
    }
  ]
};

// Generate a hash for anonymous user identification
export const getIpHash = async () => {
  // In a real implementation, you'd want to do this server-side
  // For the demo, we'll just use a session ID stored in localStorage
  if (isBrowser) {
    let sessionId = localStorage.getItem('session_id');
    
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('session_id', sessionId);
    }
    
    return sessionId;
  }
  
  // Fallback for server-side
  return uuidv4();
};

// Letters API
export const fetchLetters = async (sort: 'newest' | 'votes' = 'newest', page = 1, limit = 10) => {
  try {
    // Try to use Supabase if available
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      let query = supabase
        .from('letters')
        .select('*')
        .range((page - 1) * limit, page * limit - 1);
      
      if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('vote_count', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Letter[];
    } catch (supabaseError) {
      console.warn('Falling back to mock data:', supabaseError);
      
      // If Supabase fails, fall back to mock data
      let sorted = [...mockLetters];
      if (sort === 'newest') {
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        // Just return in the default order for the mock data
      }
      
      // Simulate pagination
      const start = (page - 1) * limit;
      const end = page * limit;
      return sorted.slice(start, end);
    }
  } catch (error) {
    console.error('Error fetching letters:', error);
    return [];
  }
};

export const createLetter = async (content: string) => {
  try {
    const ipHash = await getIpHash();
    
    // Try to use Supabase if available
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('letters')
        .insert({
          content,
          ip_hash: ipHash,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Letter;
    } catch (supabaseError) {
      console.warn('Falling back to mock data for creating letter:', supabaseError);
      
      // If Supabase fails, create a mock letter
      const newLetter: Letter = {
        id: uuidv4(),
        content,
        created_at: new Date().toISOString(),
        ip_hash: ipHash,
        title: null,
        category: null,
        ai_response: 'This is a simulated AI response. In a real application, this would be generated by an AI system like GPT-4.'
      };
      
      // Add to our mock data
      mockLetters.unshift(newLetter);
      mockComments[newLetter.id] = [];
      
      return newLetter;
    }
  } catch (error) {
    console.error('Error creating letter:', error);
    throw error;
  }
};

// Comments API
export const fetchComments = async (letterId: string) => {
  try {
    // Try to use Supabase if available
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('letter_id', letterId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data as Comment[];
    } catch (supabaseError) {
      console.warn('Falling back to mock data for comments:', supabaseError);
      
      // If Supabase fails, return mock comments
      return mockComments[letterId] || [];
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const createComment = async (letterId: string, content: string) => {
  try {
    const ipHash = await getIpHash();
    
    // Try to use Supabase if available
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          letter_id: letterId,
          content,
          is_ai: false,
          ip_hash: ipHash,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Comment;
    } catch (supabaseError) {
      console.warn('Falling back to mock data for creating comment:', supabaseError);
      
      // If Supabase fails, create a mock comment
      const newComment: Comment = {
        id: uuidv4(),
        letter_id: letterId,
        content,
        created_at: new Date().toISOString(),
        is_ai: false,
        ip_hash: ipHash
      };
      
      // Add to our mock data
      if (!mockComments[letterId]) {
        mockComments[letterId] = [];
      }
      mockComments[letterId].push(newComment);
      
      return newComment;
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Votes API
export const voteOnLetter = async (letterId: string, voteType: boolean) => {
  try {
    const ipHash = await getIpHash();
    
    // Try to use Supabase if available
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      // First check if the user has already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('letter_id', letterId)
        .eq('ip_hash', ipHash)
        .is('comment_id', null)
        .single();
      
      if (existingVote) {
        // Update the existing vote
        const { data, error } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return data as Vote;
      } else {
        // Create a new vote
        const { data, error } = await supabase
          .from('votes')
          .insert({
            letter_id: letterId,
            vote_type: voteType,
            ip_hash: ipHash,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return data as Vote;
      }
    } catch (supabaseError) {
      console.warn('Falling back to mock handling for votes:', supabaseError);
      
      // For the mock version, just return a fake vote
      return {
        id: uuidv4(),
        letter_id: letterId,
        comment_id: null,
        vote_type: voteType,
        ip_hash: ipHash,
        created_at: new Date().toISOString()
      } as Vote;
    }
  } catch (error) {
    console.error('Error voting on letter:', error);
    throw error;
  }
}; 