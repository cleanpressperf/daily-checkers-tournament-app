ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS champion_name TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS champion_id UUID REFERENCES participants(id);
