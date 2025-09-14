-- Sample jewelry stores
INSERT OR IGNORE INTO stores (id, name, description, logo_url) VALUES 
  (1, 'Diamond Dreams', 'Luxury diamond jewelry and custom engagement rings', NULL),
  (2, 'Golden Touch Jewelry', 'Family-owned jewelry store specializing in gold and silver pieces', NULL),
  (3, 'Precious Gems Co.', 'Fine jewelry with rare gemstones and vintage collections', NULL);

-- Sample staff members
INSERT OR IGNORE INTO staff (id, store_id, name, role, year_started, profile_picture_url) VALUES 
  (1, 1, 'Sarah Johnson', 'Store Manager', 2018, NULL),
  (2, 1, 'Mike Chen', 'Senior Sales Associate', 2020, NULL),
  (3, 1, 'Emma Rodriguez', 'Jewelry Designer', 2019, NULL),
  (4, 2, 'David Williams', 'Owner', 2010, NULL),
  (5, 2, 'Lisa Thompson', 'Gemologist', 2022, NULL),
  (6, 3, 'Robert Davis', 'Store Manager', 2015, NULL);

-- Sample custom sections
INSERT OR IGNORE INTO staff_custom_sections (staff_id, section_name, section_value, section_order) VALUES 
  (1, 'Specialties', 'Customer Relations, Inventory Management', 1),
  (1, 'Certifications', 'GIA Certified', 2),
  (2, 'Languages', 'English, Mandarin, Cantonese', 1),
  (2, 'Achievements', 'Top Salesperson 2023', 2),
  (3, 'Education', 'BFA in Jewelry Design - Parsons School', 1),
  (3, 'Awards', 'JCK Rising Stars Award 2021', 2),
  (4, 'Experience', '15 years in jewelry industry', 1),
  (4, 'Community', 'Local Business Association President', 2),
  (5, 'Education', 'GIA Graduate Gemologist', 1),
  (6, 'Background', 'Former Tiffany & Co. Manager', 1);