/*
  # Optimize RLS Policies and Database Cleanup

  ## Summary
  This migration optimizes Row Level Security (RLS) policies for better performance
  at scale and removes unused database objects.

  ## Changes Made

  ### 1. RLS Policy Optimization
  All policies that use `auth.uid()` or `auth.<function>()` are updated to use
  `(SELECT auth.uid())` or `(SELECT auth.<function>())` instead. This prevents
  re-evaluation of the auth function for each row, significantly improving query
  performance at scale.

  **Tables Updated:**
  - `maps` - 4 policies optimized
  - `map_elements` - 4 policies optimized
  - `map_notes` - 4 policies optimized
  - `color_history` - 4 policies optimized
  - `user_preferences` - 3 policies optimized

  ### 2. Index Cleanup
  - Drop unused index `idx_map_elements_grid_position` on `map_elements` table

  ## Security Notes
  - All security restrictions remain exactly the same
  - Only performance optimization - no functional changes to access control
  - Users still can only access their own data
*/

-- Drop and recreate RLS policies for maps table with optimized auth calls
DROP POLICY IF EXISTS "Users can view own maps" ON maps;
DROP POLICY IF EXISTS "Users can create own maps" ON maps;
DROP POLICY IF EXISTS "Users can update own maps" ON maps;
DROP POLICY IF EXISTS "Users can delete own maps" ON maps;

CREATE POLICY "Users can view own maps"
  ON maps FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own maps"
  ON maps FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own maps"
  ON maps FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own maps"
  ON maps FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate RLS policies for map_elements table with optimized auth calls
DROP POLICY IF EXISTS "Users can view elements of own maps" ON map_elements;
DROP POLICY IF EXISTS "Users can create elements on own maps" ON map_elements;
DROP POLICY IF EXISTS "Users can update elements on own maps" ON map_elements;
DROP POLICY IF EXISTS "Users can delete elements on own maps" ON map_elements;

CREATE POLICY "Users can view elements of own maps"
  ON map_elements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create elements on own maps"
  ON map_elements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update elements on own maps"
  ON map_elements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete elements on own maps"
  ON map_elements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_elements.map_id
      AND maps.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate RLS policies for map_notes table with optimized auth calls
DROP POLICY IF EXISTS "Users can view own notes" ON map_notes;
DROP POLICY IF EXISTS "Users can create own notes" ON map_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON map_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON map_notes;

CREATE POLICY "Users can view own notes"
  ON map_notes FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own notes"
  ON map_notes FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own notes"
  ON map_notes FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own notes"
  ON map_notes FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate RLS policies for color_history table with optimized auth calls
DROP POLICY IF EXISTS "Users can view own color history" ON color_history;
DROP POLICY IF EXISTS "Users can create own color history" ON color_history;
DROP POLICY IF EXISTS "Users can update own color history" ON color_history;
DROP POLICY IF EXISTS "Users can delete own color history" ON color_history;

CREATE POLICY "Users can view own color history"
  ON color_history FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own color history"
  ON color_history FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own color history"
  ON color_history FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own color history"
  ON color_history FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate RLS policies for user_preferences table with optimized auth calls
DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Remove unused index
DROP INDEX IF EXISTS idx_map_elements_grid_position;
