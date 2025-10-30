-- ============================================
-- SOLPILOT Database Schema for Supabase
-- ============================================
-- This schema supports Solana wallet-based authentication
-- and AI chat functionality with multiple agents

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores user accounts (wallet addresses)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  is_whitelisted BOOLEAN DEFAULT false,
  nonce TEXT,
  referral_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_whitelisted ON public.users(is_whitelisted);

-- ============================================
-- 2. CHATS TABLE
-- ============================================
-- Stores chat sessions between users and AI agents
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ai_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for fast chat lookups
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_ai_id ON public.chats(ai_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at DESC);

-- ============================================
-- 3. MESSAGES TABLE
-- ============================================
-- Stores individual messages within chats
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for fast message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================
-- 4. AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
-- Function to automatically update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGERS FOR AUTO-UPDATE
-- ============================================
-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chats table
DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users: Allow public read/write for authentication flow
CREATE POLICY "Allow public access to users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Chats: Users can see their own chats
CREATE POLICY "Users can view their own chats" ON public.chats
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = ai_id::text);

CREATE POLICY "Users can create chats" ON public.chats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own chats" ON public.chats
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own chats" ON public.chats
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Messages: Users can see messages from their chats
CREATE POLICY "Users can view messages from their chats" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND (auth.uid()::text = chats.user_id::text OR auth.uid()::text = chats.ai_id::text)
    )
  );

CREATE POLICY "Users can create messages" ON public.messages
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. INITIAL DATA - SYSTEM AI USER
-- ============================================
-- Create the system AI user for chat responses
INSERT INTO public.users (wallet_address, is_whitelisted)
VALUES ('SYSTEM_AI_ADDRESS', true)
ON CONFLICT (wallet_address) DO NOTHING;

-- ============================================
-- 8. HELPFUL VIEWS (Optional)
-- ============================================
-- View for recent chats with message count
CREATE OR REPLACE VIEW public.chat_overview AS
SELECT 
  c.id,
  c.title,
  c.created_at,
  c.updated_at,
  u.wallet_address as user_wallet,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM public.chats c
JOIN public.users u ON c.user_id = u.id
LEFT JOIN public.messages m ON c.id = m.chat_id
GROUP BY c.id, c.title, c.created_at, c.updated_at, u.wallet_address;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('users', 'chats', 'messages');

-- Check if system user exists
-- SELECT * FROM public.users WHERE wallet_address = 'SYSTEM_AI_ADDRESS';

-- Count records
-- SELECT 
--   (SELECT COUNT(*) FROM public.users) as users_count,
--   (SELECT COUNT(*) FROM public.chats) as chats_count,
--   (SELECT COUNT(*) FROM public.messages) as messages_count;
