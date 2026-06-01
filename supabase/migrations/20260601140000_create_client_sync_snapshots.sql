-- Create client_sync_snapshots table
CREATE TABLE IF NOT EXISTS client_sync_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_agency_snapshot UNIQUE (agency_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE client_sync_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read/write access (using anon key) for synchronization
CREATE POLICY "Public Read/Write Access" ON client_sync_snapshots
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_client_sync_snapshots_updated_at
    BEFORE UPDATE ON client_sync_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
