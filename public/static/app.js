// Jewelry Store Profile Management App
class JewelryStoreApp {
  constructor() {
    this.stores = []
    this.currentStore = null
    this.currentStaff = null
    this.init()
  }

  async init() {
    await this.loadStores()
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Add store button
    document.getElementById('addStoreBtn').addEventListener('click', () => {
      this.showAddStoreForm()
    })

    // Bulk import stores button
    document.getElementById('bulkImportStoresBtn').addEventListener('click', () => {
      this.showStoresBulkImportForm()
    })

    // Close modals
    document.getElementById('closeStoreModal').addEventListener('click', () => {
      this.closeModal('storeModal')
    })

    document.getElementById('closeStaffModal').addEventListener('click', () => {
      this.closeModal('staffModal')
    })

    // Click outside modal to close
    document.getElementById('storeModal').addEventListener('click', (e) => {
      if (e.target.id === 'storeModal') this.closeModal('storeModal')
    })

    document.getElementById('staffModal').addEventListener('click', (e) => {
      if (e.target.id === 'staffModal') this.closeModal('staffModal')
    })
  }

  async loadStores() {
    try {
      const response = await axios.get('/api/stores')
      this.stores = response.data
      this.renderStores()
    } catch (error) {
      console.error('Error loading stores:', error)
      this.showNotification('Error loading stores', 'error')
    }
  }

  getStoreAddress(store) {
    if (!store.custom_sections || !Array.isArray(store.custom_sections)) {
      return null
    }
    
    // Look for address-related sections
    const addressSection = store.custom_sections.find(section => {
      const sectionName = section.section_name.toLowerCase()
      return sectionName.includes('address') || 
             sectionName.includes('location') || 
             sectionName === 'address' ||
             sectionName === 'store address'
    })
    
    return addressSection ? addressSection.section_value : null
  }

  renderStores() {
    const storesList = document.getElementById('storesList')
    
    if (this.stores.length === 0) {
      storesList.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-store text-4xl mb-4"></i>
          <p>No jewelry stores added yet. Click "Add Store" to get started!</p>
        </div>
      `
      return
    }

    storesList.innerHTML = this.stores.map(store => `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200 cursor-pointer" 
           onclick="app.openStore(${store.id})">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            ${store.logo_url ? 
              `<img src="${store.logo_url}" alt="${store.name}" class="w-12 h-12 rounded-full object-cover">` : 
              `<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="fas fa-gem text-purple-600"></i>
               </div>`
            }
            <div>
              <h3 class="font-semibold text-gray-800">${store.name}</h3>
              <p class="text-sm text-gray-600">${this.getStoreAddress(store) || 'No address available'}</p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button onclick="event.stopPropagation(); app.editStore(${store.id})" 
                    class="text-blue-600 hover:text-blue-800 p-2">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="event.stopPropagation(); app.deleteStore(${store.id})" 
                    class="text-red-600 hover:text-red-800 p-2">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('')
  }

  showAddStoreForm() {
    const content = `
      <form id="storeForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
          <input type="text" id="storeName" required 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea id="storeDescription" rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Logo</label>
          <input type="file" id="storeLogo" accept="image/*" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <p class="text-xs text-gray-500 mt-1">Optional: Upload a logo for your store</p>
        </div>
        
        <div class="flex space-x-3 pt-4">
          <button type="submit" 
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-save mr-2"></i>Save Store
          </button>
          <button type="button" onclick="app.closeModal('storeModal')"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition duration-200">
            Cancel
          </button>
        </div>
      </form>
    `
    
    document.getElementById('storeModalContent').innerHTML = content
    document.getElementById('storeForm').addEventListener('submit', (e) => this.handleStoreSubmit(e))
    this.showModal('storeModal')
  }

  async handleStoreSubmit(e) {
    e.preventDefault()
    
    const name = document.getElementById('storeName').value
    const description = document.getElementById('storeDescription').value
    const logoFile = document.getElementById('storeLogo').files[0]
    
    try {
      let logoUrl = null
      
      // Upload logo if provided
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        
        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        logoUrl = uploadResponse.data.url
      }
      
      // Create store
      const storeData = { name, description }
      const response = await axios.post('/api/stores', storeData)
      
      // Update logo if uploaded
      if (logoUrl) {
        await axios.put(`/api/stores/${response.data.id}`, { 
          name, 
          description, 
          logo_url: logoUrl 
        })
      }
      
      this.closeModal('storeModal')
      this.showNotification('Store added successfully!', 'success')
      await this.loadStores()
    } catch (error) {
      console.error('Error adding store:', error)
      this.showNotification('Error adding store', 'error')
    }
  }

  async openStore(storeId) {
    try {
      const response = await axios.get(`/api/stores/${storeId}`)
      this.currentStore = response.data
      this.showStoreDetails()
    } catch (error) {
      console.error('Error loading store:', error)
      this.showNotification('Error loading store details', 'error')
    }
  }

  showStoreDetails() {
    const { store, staff } = this.currentStore
    
    const content = `
      <div class="space-y-6">
        <!-- Store Header -->
        <div class="border-b pb-4">
          <div class="flex items-center space-x-4 mb-3">
            ${store.logo_url ? 
              `<img src="${store.logo_url}" alt="${store.name}" class="w-16 h-16 rounded-full object-cover">` :
              `<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="fas fa-gem text-purple-600 text-2xl"></i>
               </div>`
            }
            <div>
              <h2 class="text-2xl font-bold text-gray-800">${store.name}</h2>
              <p class="text-gray-600">${store.description || 'No description'}</p>
            </div>
          </div>
        </div>
        
        <!-- Staff Section -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">
              <i class="fas fa-users text-green-600 mr-2"></i>
              Staff Members
            </h3>
            <div class="flex space-x-2">
              <button onclick="app.showBulkImportForm(${store.id})" 
                      class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition duration-200">
                <i class="fas fa-file-excel mr-1"></i>Import Excel
              </button>
              <button onclick="app.showAddStaffForm(${store.id})" 
                      class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition duration-200">
                <i class="fas fa-plus mr-1"></i>Add Staff
              </button>
            </div>
          </div>
          
          <!-- Bulk Import Instructions -->
          <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start space-x-3">
              <i class="fas fa-info-circle text-blue-600 mt-1"></i>
              <div class="flex-1">
                <h4 class="font-medium text-blue-800 mb-1">Quick Tip: Bulk Import</h4>
                <p class="text-sm text-blue-700 mb-2">Save time by importing multiple staff profiles from an Excel file.</p>
                <a href="/api/excel-template/staff" target="_blank" 
                   class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  <i class="fas fa-download mr-1"></i>Download Excel Template
                </a>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            ${staff.length === 0 ? 
              `<div class="text-center text-gray-500 py-6">
                <i class="fas fa-user-plus text-3xl mb-3"></i>
                <p>No staff members added yet. Click "Add Staff" to get started!</p>
               </div>` :
              staff.map(member => `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200 cursor-pointer"
                     onclick="app.openStaffProfile(${member.id})">
                  <div class="flex items-center space-x-3">
                    ${member.profile_picture_url ? 
                      `<img src="${member.profile_picture_url}" alt="${member.name}" class="w-12 h-12 rounded-full object-cover">` :
                      `<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-blue-600"></i>
                       </div>`
                    }
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-800">${member.name}</h4>
                      <p class="text-sm text-gray-600">${member.role}</p>
                      ${member.year_started ? `<p class="text-xs text-gray-500">Started: ${member.year_started}</p>` : ''}
                    </div>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `
    
    document.getElementById('storeModalContent').innerHTML = content
    this.showModal('storeModal')
  }

  showAddStaffForm(storeId) {
    this.closeModal('storeModal')
    
    const content = `
      <form id="staffForm" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input type="text" id="staffName" required 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <input type="text" id="staffRole" required placeholder="e.g., Sales Associate, Manager"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Year Started</label>
          <input type="number" id="staffYearStarted" min="1900" max="2030" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
          <input type="file" id="staffPicture" accept="image/*" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <p class="text-xs text-gray-500 mt-1">Optional: Upload a profile picture</p>
        </div>
        
        <div class="flex space-x-3 pt-4">
          <button type="submit" 
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-save mr-2"></i>Save Staff Member
          </button>
          <button type="button" onclick="app.backToStore()"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition duration-200">
            Back to Store
          </button>
        </div>
      </form>
    `
    
    document.getElementById('staffModalContent').innerHTML = content
    document.getElementById('staffForm').addEventListener('submit', (e) => this.handleStaffSubmit(e, storeId))
    this.showModal('staffModal')
  }

  async handleStaffSubmit(e, storeId) {
    e.preventDefault()
    
    const name = document.getElementById('staffName').value
    const role = document.getElementById('staffRole').value
    const yearStarted = document.getElementById('staffYearStarted').value
    const pictureFile = document.getElementById('staffPicture').files[0]
    
    try {
      // Create staff member
      const staffData = { 
        name, 
        role, 
        year_started: yearStarted ? parseInt(yearStarted) : null 
      }
      
      const response = await axios.post(`/api/stores/${storeId}/staff`, staffData)
      const staffId = response.data.id
      
      // Upload picture if provided
      if (pictureFile) {
        const formData = new FormData()
        formData.append('file', pictureFile)
        
        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        await axios.put(`/api/staff/${staffId}`, {
          name,
          role,
          year_started: yearStarted ? parseInt(yearStarted) : null,
          profile_picture_url: uploadResponse.data.url
        })
      }
      
      this.closeModal('staffModal')
      this.showNotification('Staff member added successfully!', 'success')
      await this.openStore(storeId) // Refresh store view
    } catch (error) {
      console.error('Error adding staff member:', error)
      this.showNotification('Error adding staff member', 'error')
    }
  }

  async openStaffProfile(staffId) {
    try {
      // Find staff member in current store data
      const staff = this.currentStore.staff.find(s => s.id === staffId)
      if (!staff) {
        this.showNotification('Staff member not found', 'error')
        return
      }
      
      this.currentStaff = staff
      this.showStaffProfile()
    } catch (error) {
      console.error('Error loading staff profile:', error)
      this.showNotification('Error loading staff profile', 'error')
    }
  }

  showStaffProfile() {
    const staff = this.currentStaff
    
    const content = `
      <div class="space-y-6">
        <!-- Staff Header -->
        <div class="border-b pb-4">
          <div class="flex items-center space-x-4 mb-3">
            ${staff.profile_picture_url ? 
              `<img src="${staff.profile_picture_url}" alt="${staff.name}" class="w-20 h-20 rounded-full object-cover">` :
              `<div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-blue-600 text-2xl"></i>
               </div>`
            }
            <div>
              <h2 class="text-2xl font-bold text-gray-800">${staff.name}</h2>
              <p class="text-lg text-gray-600">${staff.role}</p>
              ${staff.year_started ? `<p class="text-sm text-gray-500">Started: ${staff.year_started}</p>` : ''}
            </div>
          </div>
        </div>
        
        <!-- Custom Sections -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">
              <i class="fas fa-info-circle text-purple-600 mr-2"></i>
              Additional Information
            </h3>
            <button onclick="app.showAddSectionForm(${staff.id})" 
                    class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition duration-200">
              <i class="fas fa-plus mr-1"></i>Add Section
            </button>
          </div>
          
          <div class="space-y-3" id="customSections">
            ${staff.custom_sections && staff.custom_sections.length > 0 ? 
              staff.custom_sections.map(section => `
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-800 mb-1">${section.section_name}</h4>
                      <p class="text-gray-600">${section.section_value || 'No value set'}</p>
                    </div>
                    <button onclick="app.deleteSection(${section.id || 'null'})" 
                            class="text-red-600 hover:text-red-800 ml-2">
                      <i class="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              `).join('') :
              `<div class="text-center text-gray-500 py-6">
                <i class="fas fa-plus-circle text-3xl mb-3"></i>
                <p>No additional sections added yet. Click "Add Section" to get started!</p>
               </div>`
            }
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-3 pt-4 border-t">
          <button onclick="app.editStaffProfile(${staff.id})" 
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-edit mr-2"></i>Edit Profile
          </button>
          <button onclick="app.backToStore()" 
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-arrow-left mr-2"></i>Back to Store
          </button>
          <button onclick="app.deleteStaff(${staff.id})" 
                  class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `
    
    document.getElementById('staffModalContent').innerHTML = content
    this.showModal('staffModal')
  }

  showAddSectionForm(staffId) {
    const content = `
      <div class="mb-4">
        <button onclick="app.showStaffProfile()" class="text-blue-600 hover:text-blue-800">
          <i class="fas fa-arrow-left mr-1"></i>Back to Profile
        </button>
      </div>
      
      <form id="sectionForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Section Name *</label>
          <input type="text" id="sectionName" required placeholder="e.g., Certifications, Languages, Specialties"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Value</label>
          <textarea id="sectionValue" rows="3" placeholder="Enter the details for this section"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"></textarea>
        </div>
        
        <div class="flex space-x-3 pt-4">
          <button type="submit" 
                  class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-save mr-2"></i>Add Section
          </button>
          <button type="button" onclick="app.showStaffProfile()"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition duration-200">
            Cancel
          </button>
        </div>
      </form>
    `
    
    document.getElementById('staffModalContent').innerHTML = content
    document.getElementById('sectionForm').addEventListener('submit', (e) => this.handleSectionSubmit(e, staffId))
  }

  async handleSectionSubmit(e, staffId) {
    e.preventDefault()
    
    const sectionName = document.getElementById('sectionName').value
    const sectionValue = document.getElementById('sectionValue').value
    
    try {
      await axios.post(`/api/staff/${staffId}/sections`, {
        section_name: sectionName,
        section_value: sectionValue,
        section_order: this.currentStaff.custom_sections ? this.currentStaff.custom_sections.length : 0
      })
      
      // Refresh the staff profile
      await this.openStore(this.currentStore.store.id)
      const updatedStaff = this.currentStore.staff.find(s => s.id === staffId)
      this.currentStaff = updatedStaff
      
      this.showStaffProfile()
      this.showNotification('Section added successfully!', 'success')
    } catch (error) {
      console.error('Error adding section:', error)
      this.showNotification('Error adding section', 'error')
    }
  }

  async deleteStore(storeId) {
    if (!confirm('Are you sure you want to delete this store? This will also delete all staff profiles.')) {
      return
    }
    
    try {
      await axios.delete(`/api/stores/${storeId}`)
      this.showNotification('Store deleted successfully!', 'success')
      await this.loadStores()
    } catch (error) {
      console.error('Error deleting store:', error)
      this.showNotification('Error deleting store', 'error')
    }
  }

  async deleteStaff(staffId) {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }
    
    try {
      await axios.delete(`/api/staff/${staffId}`)
      this.showNotification('Staff member deleted successfully!', 'success')
      await this.openStore(this.currentStore.store.id) // Refresh store view
    } catch (error) {
      console.error('Error deleting staff member:', error)
      this.showNotification('Error deleting staff member', 'error')
    }
  }

  backToStore() {
    this.closeModal('staffModal')
    if (this.currentStore) {
      this.showStoreDetails()
    }
  }

  showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden')
    document.body.style.overflow = 'hidden'
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden')
    document.body.style.overflow = 'auto'
  }

  showBulkImportForm(storeId) {
    this.closeModal('storeModal')
    
    const content = `
      <div class="space-y-6">
        <!-- Instructions -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-semibold text-blue-800 mb-2">
            <i class="fas fa-info-circle mr-2"></i>Excel Import Instructions
          </h4>
          <div class="text-sm text-blue-700 space-y-2">
            <p><strong>1.</strong> Download the Excel template to see the required format</p>
            <p><strong>2.</strong> Fill in your staff data (Name and Role are required)</p>
            <p><strong>3.</strong> Upload the Excel file (.xlsx, .xls, or .csv)</p>
            <p><strong>4.</strong> Review the import results</p>
          </div>
          <div class="mt-3">
            <a href="/api/excel-template/staff" target="_blank" 
               class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition duration-200">
              <i class="fas fa-download mr-2"></i>Download Template
            </a>
          </div>
        </div>
        
        <!-- File Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-file-excel text-green-600 mr-1"></i>
            Select Excel File
          </label>
          <input type="file" id="excelFile" accept=".xlsx,.xls,.csv" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
          <p class="text-xs text-gray-500 mt-1">Supported formats: .xlsx, .xls, .csv</p>
        </div>
        
        <!-- Import Progress -->
        <div id="importProgress" class="hidden">
          <div class="bg-gray-200 rounded-full h-2">
            <div id="progressBar" class="bg-purple-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
          <p id="progressText" class="text-sm text-gray-600 mt-2">Processing...</p>
        </div>
        
        <!-- Import Results -->
        <div id="importResults" class="hidden space-y-3"></div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-3 pt-4">
          <button id="importBtn" onclick="app.processExcelImport(${storeId})" 
                  class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-upload mr-2"></i>Import Staff Data
          </button>
          <button type="button" onclick="app.backToStore()"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition duration-200">
            Back to Store
          </button>
        </div>
      </div>
    `
    
    document.getElementById('staffModalContent').innerHTML = content
    this.showModal('staffModal')
  }

  async processExcelImport(storeId) {
    const fileInput = document.getElementById('excelFile')
    const importBtn = document.getElementById('importBtn')
    const progressDiv = document.getElementById('importProgress')
    const progressBar = document.getElementById('progressBar')
    const progressText = document.getElementById('progressText')
    const resultsDiv = document.getElementById('importResults')
    
    if (!fileInput.files[0]) {
      this.showNotification('Please select an Excel file first', 'error')
      return
    }
    
    const file = fileInput.files[0]
    
    // Show progress
    importBtn.disabled = true
    importBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...'
    progressDiv.classList.remove('hidden')
    resultsDiv.classList.add('hidden')
    
    try {
      // Update progress
      progressBar.style.width = '25%'
      progressText.textContent = 'Reading Excel file...'
      
      // Read and parse Excel file
      const staffData = await this.parseExcelFile(file)
      
      if (!staffData || staffData.length === 0) {
        throw new Error('No valid data found in Excel file')
      }
      
      // Update progress
      progressBar.style.width = '50%'
      progressText.textContent = `Found ${staffData.length} staff records. Importing...`
      
      // Send to API
      const response = await axios.post(`/api/stores/${storeId}/staff/bulk-import`, {
        staff_data: staffData
      })
      
      // Update progress
      progressBar.style.width = '100%'
      progressText.textContent = 'Import completed!'
      
      // Show results
      this.showImportResults(response.data)
      
      // Success notification
      this.showNotification(response.data.message, 'success')
      
    } catch (error) {
      console.error('Import error:', error)
      this.showNotification(`Import failed: ${error.message}`, 'error')
      
      // Show error in results
      resultsDiv.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-semibold text-red-800 mb-2">Import Failed</h4>
          <p class="text-red-700">${error.message}</p>
        </div>
      `
      resultsDiv.classList.remove('hidden')
    } finally {
      // Reset button
      importBtn.disabled = false
      importBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Import Staff Data'
      
      // Hide progress after delay
      setTimeout(() => {
        progressDiv.classList.add('hidden')
        progressBar.style.width = '0%'
      }, 2000)
    }
  }

  async parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: ''
          })
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'))
            return
          }
          
          // Get headers (first row)
          const headers = jsonData[0].map(h => String(h).toLowerCase().trim())
          
          // Map data rows to objects
          const staffData = []
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            
            // Skip empty rows
            if (row.every(cell => !cell || String(cell).trim() === '')) {
              continue
            }
            
            const staffMember = {}
            
            // Map columns based on header names
            headers.forEach((header, index) => {
              const value = row[index]
              if (value && String(value).trim()) {
                // Map common header variations to standard field names
                if (header.includes('name')) {
                  staffMember.name = String(value).trim()
                } else if (header.includes('role') || header.includes('position') || header.includes('title')) {
                  staffMember.role = String(value).trim()
                } else if (header.includes('year') && header.includes('start')) {
                  staffMember.year_started = value
                } else if (header.includes('cert')) {
                  staffMember.certifications = String(value).trim()
                } else if (header.includes('lang')) {
                  staffMember.languages = String(value).trim()
                } else if (header.includes('special')) {
                  staffMember.specialties = String(value).trim()
                } else if (header.includes('edu')) {
                  staffMember.education = String(value).trim()
                } else if (header.includes('award')) {
                  staffMember.awards = String(value).trim()
                } else if (header.includes('exp')) {
                  staffMember.experience = String(value).trim()
                } else if (header.includes('phone')) {
                  staffMember.phone = String(value).trim()
                } else if (header.includes('email')) {
                  staffMember.email = String(value).trim()
                } else if (header.includes('note')) {
                  staffMember.notes = String(value).trim()
                }
              }
            })
            
            if (staffMember.name && staffMember.role) {
              staffData.push(staffMember)
            }
          }
          
          resolve(staffData)
          
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  showImportResults(data) {
    const resultsDiv = document.getElementById('importResults')
    const { results } = data
    
    let content = `
      <div class="bg-white border rounded-lg p-4">
        <h4 class="font-semibold text-gray-800 mb-3">
          <i class="fas fa-chart-bar mr-2"></i>Import Summary
        </h4>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center p-3 bg-green-50 border border-green-200 rounded">
            <div class="text-2xl font-bold text-green-600">${results.successful}</div>
            <div class="text-sm text-green-700">Successful</div>
          </div>
          <div class="text-center p-3 bg-red-50 border border-red-200 rounded">
            <div class="text-2xl font-bold text-red-600">${results.failed}</div>
            <div class="text-sm text-red-700">Failed</div>
          </div>
        </div>
    `
    
    if (results.errors && results.errors.length > 0) {
      content += `
        <div class="mb-4">
          <h5 class="font-medium text-red-800 mb-2">Errors:</h5>
          <div class="bg-red-50 border border-red-200 rounded p-3 max-h-32 overflow-y-auto">
            ${results.errors.map(error => `<div class="text-sm text-red-700 mb-1">• ${error}</div>`).join('')}
          </div>
        </div>
      `
    }
    
    if (results.successful > 0) {
      content += `
        <div class="mt-4">
          <button onclick="app.viewImportedStaff()" 
                  class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-eye mr-2"></i>View Imported Staff Members
          </button>
        </div>
      `
    }
    
    content += '</div>'
    
    resultsDiv.innerHTML = content
    resultsDiv.classList.remove('hidden')
  }

  async viewImportedStaff() {
    // Refresh store data and go back to store view
    await this.openStore(this.currentStore.store.id)
  }

  // ===== STORES BULK IMPORT FUNCTIONALITY =====

  showStoresBulkImportForm() {
    const content = `
      <div class="space-y-6">
        <!-- Instructions -->
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 class="font-semibold text-purple-800 mb-2">
            <i class="fas fa-info-circle mr-2"></i>Bulk Import Instructions
          </h4>
          <div class="text-sm text-purple-700 space-y-2">
            <p><strong>Method 1: Excel File Upload</strong></p>
            <p>• Download the template and fill in your store data</p>
            <p>• Upload the Excel file (.xlsx, .xls, or .csv)</p>
            <p><strong>Method 2: Copy & Paste</strong></p>
            <p>• Copy data directly from Excel, Google Sheets, or any spreadsheet</p>
            <p>• Paste into the text area below</p>
            <p><strong>Custom Fields:</strong> Any additional columns will automatically become custom sections!</p>
          </div>
          <div class="mt-3 flex space-x-3">
            <a href="/api/excel-template/stores" target="_blank" 
               class="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition duration-200">
              <i class="fas fa-download mr-2"></i>Download Template
            </a>
            <button onclick="app.showSampleStoresData()" 
                    class="inline-flex items-center bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded text-sm transition duration-200">
              <i class="fas fa-eye mr-2"></i>View Sample Data
            </button>
          </div>
        </div>
        
        <!-- Import Methods Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button id="fileUploadTab" onclick="app.switchImportMethod('file')" 
                    class="py-2 px-1 border-b-2 border-purple-500 font-medium text-sm text-purple-600">
              <i class="fas fa-file-excel mr-1"></i>File Upload
            </button>
            <button id="copyPasteTab" onclick="app.switchImportMethod('paste')" 
                    class="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
              <i class="fas fa-clipboard mr-1"></i>Copy & Paste
            </button>
          </nav>
        </div>
        
        <!-- File Upload Method -->
        <div id="fileUploadMethod" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-file-excel text-green-600 mr-1"></i>
              Select Excel File
            </label>
            <input type="file" id="storesExcelFile" accept=".xlsx,.xls,.csv" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <p class="text-xs text-gray-500 mt-1">Supported formats: .xlsx, .xls, .csv</p>
          </div>
        </div>
        
        <!-- Copy & Paste Method -->
        <div id="copyPasteMethod" class="space-y-4 hidden">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-clipboard text-blue-600 mr-1"></i>
              Paste Spreadsheet Data
            </label>
            <textarea id="storesPasteData" rows="8" placeholder="Paste your spreadsheet data here (including headers)...

Example:
Account	Contact	Phone Number	Store Address	Notes
Diamond Dreams	Sarah Johnson	(310) 555-0123	123 Main St, Beverly Hills	Luxury jewelry store
Golden Touch	David Williams	(323) 555-0456	456 Oak Ave, Los Angeles	Family jewelry store"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"></textarea>
            <p class="text-xs text-gray-500 mt-1">Tip: Include headers in the first row. Tab-separated values work best.</p>
          </div>
        </div>
        
        <!-- Import Progress -->
        <div id="storesImportProgress" class="hidden">
          <div class="bg-gray-200 rounded-full h-2">
            <div id="storesProgressBar" class="bg-purple-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
          <p id="storesProgressText" class="text-sm text-gray-600 mt-2">Processing...</p>
        </div>
        
        <!-- Import Results -->
        <div id="storesImportResults" class="hidden space-y-3"></div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-3 pt-4">
          <button id="importStoresBtn" onclick="app.processStoresImport()" 
                  class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-upload mr-2"></i>Import Stores
          </button>
          <button type="button" onclick="app.closeModal('storeModal')"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition duration-200">
            Close
          </button>
        </div>
      </div>
    `
    
    document.getElementById('storeModalContent').innerHTML = content
    this.showModal('storeModal')
  }

  switchImportMethod(method) {
    const fileTab = document.getElementById('fileUploadTab')
    const pasteTab = document.getElementById('copyPasteTab')
    const fileMethod = document.getElementById('fileUploadMethod')
    const pasteMethod = document.getElementById('copyPasteMethod')
    
    if (method === 'file') {
      fileTab.className = 'py-2 px-1 border-b-2 border-purple-500 font-medium text-sm text-purple-600'
      pasteTab.className = 'py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700'
      fileMethod.classList.remove('hidden')
      pasteMethod.classList.add('hidden')
    } else {
      pasteTab.className = 'py-2 px-1 border-b-2 border-purple-500 font-medium text-sm text-purple-600'
      fileTab.className = 'py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700'
      pasteMethod.classList.remove('hidden')
      fileMethod.classList.add('hidden')
    }
  }

  showSampleStoresData() {
    const sampleData = `Account	Contact	Phone Number	Store Address	Website	Facebook Link	Email Address	Monday Store Hours	Tuesday Store Hours	Wednesday Store Hours	Thursday Store Hours	Friday Store Hours	Saturday Store Hours	Sunday Store Hours	Notes	Net Sales FY 2025	Net Sales FY 2024	Net Sales FY 2023	23 + '24	Status
Diamond Dreams	Sarah Johnson	(310) 555-0123	123 Main St, Beverly Hills, CA 90210	www.diamonddreams.com	facebook.com/diamonddreams	info@diamonddreams.com	10:00 AM - 7:00 PM	10:00 AM - 7:00 PM	10:00 AM - 7:00 PM	10:00 AM - 7:00 PM	10:00 AM - 8:00 PM	9:00 AM - 6:00 PM	12:00 PM - 5:00 PM	Luxury diamond jewelry and custom engagement rings	$485000	$420000	$385000	$805000	Active
Golden Touch Jewelry	David Williams	(323) 555-0456	456 Oak Avenue, Los Angeles, CA 90028	www.goldentouch.com	facebook.com/goldentouch	contact@goldentouch.com	9:00 AM - 6:00 PM	9:00 AM - 6:00 PM	9:00 AM - 6:00 PM	9:00 AM - 6:00 PM	9:00 AM - 7:00 PM	9:00 AM - 6:00 PM	Closed	Family-owned jewelry store specializing in gold and silver pieces	$325000	$298000	$276000	$574000	Active
Precious Gems Co.	Michael Chen	(424) 555-0789	789 Sunset Blvd, West Hollywood, CA 90069	www.preciousgems.com	facebook.com/preciousgems	hello@preciousgems.com	11:00 AM - 8:00 PM	11:00 AM - 8:00 PM	11:00 AM - 8:00 PM	11:00 AM - 8:00 PM	11:00 AM - 8:00 PM	10:00 AM - 6:00 PM	Closed	Fine jewelry with rare gemstones and vintage collections	$295000	$310000	$285000	$595000	Active`
    
    document.getElementById('storesPasteData').value = sampleData
    this.switchImportMethod('paste')
  }

  async processStoresImport() {
    const importBtn = document.getElementById('importStoresBtn')
    const progressDiv = document.getElementById('storesImportProgress')
    const progressBar = document.getElementById('storesProgressBar')
    const progressText = document.getElementById('storesProgressText')
    const resultsDiv = document.getElementById('storesImportResults')
    
    const fileInput = document.getElementById('storesExcelFile')
    const pasteData = document.getElementById('storesPasteData').value.trim()
    
    // Check if data is provided
    if (!fileInput.files[0] && !pasteData) {
      this.showNotification('Please provide data either by uploading a file or pasting spreadsheet data', 'error')
      return
    }
    
    // Show progress
    importBtn.disabled = true
    importBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...'
    progressDiv.classList.remove('hidden')
    resultsDiv.classList.add('hidden')
    
    try {
      let storeData
      
      if (fileInput.files[0]) {
        // File upload method
        progressBar.style.width = '25%'
        progressText.textContent = 'Reading Excel file...'
        storeData = await this.parseStoresExcelFile(fileInput.files[0])
      } else {
        // Copy-paste method
        progressBar.style.width = '25%'
        progressText.textContent = 'Parsing pasted data...'
        storeData = this.parsePastedStoresData(pasteData)
      }
      
      if (!storeData || storeData.length === 0) {
        throw new Error('No valid store data found')
      }
      
      // Update progress
      progressBar.style.width = '50%'
      progressText.textContent = `Found ${storeData.length} stores. Importing...`
      
      // Send to API
      const response = await axios.post('/api/stores/bulk-import', {
        store_data: storeData
      })
      
      // Update progress
      progressBar.style.width = '100%'
      progressText.textContent = 'Import completed!'
      
      // Show results
      this.showStoresImportResults(response.data)
      
      // Success notification
      this.showNotification(response.data.message, 'success')
      
    } catch (error) {
      console.error('Import error:', error)
      this.showNotification(`Import failed: ${error.message}`, 'error')
      
      // Show error in results
      resultsDiv.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-semibold text-red-800 mb-2">Import Failed</h4>
          <p class="text-red-700">${error.message}</p>
        </div>
      `
      resultsDiv.classList.remove('hidden')
    } finally {
      // Reset button
      importBtn.disabled = false
      importBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Import Stores'
      
      // Hide progress after delay
      setTimeout(() => {
        progressDiv.classList.add('hidden')
        progressBar.style.width = '0%'
      }, 2000)
    }
  }

  async parseStoresExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: ''
          })
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'))
            return
          }
          
          const storeData = this.processStoresData(jsonData)
          resolve(storeData)
          
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  parsePastedStoresData(pasteData) {
    try {
      // Split into rows and handle different line endings
      const rows = pasteData.split(/\r?\n/).filter(row => row.trim())
      
      if (rows.length < 2) {
        throw new Error('Pasted data must have at least a header row and one data row')
      }
      
      // Split each row by tabs (most common) or commas (CSV fallback)
      const jsonData = rows.map(row => {
        // Try tab-separated first, then comma-separated
        let cells = row.split('\t')
        if (cells.length === 1) {
          cells = row.split(',').map(cell => cell.replace(/^["']|["']$/g, '').trim())
        }
        return cells
      })
      
      return this.processStoresData(jsonData)
      
    } catch (error) {
      throw new Error(`Failed to parse pasted data: ${error.message}`)
    }
  }

  processStoresData(jsonData) {
    // Get headers (first row)
    const headers = jsonData[0].map(h => String(h).toLowerCase().trim())
    
    // Map data rows to objects
    const storeData = []
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      
      // Skip empty rows
      if (row.every(cell => !cell || String(cell).trim() === '')) {
        continue
      }
      
      const store = {}
      
      // Map columns based on header names (intelligent mapping)
      headers.forEach((header, index) => {
        const value = row[index]
        if (value && String(value).trim()) {
          const cleanValue = String(value).trim()
          
          // Map common header variations to standard field names
          if (header.includes('account') || header.includes('name') || header === 'store') {
            store.Account = cleanValue
          } else if (header.includes('desc') || header.includes('notes')) {
            store.Notes = cleanValue
          } else {
            // All other fields become custom sections automatically
            // Preserve original header name for better mapping
            const originalHeader = jsonData[0][index] // Get original case
            store[originalHeader] = cleanValue
          }
        }
      })
      
      if (store.Account || store.name) {
        storeData.push(store)
      }
    }
    
    return storeData
  }

  showStoresImportResults(data) {
    const resultsDiv = document.getElementById('storesImportResults')
    const { results } = data
    
    let content = `
      <div class="bg-white border rounded-lg p-4">
        <h4 class="font-semibold text-gray-800 mb-3">
          <i class="fas fa-chart-bar mr-2"></i>Import Summary
        </h4>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center p-3 bg-green-50 border border-green-200 rounded">
            <div class="text-2xl font-bold text-green-600">${results.successful}</div>
            <div class="text-sm text-green-700">Successful</div>
          </div>
          <div class="text-center p-3 bg-red-50 border border-red-200 rounded">
            <div class="text-2xl font-bold text-red-600">${results.failed}</div>
            <div class="text-sm text-red-700">Failed</div>
          </div>
        </div>
    `
    
    if (results.errors && results.errors.length > 0) {
      content += `
        <div class="mb-4">
          <h5 class="font-medium text-red-800 mb-2">Errors:</h5>
          <div class="bg-red-50 border border-red-200 rounded p-3 max-h-32 overflow-y-auto">
            ${results.errors.map(error => `<div class="text-sm text-red-700 mb-1">• ${error}</div>`).join('')}
          </div>
        </div>
      `
    }
    
    if (results.successful > 0) {
      content += `
        <div class="mt-4">
          <button onclick="app.viewImportedStores()" 
                  class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <i class="fas fa-eye mr-2"></i>View Imported Stores
          </button>
        </div>
      `
    }
    
    content += '</div>'
    
    resultsDiv.innerHTML = content
    resultsDiv.classList.remove('hidden')
  }

  async viewImportedStores() {
    // Refresh stores list and close modal
    await this.loadStores()
    this.closeModal('storeModal')
    this.showNotification('Stores refreshed! Check out your newly imported stores below.', 'success')
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    const bgColor = type === 'success' ? 'bg-green-600' : 
                   type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-full`
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full')
    }, 100)
    
    // Auto remove
    setTimeout(() => {
      notification.classList.add('translate-x-full')
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new JewelryStoreApp()
})