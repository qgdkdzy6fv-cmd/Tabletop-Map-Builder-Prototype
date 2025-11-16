/*
  # Add Sub-grid Coordinates for Tiny Items

  1. Changes
    - Add `sub_x` column to map_elements (0 or 1, for 2x2 sub-grid positioning)
    - Add `sub_y` column to map_elements (0 or 1, for 2x2 sub-grid positioning)

  2. Purpose
    - Enables placement of tiny items (0.5 grid squares) within main grid squares
    - Each main grid square can contain up to 4 tiny items in a 2x2 arrangement
    - sub_x and sub_y values of 0 or 1 indicate which quadrant within the main square

  3. Notes
    - These columns are optional and only used for tiny-sized elements
    - NULL values indicate standard full-square or multi-square elements
*/

-- Add sub-grid coordinate columns to map_elements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'map_elements' AND column_name = 'sub_x'
  ) THEN
    ALTER TABLE map_elements ADD COLUMN sub_x integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'map_elements' AND column_name = 'sub_y'
  ) THEN
    ALTER TABLE map_elements ADD COLUMN sub_y integer;
  END IF;
END $$;

-- Add check constraints to ensure sub-grid coordinates are valid (0 or 1)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'map_elements_sub_x_check'
  ) THEN
    ALTER TABLE map_elements
      ADD CONSTRAINT map_elements_sub_x_check
      CHECK (sub_x IS NULL OR (sub_x >= 0 AND sub_x <= 1));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'map_elements_sub_y_check'
  ) THEN
    ALTER TABLE map_elements
      ADD CONSTRAINT map_elements_sub_y_check
      CHECK (sub_y IS NULL OR (sub_y >= 0 AND sub_y <= 1));
  END IF;
END $$;

-- Create index for efficient querying of elements in the same main grid square
CREATE INDEX IF NOT EXISTS idx_map_elements_grid_position
  ON map_elements(map_id, grid_x, grid_y);
