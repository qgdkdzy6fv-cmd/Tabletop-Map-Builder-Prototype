/*
  # Map Builder Application Schema

  ## Overview
  Creates tables for storing tabletop RPG map data including:
  - Maps with grid configurations
  - Shape placements on maps
  - Text/character markers
  - Rich text notes associated with maps

  ## Tables

  ### maps
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (uuid): Reference to auth.users
  - `name` (text): Map name
  - `grid_width` (integer): Number of columns
  - `grid_height` (integer): Number of rows
  - `cell_size` (integer): Pixel size of each cell
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### map_elements
  - `id` (uuid, primary key): Unique identifier
  - `map_id` (uuid): Reference to maps table
  - `element_type` (text): Type of element (shape, text)
  - `grid_x` (integer): X coordinate on grid
  - `grid_y` (integer): Y coordinate on grid
  - `shape_type` (text): Shape identifier (wall, door, furniture, etc.)
  - `text_content` (text): Text content for character markers
  - `color` (text): Hex color code
  - `width` (integer): Width in grid cells
  - `height` (integer): Height in grid cells
  - `created_at` (timestamptz): Creation timestamp

  ### map_notes
  - `id` (uuid, primary key): Unique identifier
  - `map_id` (uuid): Optional reference to maps table
  - `user_id` (uuid): Reference to auth.users
  - `name` (text): Note name
  - `content` (jsonb): Rich text content with formatting
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own maps, elements, and notes
  - Policies for select, insert, update, and delete operations
*/

-- Create maps table
CREATE TABLE IF NOT EXISTS maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  grid_width integer NOT NULL DEFAULT 20,
  grid_height integer NOT NULL DEFAULT 20,
  cell_size integer NOT NULL DEFAULT 40,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create map_elements table
CREATE TABLE IF NOT EXISTS map_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  element_type text NOT NULL,
  grid_x integer NOT NULL,
  grid_y integer NOT NULL,
  shape_type text,
  text_content text,
  color text NOT NULL DEFAULT '#000000',
  width integer NOT NULL DEFAULT 1,
  height integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create map_notes table
CREATE TABLE IF NOT EXISTS map_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid REFERENCES maps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maps_user_id ON maps(user_id);
CREATE INDEX IF NOT EXISTS idx_map_elements_map_id ON map_elements(map_id);
CREATE INDEX IF NOT EXISTS idx_map_notes_user_id ON map_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_map_notes_map_id ON map_notes(map_id);

-- Enable Row Level Security
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maps table
CREATE POLICY "Users can view own maps"
  ON maps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own maps"
  ON maps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own maps"
  ON maps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own maps"
  ON maps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for map_elements table
CREATE POLICY "Users can view elements of own maps"
  ON map_elements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create elements on own maps"
  ON map_elements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update elements on own maps"
  ON map_elements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete elements on own maps"
  ON map_elements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = auth.uid()
    )
  );

-- RLS Policies for map_notes table
CREATE POLICY "Users can view own notes"
  ON map_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON map_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON map_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON map_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);