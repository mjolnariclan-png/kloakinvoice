-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Allow public read reviews" ON reviews
  FOR SELECT
  USING (true);

-- Allow anyone to insert reviews
CREATE POLICY "Allow public insert reviews" ON reviews
  FOR INSERT
  WITH CHECK (true);

-- Allow admin to delete reviews
CREATE POLICY "Allow delete reviews" ON reviews
  FOR DELETE
  USING (true);
