/*
  # Create Color History Table

  ## Overview
  Creates a table for storing user color selection history with favoriting capability.
  This enables users to quickly access their frequently used colors and maintain
  a history of recently used colors across all maps.

  ## New Tables

  ### color_history
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (uuid, foreign key): Reference to auth.users
  - `color` (text): Hex color code (e.g., #8b4513)
  - `is_favorited` (boolean): Whether color is favorited by user
  - `last_used_at` (timestamptz): Last time this color was selected
  - `created_at` (timestamptz): When color was first added to history

  ## Constraints
  - Composite unique constraint on (user_id, color) to prevent duplicate colors per user
  - Foreign key with CASCADE delete to remove colors when user is deleted

  ## Indexes
  - Index on user_id for efficient user-specific queries
  - Index on last_used_at for sorting by recency

  ## Security
  - Enable RLS on color_history table
  - Users can only access and manage their own color history
  - Policies for select, insert, update, and delete operations
*/

-- Create color_history table
CREATE TABLE IF NOT EXISTS color_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  color text NOT NULL,
  is_favorited boolean NOT NULL DEFAULT false,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_color UNIQUE (user_id, color)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_color_history_user_id ON color_history(user_id);
CREATE INDEX IF NOT EXISTS idx_color_history_last_used_at ON color_history(last_used_at);

-- Enable Row Level Security
ALTER TABLE color_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for color_history table
CREATE POLICY "Users can view own color history"
  ON color_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own color history"
  ON color_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own color history"
  ON color_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own color history"
  ON color_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);