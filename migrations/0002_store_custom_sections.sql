-- Store custom sections table for dynamic store information
CREATE TABLE IF NOT EXISTS store_custom_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  section_name TEXT NOT NULL,
  section_value TEXT,
  section_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_store_custom_sections_store_id ON store_custom_sections(store_id);