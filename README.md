# Open Letters to AI

A web application where users can anonymously write open letters to AI systems with the cheeky premise that "AI will eventually figure out who you are anyway." Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- Dark mode theme for better reading experience
- Single-page feed layout similar to Twitter/X
- Anonymous letter writing (based on IP hash for tracking votes/comments)
- Automatic AI response generation
- Upvote/downvote system for letters and comments
- Expandable comments section
- Mobile responsive design
- No authentication required

## Getting Started

### Prerequisites

- Node.js (v18.18.0 or newer recommended)
- npm or yarn
- Supabase account

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/open-letters-to-ai.git
   cd open-letters-to-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Supabase project and set up the database:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Use the SQL scripts below to create the required tables

4. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Run the following SQL in your Supabase SQL editor to create the necessary tables:

```sql
-- Create letters table
CREATE TABLE letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  title TEXT,
  category TEXT,
  ip_hash TEXT NOT NULL,
  ai_response TEXT,
  vote_count INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  ip_hash TEXT
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  letter_id UUID REFERENCES letters(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  vote_type BOOLEAN NOT NULL, -- true = upvote, false = downvote
  ip_hash TEXT NOT NULL,
  CONSTRAINT one_vote_per_letter UNIQUE (letter_id, ip_hash),
  CONSTRAINT one_vote_per_comment UNIQUE (comment_id, ip_hash),
  CONSTRAINT either_letter_or_comment CHECK (
    (letter_id IS NOT NULL AND comment_id IS NULL) OR
    (letter_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Create function to update letter vote count
CREATE OR REPLACE FUNCTION update_letter_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- If a vote is deleted
    UPDATE letters
    SET vote_count = (
      SELECT COALESCE(SUM(CASE WHEN vote_type THEN 1 ELSE -1 END), 0)
      FROM votes
      WHERE letter_id = OLD.letter_id
    )
    WHERE id = OLD.letter_id;
    RETURN OLD;
  ELSE
    -- If a vote is inserted or updated
    UPDATE letters
    SET vote_count = (
      SELECT COALESCE(SUM(CASE WHEN vote_type THEN 1 ELSE -1 END), 0)
      FROM votes
      WHERE letter_id = NEW.letter_id
    )
    WHERE id = NEW.letter_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update letter vote count
CREATE TRIGGER update_letter_vote_count
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
WHEN (NEW.letter_id IS NOT NULL OR OLD.letter_id IS NOT NULL)
EXECUTE FUNCTION update_letter_vote_count();

-- Create policy for public access
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Public can read letters" ON letters
  FOR SELECT USING (true);

CREATE POLICY "Public can insert letters" ON letters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Public can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Public can insert votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update own votes" ON votes
  FOR UPDATE USING (ip_hash = current_setting('request.jwt.claims')::json->>'ip_hash');

CREATE POLICY "Public can delete own votes" ON votes
  FOR DELETE USING (ip_hash = current_setting('request.jwt.claims')::json->>'ip_hash');
```

## AI Response Generation

For this demo, AI responses are simulated. In a production environment, you'd want to:

1. Create a serverless function that gets triggered when a new letter is added
2. Use an AI service like OpenAI's API to generate a response
3. Update the letter with the AI response

## Deployment

The project can be deployed to Vercel with a few clicks:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/open-letters-to-ai)

Don't forget to add your environment variables to the Vercel project settings.

## License

This project is licensed under the MIT License.
