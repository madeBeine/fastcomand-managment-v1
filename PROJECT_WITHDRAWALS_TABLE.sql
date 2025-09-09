-- Create project_withdrawals table for Supabase
CREATE TABLE IF NOT EXISTS project_withdrawals (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  purpose TEXT NOT NULL,
  notes TEXT,
  approved_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE project_withdrawals ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read project withdrawals
-- CREATE POLICY "Enable read access for authenticated users" ON project_withdrawals
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for admins to insert project withdrawals
-- CREATE POLICY "Enable insert for admins" ON project_withdrawals
--   FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'Admin');

-- Create policy for admins to update project withdrawals
-- CREATE POLICY "Enable update for admins" ON project_withdrawals
--   FOR UPDATE USING (auth.jwt() ->> 'role' = 'Admin');

-- Create policy for admins to delete project withdrawals
-- CREATE POLICY "Enable delete for admins" ON project_withdrawals
--   FOR DELETE USING (auth.jwt() ->> 'role' = 'Admin');

-- Grant necessary permissions
GRANT ALL ON project_withdrawals TO anon;
GRANT ALL ON project_withdrawals TO authenticated;
