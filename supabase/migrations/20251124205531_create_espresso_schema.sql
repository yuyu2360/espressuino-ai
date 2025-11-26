/*
  # Espresso Machine Dashboard Schema

  1. New Tables
    - `profiles` - User profiles and guest accounts
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `account_type` (text: 'user' or 'guest')
      - `user_id` (uuid, foreign key to auth.users, nullable for guest)
      - `created_at` (timestamp)

    - `brewing_profiles` - Saved brewing configurations
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `target_temperature` (integer, celsius)
      - `goal_pressure` (numeric, bars)
      - `pre_infusion_time` (integer, seconds)
      - `brewing_time_target` (integer, seconds)
      - `coffee_input_amount` (numeric, grams)
      - `target_output_amount` (numeric, grams/ml)
      - `is_default` (boolean)
      - `created_at` (timestamp)

    - `shot_history` - Historical brewing sessions
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `brewing_profile_id` (uuid, foreign key to brewing_profiles, nullable)
      - `coffee_input_amount` (numeric, grams)
      - `target_output_amount` (numeric, grams/ml)
      - `actual_output_weight` (numeric, grams/ml)
      - `duration` (integer, seconds)
      - `avg_temperature` (numeric, celsius)
      - `avg_pressure` (numeric, bars)
      - `max_temperature` (numeric, celsius)
      - `min_temperature` (numeric, celsius)
      - `temperature_data` (jsonb, array of {time, value})
      - `pressure_data` (jsonb, array of {time, value})
      - `weight_data` (jsonb, array of {time, value})
      - `created_at` (timestamp)

    - `settings` - User preferences
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `theme` (text: 'light' or 'dark')
      - `brew_time_display_mode` (text: 'countdown' or 'count-up')
      - `alert_sound_enabled` (boolean)
      - `alert_haptics_enabled` (boolean)
      - `temperature_alert_threshold` (integer, degrees below target)
      - `pressure_alert_threshold` (numeric, bars below goal)
      - `machine_name` (text)
      - `websocket_server_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Guest account data isolated from registered users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('user', 'guest')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Guest can view guest profile"
  ON profiles FOR SELECT
  USING (account_type = 'guest' AND email = 'guest@espresso.local');

CREATE POLICY "Authenticated users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND account_type = 'user');

-- Create brewing profiles table
CREATE TABLE IF NOT EXISTS brewing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_temperature integer NOT NULL CHECK (target_temperature > 0),
  goal_pressure numeric NOT NULL CHECK (goal_pressure > 0),
  pre_infusion_time integer NOT NULL DEFAULT 0 CHECK (pre_infusion_time >= 0),
  brewing_time_target integer NOT NULL CHECK (brewing_time_target > 0),
  coffee_input_amount numeric NOT NULL CHECK (coffee_input_amount > 0),
  target_output_amount numeric NOT NULL CHECK (target_output_amount > 0),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brewing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own brewing profiles"
  ON brewing_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = brewing_profiles.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = brewing_profiles.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Guest can manage guest brewing profiles"
  ON brewing_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = brewing_profiles.profile_id
      AND profiles.account_type = 'guest'
      AND profiles.email = 'guest@espresso.local'
    )
  );

-- Create shot history table
CREATE TABLE IF NOT EXISTS shot_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brewing_profile_id uuid REFERENCES brewing_profiles(id) ON DELETE SET NULL,
  coffee_input_amount numeric NOT NULL,
  target_output_amount numeric NOT NULL,
  actual_output_weight numeric,
  duration integer NOT NULL,
  avg_temperature numeric,
  avg_pressure numeric,
  max_temperature numeric,
  min_temperature numeric,
  temperature_data jsonb DEFAULT '[]'::jsonb,
  pressure_data jsonb DEFAULT '[]'::jsonb,
  weight_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shot_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shot history"
  ON shot_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = shot_history.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = shot_history.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Guest can manage guest shot history"
  ON shot_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = shot_history.profile_id
      AND profiles.account_type = 'guest'
      AND profiles.email = 'guest@espresso.local'
    )
  );

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  brew_time_display_mode text NOT NULL DEFAULT 'count-up' CHECK (brew_time_display_mode IN ('countdown', 'count-up')),
  alert_sound_enabled boolean NOT NULL DEFAULT true,
  alert_haptics_enabled boolean NOT NULL DEFAULT true,
  temperature_alert_threshold integer NOT NULL DEFAULT 5,
  pressure_alert_threshold numeric NOT NULL DEFAULT 2,
  machine_name text NOT NULL DEFAULT 'Espresso Machine',
  websocket_server_url text NOT NULL DEFAULT 'ws://192.168.4.1:8080',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
  ON settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = settings.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = settings.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Guest can manage guest settings"
  ON settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = settings.profile_id
      AND profiles.account_type = 'guest'
      AND profiles.email = 'guest@espresso.local'
    )
  );

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_brewing_profiles_profile_id ON brewing_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_shot_history_profile_id ON shot_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_shot_history_created_at ON shot_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_profile_id ON settings(profile_id);
