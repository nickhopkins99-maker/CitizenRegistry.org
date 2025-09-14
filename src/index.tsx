import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

type Bindings = {
  DB: D1Database
  IMAGES: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

app.use(renderer)

// Initialize database tables
const initDB = async (db: D1Database) => {
  // Create stores table
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()

  // Create staff table
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      year_started INTEGER,
      profile_picture_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    )
  `).run()

  // Create custom sections table
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS staff_custom_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL,
      section_name TEXT NOT NULL,
      section_value TEXT,
      section_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
    )
  `).run()

  // Create store custom sections table
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS store_custom_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      section_name TEXT NOT NULL,
      section_value TEXT,
      section_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    )
  `).run()
}

// API Routes

// Get all stores
app.get('/api/stores', async (c) => {
  const { env } = c
  await initDB(env.DB)
  
  const stores = await env.DB.prepare(`
    SELECT s.*, 
    GROUP_CONCAT(scs.section_name || '|||' || COALESCE(scs.section_value, '') || '|||' || scs.section_order, '###') as custom_sections
    FROM stores s
    LEFT JOIN store_custom_sections scs ON s.id = scs.store_id
    GROUP BY s.id
    ORDER BY s.name
  `).all()
  
  // Parse custom sections for each store
  const storesWithSections = stores.results.map((store: any) => ({
    ...store,
    custom_sections: store.custom_sections 
      ? store.custom_sections.split('###')
          .filter((s: string) => s.trim())
          .map((s: string) => {
            const [name, value, order] = s.split('|||')
            return { section_name: name, section_value: value, section_order: parseInt(order) }
          })
          .sort((a: any, b: any) => a.section_order - b.section_order)
      : []
  }))
  
  return c.json(storesWithSections)
})

// Get single store with staff
app.get('/api/stores/:id', async (c) => {
  const { env } = c
  const storeId = c.req.param('id')
  await initDB(env.DB)
  
  const store = await env.DB.prepare('SELECT * FROM stores WHERE id = ?').bind(storeId).first()
  if (!store) {
    return c.json({ error: 'Store not found' }, 404)
  }
  
  const staff = await env.DB.prepare(`
    SELECT s.*, 
    GROUP_CONCAT(scs.section_name || '|||' || COALESCE(scs.section_value, '') || '|||' || scs.section_order, '###') as custom_sections
    FROM staff s
    LEFT JOIN staff_custom_sections scs ON s.id = scs.staff_id
    WHERE s.store_id = ?
    GROUP BY s.id
    ORDER BY s.name
  `).bind(storeId).all()
  
  // Parse custom sections
  const staffWithSections = staff.results.map((member: any) => ({
    ...member,
    custom_sections: member.custom_sections 
      ? member.custom_sections.split('###')
          .filter((s: string) => s.trim())
          .map((s: string) => {
            const [name, value, order] = s.split('|||')
            return { section_name: name, section_value: value, section_order: parseInt(order) }
          })
          .sort((a: any, b: any) => a.section_order - b.section_order)
      : []
  }))
  
  return c.json({ store, staff: staffWithSections })
})

// Create new store
app.post('/api/stores', async (c) => {
  const { env } = c
  const { name, description } = await c.req.json()
  await initDB(env.DB)
  
  const result = await env.DB.prepare(`
    INSERT INTO stores (name, description) VALUES (?, ?)
  `).bind(name, description).run()
  
  return c.json({ id: result.meta.last_row_id, name, description })
})

// Update store
app.put('/api/stores/:id', async (c) => {
  const { env } = c
  const storeId = c.req.param('id')
  const { name, description, logo_url } = await c.req.json()
  await initDB(env.DB)
  
  await env.DB.prepare(`
    UPDATE stores SET name = ?, description = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).bind(name, description, logo_url, storeId).run()
  
  return c.json({ success: true })
})

// Delete store
app.delete('/api/stores/:id', async (c) => {
  const { env } = c
  const storeId = c.req.param('id')
  await initDB(env.DB)
  
  await env.DB.prepare('DELETE FROM stores WHERE id = ?').bind(storeId).run()
  return c.json({ success: true })
})

// Bulk import stores from Excel data
app.post('/api/stores/bulk-import', async (c) => {
  const { env } = c
  const { store_data } = await c.req.json()
  await initDB(env.DB)
  
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
    created_ids: [] as number[]
  }
  
  // Process each store
  for (let i = 0; i < store_data.length; i++) {
    const store = store_data[i]
    const rowNum = i + 2 // Excel row number (assuming row 1 is headers)
    
    try {
      // Validate required fields
      if (!store.name) {
        results.failed++
        results.errors.push(`Row ${rowNum}: Store name is required`)
        continue
      }
      
      // Clean and validate data
      const name = String(store.name).trim()
      const description = store.description ? String(store.description).trim() : null
      
      // Check for duplicate store names
      const existingStore = await env.DB.prepare('SELECT id FROM stores WHERE name = ?').bind(name).first()
      if (existingStore) {
        results.failed++
        results.errors.push(`Row ${rowNum}: Store "${name}" already exists`)
        continue
      }
      
      // Insert store
      const result = await env.DB.prepare(`
        INSERT INTO stores (name, description) 
        VALUES (?, ?)
      `).bind(name, description).run()
      
      const storeId = result.meta.last_row_id as number
      results.created_ids.push(storeId)
      
      // Add custom sections if provided (auto-detect from headers)
      const standardFields = ['name', 'description', 'logo', 'logo_url']
      const customSections = []
      
      for (const [key, value] of Object.entries(store)) {
        const lowerKey = key.toLowerCase().trim()
        if (!standardFields.includes(lowerKey) && value && String(value).trim()) {
          customSections.push({
            name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
            value: String(value).trim()
          })
        }
      }
      
      // Insert custom sections
      for (let j = 0; j < customSections.length; j++) {
        const section = customSections[j]
        await env.DB.prepare(`
          INSERT INTO store_custom_sections (store_id, section_name, section_value, section_order)
          VALUES (?, ?, ?, ?)
        `).bind(storeId, section.name, section.value, j).run()
      }
      
      results.successful++
      
    } catch (error) {
      results.failed++
      results.errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error(`Error importing store at row ${rowNum}:`, error)
    }
  }
  
  return c.json({
    message: `Store import completed. ${results.successful} successful, ${results.failed} failed.`,
    results
  })
})

// Store custom sections management
app.post('/api/stores/:storeId/sections', async (c) => {
  const { env } = c
  const storeId = c.req.param('storeId')
  const { section_name, section_value, section_order } = await c.req.json()
  await initDB(env.DB)
  
  const result = await env.DB.prepare(`
    INSERT INTO store_custom_sections (store_id, section_name, section_value, section_order)
    VALUES (?, ?, ?, ?)
  `).bind(storeId, section_name, section_value, section_order || 0).run()
  
  return c.json({ 
    id: result.meta.last_row_id, 
    store_id: storeId, 
    section_name, 
    section_value, 
    section_order: section_order || 0 
  })
})

app.put('/api/stores/sections/:id', async (c) => {
  const { env } = c
  const sectionId = c.req.param('id')
  const { section_name, section_value, section_order } = await c.req.json()
  await initDB(env.DB)
  
  await env.DB.prepare(`
    UPDATE store_custom_sections 
    SET section_name = ?, section_value = ?, section_order = ?
    WHERE id = ?
  `).bind(section_name, section_value, section_order, sectionId).run()
  
  return c.json({ success: true })
})

app.delete('/api/stores/sections/:id', async (c) => {
  const { env } = c
  const sectionId = c.req.param('id')
  await initDB(env.DB)
  
  await env.DB.prepare('DELETE FROM store_custom_sections WHERE id = ?').bind(sectionId).run()
  return c.json({ success: true })
})

// Create staff member
app.post('/api/stores/:storeId/staff', async (c) => {
  const { env } = c
  const storeId = c.req.param('storeId')
  const { name, role, year_started } = await c.req.json()
  await initDB(env.DB)
  
  const result = await env.DB.prepare(`
    INSERT INTO staff (store_id, name, role, year_started) 
    VALUES (?, ?, ?, ?)
  `).bind(storeId, name, role, year_started).run()
  
  return c.json({ id: result.meta.last_row_id, store_id: storeId, name, role, year_started })
})

// Update staff member
app.put('/api/staff/:id', async (c) => {
  const { env } = c
  const staffId = c.req.param('id')
  const { name, role, year_started, profile_picture_url } = await c.req.json()
  await initDB(env.DB)
  
  await env.DB.prepare(`
    UPDATE staff SET name = ?, role = ?, year_started = ?, profile_picture_url = ?, 
    updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(name, role, year_started, profile_picture_url, staffId).run()
  
  return c.json({ success: true })
})

// Delete staff member
app.delete('/api/staff/:id', async (c) => {
  const { env } = c
  const staffId = c.req.param('id')
  await initDB(env.DB)
  
  await env.DB.prepare('DELETE FROM staff WHERE id = ?').bind(staffId).run()
  return c.json({ success: true })
})

// Bulk import staff members from Excel data
app.post('/api/stores/:storeId/staff/bulk-import', async (c) => {
  const { env } = c
  const storeId = c.req.param('storeId')
  const { staff_data } = await c.req.json()
  await initDB(env.DB)
  
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
    created_ids: [] as number[]
  }
  
  // Validate store exists
  const store = await env.DB.prepare('SELECT id FROM stores WHERE id = ?').bind(storeId).first()
  if (!store) {
    return c.json({ error: 'Store not found' }, 404)
  }
  
  // Process each staff member
  for (let i = 0; i < staff_data.length; i++) {
    const staff = staff_data[i]
    const rowNum = i + 2 // Excel row number (assuming row 1 is headers)
    
    try {
      // Validate required fields
      if (!staff.name || !staff.role) {
        results.failed++
        results.errors.push(`Row ${rowNum}: Name and Role are required`)
        continue
      }
      
      // Clean and validate data
      const name = String(staff.name).trim()
      const role = String(staff.role).trim()
      const year_started = staff.year_started ? parseInt(String(staff.year_started)) : null
      
      // Validate year_started if provided
      if (year_started && (year_started < 1900 || year_started > 2030)) {
        results.failed++
        results.errors.push(`Row ${rowNum}: Invalid year started (${year_started}). Must be between 1900-2030`)
        continue
      }
      
      // Insert staff member
      const result = await env.DB.prepare(`
        INSERT INTO staff (store_id, name, role, year_started) 
        VALUES (?, ?, ?, ?)
      `).bind(storeId, name, role, year_started).run()
      
      const staffId = result.meta.last_row_id as number
      results.created_ids.push(staffId)
      
      // Add custom sections if provided (intelligent auto-detection)
      const standardFields = ['name', 'role', 'year_started', 'profile_picture_url', 'store_id']
      const customSections = []
      
      // Auto-detect custom fields from headers
      for (const [key, value] of Object.entries(staff)) {
        const lowerKey = key.toLowerCase().trim()
        if (!standardFields.includes(lowerKey) && value && String(value).trim()) {
          customSections.push({
            name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), // Capitalize and clean name
            value: String(value).trim()
          })
        }
      }
      
      // Insert custom sections
      for (let j = 0; j < customSections.length; j++) {
        const section = customSections[j]
        await env.DB.prepare(`
          INSERT INTO staff_custom_sections (staff_id, section_name, section_value, section_order)
          VALUES (?, ?, ?, ?)
        `).bind(staffId, section.name, section.value, j).run()
      }
      
      results.successful++
      
    } catch (error) {
      results.failed++
      results.errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error(`Error importing staff member at row ${rowNum}:`, error)
    }
  }
  
  return c.json({
    message: `Import completed. ${results.successful} successful, ${results.failed} failed.`,
    results
  })
})

// Download Excel template for staff
app.get('/api/excel-template/staff', (c) => {
  // Create CSV template that can be opened in Excel
  const template = `Name,Role,Year Started,Certifications,Languages,Specialties,Education,Awards,Experience,Phone,Email,Notes
"Sarah Johnson","Store Manager",2018,"GIA Certified","English, Spanish","Customer Relations","Business Management Degree","Employee of the Year 2022","5+ years retail management","(555) 123-4567","sarah@example.com","Excellent with customer service"
"Mike Chen","Sales Associate",2020,"","English, Mandarin","Luxury Sales","","Top Salesperson 2023","3 years jewelry sales","(555) 234-5678","mike@example.com","Specializes in engagement rings"
"Emma Rodriguez","Jewelry Designer",2019,"CAD Certification","English","Custom Design","BFA Jewelry Design","JCK Rising Stars 2021","4 years design experience","(555) 345-6789","emma@example.com","Creates beautiful custom pieces"`

  return new Response(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="jewelry-store-staff-template.csv"'
    }
  })
})

// Download Excel template for stores
app.get('/api/excel-template/stores', (c) => {
  const template = `Name,Description,Address,Phone,Email,Website,Owner,Manager,Established,Specializes In,Hours,Social Media
"Diamond Dreams","Luxury diamond jewelry and custom engagement rings","123 Main St, Beverly Hills, CA 90210","(310) 555-0123","info@diamonddreams.com","www.diamonddreams.com","Robert Smith","Sarah Johnson",2015,"Custom Engagement Rings, Luxury Diamonds","Mon-Sat 10AM-7PM","@DiamondDreamsLA"
"Golden Touch Jewelry","Family-owned jewelry store specializing in gold and silver pieces","456 Oak Avenue, Los Angeles, CA 90028","(323) 555-0456","contact@goldentouch.com","www.goldentouch.com","Maria Gonzalez","David Williams",2008,"Gold Jewelry, Silver Collections, Repairs","Tue-Sun 9AM-6PM","@GoldenTouchJewelry"
"Precious Gems Co.","Fine jewelry with rare gemstones and vintage collections","789 Sunset Blvd, West Hollywood, CA 90069","(424) 555-0789","hello@preciousgems.com","www.preciousgems.com","Jennifer Lee","Michael Chen",2012,"Rare Gemstones, Vintage Jewelry, Appraisals","Mon-Fri 11AM-8PM, Sat 10AM-6PM","@PreciousGemsCo"`

  return new Response(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="jewelry-stores-template.csv"'
    }
  })
})

// Legacy endpoint for backward compatibility
app.get('/api/excel-template', (c) => {
  return c.redirect('/api/excel-template/staff', 301)
})

// Add custom section to staff
app.post('/api/staff/:staffId/sections', async (c) => {
  const { env } = c
  const staffId = c.req.param('staffId')
  const { section_name, section_value, section_order } = await c.req.json()
  await initDB(env.DB)
  
  const result = await env.DB.prepare(`
    INSERT INTO staff_custom_sections (staff_id, section_name, section_value, section_order)
    VALUES (?, ?, ?, ?)
  `).bind(staffId, section_name, section_value, section_order || 0).run()
  
  return c.json({ 
    id: result.meta.last_row_id, 
    staff_id: staffId, 
    section_name, 
    section_value, 
    section_order: section_order || 0 
  })
})

// Update custom section
app.put('/api/staff/sections/:id', async (c) => {
  const { env } = c
  const sectionId = c.req.param('id')
  const { section_name, section_value, section_order } = await c.req.json()
  await initDB(env.DB)
  
  await env.DB.prepare(`
    UPDATE staff_custom_sections 
    SET section_name = ?, section_value = ?, section_order = ?
    WHERE id = ?
  `).bind(section_name, section_value, section_order, sectionId).run()
  
  return c.json({ success: true })
})

// Delete custom section
app.delete('/api/staff/sections/:id', async (c) => {
  const { env } = c
  const sectionId = c.req.param('id')
  await initDB(env.DB)
  
  await env.DB.prepare('DELETE FROM staff_custom_sections WHERE id = ?').bind(sectionId).run()
  return c.json({ success: true })
})

// Image upload endpoint
app.post('/api/upload', async (c) => {
  const { env } = c
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }
  
  const fileExtension = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`
  
  try {
    await env.IMAGES.put(fileName, file.stream(), {
      httpMetadata: { contentType: file.type }
    })
    
    return c.json({ url: `/api/images/${fileName}` })
  } catch (error) {
    return c.json({ error: 'Upload failed' }, 500)
  }
})

// Serve uploaded images
app.get('/api/images/:fileName', async (c) => {
  const { env } = c
  const fileName = c.req.param('fileName')
  
  const object = await env.IMAGES.get(fileName)
  if (!object) {
    return c.notFound()
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg'
    }
  })
})

// Main application page
app.get('/', (c) => {
  return c.render(
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              <i className="fas fa-gem text-purple-600 mr-3"></i>
              Jewelry Store Profiles
            </h1>
            <p className="text-gray-600">Manage your jewelry store accounts and staff profiles</p>
          </header>

          {/* Store Management Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                <i className="fas fa-store text-blue-600 mr-2"></i>
                Jewelry Stores
              </h2>
              <div className="flex space-x-2">
                <button 
                  id="bulkImportStoresBtn" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition duration-200 flex items-center text-sm"
                >
                  <i className="fas fa-file-excel mr-2"></i>
                  Import Stores
                </button>
                <button 
                  id="addStoreBtn" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Store
                </button>
              </div>
            </div>
            
            {/* Bulk Import Info */}
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <i className="fas fa-lightbulb text-purple-600 mt-1"></i>
                <div className="flex-1">
                  <h4 className="font-medium text-purple-800 mb-1">Quick Setup: Import Multiple Stores</h4>
                  <p className="text-sm text-purple-700 mb-2">Import jewelry stores from Excel or copy-paste data directly from spreadsheets.</p>
                  <a href="/api/excel-template/stores" target="_blank" 
                     className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium">
                    <i className="fas fa-download mr-1"></i>Download Stores Template
                  </a>
                </div>
              </div>
            </div>
            <div id="storesList" className="space-y-4">
              {/* Stores will be loaded here */}
            </div>
          </div>

          {/* Store Detail Modal */}
          <div id="storeModal" className="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Store Details</h3>
                    <button id="closeStoreModal" className="text-gray-500 hover:text-gray-700">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div id="storeModalContent">
                    {/* Store content will be loaded here */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Detail Modal */}
          <div id="staffModal" className="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Staff Profile</h3>
                    <button id="closeStaffModal" className="text-gray-500 hover:text-gray-700">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div id="staffModalContent">
                    {/* Staff content will be loaded here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
      <script src="/static/app.js"></script>
    </div>
  )
})

export default app