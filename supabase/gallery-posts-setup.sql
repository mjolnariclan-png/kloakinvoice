-- ============================================
-- GALLERY POSTS TABLE SETUP
-- ============================================
-- Run this in your Supabase SQL Editor

-- Create gallery_posts table
CREATE TABLE IF NOT EXISTS public.gallery_posts (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.gallery_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read (for gallery display)
CREATE POLICY "Allow public read" ON public.gallery_posts
  FOR SELECT
  USING (true);

-- Create policy to allow anon insert (for admin inserts via app)
CREATE POLICY "Allow insert" ON public.gallery_posts
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow delete via authenticated/admin
CREATE POLICY "Allow delete" ON public.gallery_posts
  FOR DELETE
  USING (true);

-- Create index on order_id for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_posts_order_id ON public.gallery_posts(order_id);
CREATE INDEX IF NOT EXISTS idx_gallery_posts_created_at ON public.gallery_posts(created_at DESC);
