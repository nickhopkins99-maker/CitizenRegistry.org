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

    // Site data button
    document.getElementById('siteDataBtn').addEventListener('click', () => {
      this.showSiteDataModal()
    })

    // Filter and sort controls
    document.getElementById('storeFilter').addEventListener('change', () => {
      this.applyFiltersAndSort()
    })

    document.getElementById('storeSort').addEventListener('change', () => {
      this.applyFiltersAndSort()
    })

    document.getElementById('clearFilters').addEventListener('click', () => {
      this.clearFilters()
    })

    // Close modals
    document.getElementById('closeStoreModal').addEventListener('click', () => {
      this.closeModal('storeModal')
    })

    document.getElementById('closeStaffModal').addEventListener('click', () => {
      this.closeModal('staffModal')
    })

    document.getElementById('closeSiteDataModal').addEventListener('click', () => {
      this.closeModal('siteDataModal')
    })

    // Today's Visit button
    document.getElementById('todaysVisitBtn').addEventListener('click', () => {
      this.showVisitModal()
    })

    document.getElementById('closeVisitModal').addEventListener('click', () => {
      this.closeModal('visitModal')
    })

    // Calendar button
    document.getElementById('calendarBtn').addEventListener('click', () => {
      this.showCalendarModal()
    })

    document.getElementById('closeCalendarModal').addEventListener('click', () => {
      this.closeModal('calendarModal')
    })

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout()
    })

    // Map button
    document.getElementById('mapBtn').addEventListener('click', () => {
      this.showMapModal()
    })

    document.getElementById('closeMapModal').addEventListener('click', () => {
      this.closeModal('mapModal')
    })

    // Click outside modal to close
    document.getElementById('storeModal').addEventListener('click', (e) => {
      if (e.target.id === 'storeModal') this.closeModal('storeModal')
    })

    document.getElementById('staffModal').addEventListener('click', (e) => {
      if (e.target.id === 'staffModal') this.closeModal('staffModal')
    })

    document.getElementById('siteDataModal').addEventListener('click', (e) => {
      if (e.target.id === 'siteDataModal') this.closeModal('siteDataModal')
    })

    document.getElementById('visitModal').addEventListener('click', (e) => {
      if (e.target.id === 'visitModal') this.closeModal('visitModal')
    })

    document.getElementById('calendarModal').addEventListener('click', (e) => {
      if (e.target.id === 'calendarModal') this.closeModal('calendarModal')
    })

    document.getElementById('mapModal').addEventListener('click', (e) => {
      if (e.target.id === 'mapModal') this.closeModal('mapModal')
    })

    // General modal
    document.getElementById('closeGeneralModal').addEventListener('click', () => {
      this.closeModal('generalModal')
    })
    
    document.getElementById('generalModal').addEventListener('click', (e) => {
      if (e.target.id === 'generalModal') this.closeModal('generalModal')
    })
  }

  async loadStores() {
    try {
      const response = await axios.get('/api/stores')
      this.stores = response.data
      this.renderStores()
      
      // Apply any existing filters after loading
      if (document.getElementById('storeFilter')) {
        this.applyFiltersAndSort()
      }
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

  getStoreHours(store) {
    if (!store.custom_sections || !Array.isArray(store.custom_sections)) {
      return []
    }
    
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const hours = []
    
    dayNames.forEach(day => {
      const hoursSection = store.custom_sections.find(section => {
        const sectionName = section.section_name.toLowerCase()
        return sectionName.includes(day) && sectionName.includes('hours')
      })
      
      if (hoursSection && hoursSection.section_value) {
        hours.push({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          hours: hoursSection.section_value
        })
      }
    })
    
    return hours
  }

  renderCustomSections(store) {
    if (!store.custom_sections || !Array.isArray(store.custom_sections)) {
      return '<div class="col-span-full text-amber-600 text-center py-4">No additional details available</div>'
    }
    
    // Filter out hours and address sections (they're displayed separately)
    const excludeTerms = ['hours', 'address', 'location']
    const filteredSections = store.custom_sections.filter(section => {
      const sectionName = section.section_name.toLowerCase()
      return !excludeTerms.some(term => sectionName.includes(term))
    })
    
    if (filteredSections.length === 0) {
      return '<div class="col-span-full text-amber-600 text-center py-4">No additional details available</div>'
    }
    
    return filteredSections.map(section => `
      <div class="p-3 border border-amber-200 bg-amber-50 rounded-lg">
        <h4 class="font-semibold text-amber-900 text-sm mb-1">${section.section_name}</h4>
        <p class="text-amber-800 text-sm">${section.section_value || 'Not specified'}</p>
      </div>
    `).join('')
  }

  renderStores() {
    // Apply current filters and sort before rendering
    const filteredAndSortedStores = this.getFilteredAndSortedStores()
    
    const storesList = document.getElementById('storesList')
    
    if (this.stores.length === 0) {
      storesList.innerHTML = `
        <div class="text-center text-amber-600 py-8">
          <i class="fas fa-store text-4xl mb-4" aria-hidden="true"></i>
          <p>No jewelry stores added yet. Click "Add Store" to get started!</p>
        </div>
      `
      return
    }

    if (filteredAndSortedStores.length === 0) {
      storesList.innerHTML = `
        <div class="text-center text-amber-600 py-8">
          <i class="fas fa-filter text-4xl mb-4" aria-hidden="true"></i>
          <p>No accounts match your current filters.</p>
          <button onclick="app.clearFilters()" class="mt-2 text-blue-600 hover:text-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none underline px-2 py-1 rounded"
                  aria-label="Clear all filters to show all accounts"
                  tabindex="0">
            Clear filters to see all accounts
          </button>
        </div>
      `
      return
    }

    storesList.innerHTML = filteredAndSortedStores.map(store => `
      <div class="border border-amber-200 bg-amber-25 rounded-lg p-4 hover:shadow-md hover:bg-amber-50 focus-within:ring-4 focus-within:ring-blue-300 transition duration-200 cursor-pointer" 
           onclick="app.openStore(${store.id})"
           role="button"
           tabindex="0"
           aria-label="Open details for ${store.name}"
           onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); app.openStore(${store.id}); }">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            ${store.logo_url ? 
              `<img src="${store.logo_url}" alt="Logo for ${store.name}" class="w-12 h-12 rounded-full object-cover">` : 
              `<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center" aria-label="Default store icon">
                <i class="fas fa-gem text-blue-600" aria-hidden="true"></i>
               </div>`
            }
            <div>
              <h3 class="font-semibold text-amber-900">${store.name}</h3>
              <p class="text-sm text-amber-700">${this.getStoreAddress(store) || 'No address available'}</p>
            </div>
          </div>
          <div class="flex space-x-2" role="group" aria-label="Store actions for ${store.name}">
            <button onclick="event.stopPropagation(); app.editStore(${store.id})" 
                    class="text-blue-600 hover:text-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none p-2 rounded"
                    aria-label="Edit ${store.name}"
                    tabindex="0">
              <i class="fas fa-edit" aria-hidden="true"></i>
            </button>
            <button onclick="event.stopPropagation(); app.deleteStore(${store.id})" 
                    class="text-red-600 hover:text-red-800 focus:ring-4 focus:ring-red-300 focus:outline-none p-2 rounded"
                    aria-label="Delete ${store.name}"
                    tabindex="0">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('')
  }

  showAddStoreForm() {
    const content = `
      <form id="storeForm" class="space-y-4" role="form" aria-labelledby="addStoreTitle">
        <h2 id="addStoreTitle" class="text-xl font-semibold text-amber-900 mb-4">Add New Jewelry Store</h2>
        
        <div>
          <label for="storeName" class="block text-sm font-medium text-amber-900 mb-2">Store Name *</label>
          <input type="text" id="storeName" name="storeName" required 
                 class="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-amber-900"
                 aria-describedby="storeNameHelp">
          <div id="storeNameHelp" class="text-xs text-amber-700 mt-1">Enter the official name of your jewelry store</div>
        </div>
        
        <div>
          <label for="storeDescription" class="block text-sm font-medium text-amber-900 mb-2">Description</label>
          <textarea id="storeDescription" name="storeDescription" rows="3"
                    class="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-amber-900"
                    aria-describedby="storeDescriptionHelp"></textarea>
          <div id="storeDescriptionHelp" class="text-xs text-amber-700 mt-1">Optional: Brief description of your store</div>
        </div>
        
        <div>
          <label for="storeLogo" class="block text-sm font-medium text-amber-900 mb-2">Logo</label>
          <input type="file" id="storeLogo" name="storeLogo" accept="image/*" 
                 class="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:outline-none bg-white text-amber-900"
                 aria-describedby="storeLogoHelp">
          <div id="storeLogoHelp" class="text-xs text-amber-700 mt-1">Optional: Upload a logo image for your store</div>
        </div>
        
        <div class="flex space-x-3 pt-4" role="group" aria-label="Form actions">
          <button type="submit" 
                  class="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none text-white py-2 px-4 rounded-lg transition duration-200"
                  aria-label="Save new store information">
            <i class="fas fa-save mr-2" aria-hidden="true"></i>Save Store
          </button>
          <button type="button" onclick="app.closeModal('storeModal')"
                  class="flex-1 bg-amber-300 hover:bg-amber-400 focus:ring-4 focus:ring-amber-300 focus:outline-none text-amber-900 py-2 px-4 rounded-lg transition duration-200"
                  aria-label="Cancel and close form">
            <i class="fas fa-times mr-2" aria-hidden="true"></i>Cancel
          </button>
        </div>
      </form>
    `
    
    document.getElementById('storeModalContent').innerHTML = content
    document.getElementById('storeForm').addEventListener('submit', (e) => this.handleStoreSubmit(e))
    this.showModal('storeModal')
  }

  showSiteDataModal() {
    const content = `
      <div class="space-y-6" role="main" aria-labelledby="siteDataModalTitle">
        <!-- Database Overview Section -->
        <div class="bg-blue-50 rounded-lg p-6 border border-blue-200" role="region" aria-labelledby="statsTitle">
          <h4 id="statsTitle" class="text-lg font-semibold text-blue-800 mb-4">
            <i class="fas fa-info-circle mr-2" aria-label="Information icon"></i>
            Database Overview
          </h4>
          <div id="databaseStats" class="grid grid-cols-1 md:grid-cols-3 gap-4" role="group" aria-label="Database statistics">
            <div class="bg-amber-25 border border-amber-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-store text-blue-600 text-2xl" aria-label="Stores icon"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm text-amber-800">Total Stores</p>
                  <p id="totalStores" class="text-2xl font-semibold text-amber-900" aria-live="polite">--</p>
                </div>
              </div>
            </div>
            <div class="bg-amber-25 border border-amber-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-users text-blue-600 text-2xl" aria-label="Staff icon"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm text-amber-800">Total Staff</p>
                  <p id="totalStaff" class="text-2xl font-semibold text-amber-900" aria-live="polite">--</p>
                </div>
              </div>
            </div>
            <div class="bg-amber-25 border border-amber-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-tags text-blue-600 text-2xl" aria-label="Custom fields icon"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm text-amber-800">Custom Fields</p>
                  <p id="totalCustomFields" class="text-2xl font-semibold text-amber-900" aria-live="polite">--</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Export Section -->
        <div class="bg-amber-100 rounded-lg p-6 border border-amber-200" role="region" aria-labelledby="exportTitle">
          <h4 id="exportTitle" class="text-lg font-semibold text-amber-900 mb-4">
            <i class="fas fa-download mr-2" aria-label="Download icon"></i>
            Export Data
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Data export options">
            <button id="exportStoresBtn" class="flex items-center justify-center px-4 py-3 bg-amber-25 border border-amber-300 rounded-lg hover:bg-amber-50 focus:ring-4 focus:ring-blue-300 focus:outline-none transition duration-200"
                    aria-label="Export all stores data to Excel file">
              <i class="fas fa-file-excel text-blue-600 mr-3" aria-hidden="true"></i>
              <div class="text-left">
                <div class="font-medium text-amber-900">Export All Stores</div>
                <div class="text-sm text-amber-800">Download stores data as Excel</div>
              </div>
            </button>
            <button id="exportStaffBtn" class="flex items-center justify-center px-4 py-3 bg-amber-25 border border-amber-300 rounded-lg hover:bg-amber-50 focus:ring-4 focus:ring-blue-300 focus:outline-none transition duration-200"
                    aria-label="Export all staff data to Excel file">
              <i class="fas fa-file-csv text-blue-600 mr-3" aria-hidden="true"></i>
              <div class="text-left">
                <div class="font-medium text-amber-900">Export All Staff</div>
                <div class="text-sm text-amber-800">Download staff data as Excel</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Database Management Section -->
        <div class="bg-amber-100 rounded-lg p-6 border border-amber-200" role="region" aria-labelledby="managementTitle">
          <h4 id="managementTitle" class="text-lg font-semibold text-amber-900 mb-4">
            <i class="fas fa-tools mr-2" aria-label="Tools icon"></i>
            Database Management
          </h4>
          <div class="space-y-3" role="group" aria-label="Database management options">
            <button id="viewRawDataBtn" class="w-full flex items-center justify-between px-4 py-3 bg-amber-25 border border-amber-300 rounded-lg hover:bg-amber-50 focus:ring-4 focus:ring-blue-300 focus:outline-none transition duration-200"
                    aria-label="View raw database tables and records">
              <div class="flex items-center">
                <i class="fas fa-table text-blue-600 mr-3" aria-hidden="true"></i>
                <div class="text-left">
                  <div class="font-medium text-amber-900">View Raw Database</div>
                  <div class="text-sm text-amber-800">Inspect database tables and records</div>
                </div>
              </div>
              <i class="fas fa-chevron-right text-amber-600" aria-hidden="true"></i>
            </button>
            <button id="backupDataBtn" class="w-full flex items-center justify-between px-4 py-3 bg-amber-25 border border-amber-300 rounded-lg hover:bg-amber-50 focus:ring-4 focus:ring-blue-300 focus:outline-none transition duration-200"
                    aria-label="Create a backup of all database data">
              <div class="flex items-center">
                <i class="fas fa-save text-blue-600 mr-3" aria-hidden="true"></i>
                <div class="text-left">
                  <div class="font-medium text-amber-900">Backup Database</div>
                  <div class="text-sm text-amber-800">Create a backup of all data</div>
                </div>
              </div>
              <i class="fas fa-chevron-right text-amber-600" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <!-- Recent Activity Section -->
        <div class="bg-amber-50 rounded-lg p-6 border border-amber-200" role="region" aria-labelledby="activityTitle">
          <h4 id="activityTitle" class="text-lg font-semibold text-amber-900 mb-4">
            <i class="fas fa-clock mr-2" aria-label="Clock icon"></i>
            Recent Activity
          </h4>
          <div id="recentActivity" class="space-y-3" role="log" aria-live="polite" aria-label="Recent activity log">
            <div class="text-center text-amber-600 py-4">
              <i class="fas fa-spinner fa-spin text-2xl mb-2" aria-label="Loading icon"></i>
              <p>Loading recent activity...</p>
            </div>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('siteDataContent').innerHTML = content
    this.loadSiteDataStats()
    this.setupSiteDataEventListeners()
    this.showModal('siteDataModal')
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

  async loadSiteDataStats() {
    try {
      // Load database statistics
      const statsResponse = await axios.get('/api/site-data/stats')
      const stats = statsResponse.data
      
      document.getElementById('totalStores').textContent = stats.totalStores || 0
      document.getElementById('totalStaff').textContent = stats.totalStaff || 0
      document.getElementById('totalCustomFields').textContent = stats.totalCustomFields || 0
      
      // Load recent activity
      const activityResponse = await axios.get('/api/site-data/activity')
      const activities = activityResponse.data
      
      const activityHtml = activities.length > 0 
        ? activities.slice(0, 5).map(activity => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border">
              <div class="flex-shrink-0">
                <i class="fas ${activity.icon} text-${activity.color}-600"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">${activity.title}</p>
                <p class="text-xs text-gray-600">${activity.description}</p>
                <p class="text-xs text-gray-500 mt-1">${activity.timestamp}</p>
              </div>
            </div>
          `).join('')
        : `<div class="text-center text-gray-500 py-4">
            <i class="fas fa-history text-2xl mb-2"></i>
            <p>No recent activity</p>
           </div>`
      
      document.getElementById('recentActivity').innerHTML = activityHtml
    } catch (error) {
      console.error('Error loading site data stats:', error)
      document.getElementById('totalStores').textContent = 'Error'
      document.getElementById('totalStaff').textContent = 'Error'
      document.getElementById('totalCustomFields').textContent = 'Error'
      document.getElementById('recentActivity').innerHTML = `
        <div class="text-center text-red-500 py-4">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Error loading data</p>
        </div>`
    }
  }

  setupSiteDataEventListeners() {
    // Export buttons
    document.getElementById('exportStoresBtn').addEventListener('click', () => {
      this.exportData('stores')
    })
    
    document.getElementById('exportStaffBtn').addEventListener('click', () => {
      this.exportData('staff')
    })
    
    // Database management buttons
    document.getElementById('viewRawDataBtn').addEventListener('click', () => {
      this.showRawDatabase()
    })
    
    document.getElementById('backupDataBtn').addEventListener('click', () => {
      this.backupDatabase()
    })
  }

  async exportData(type) {
    try {
      const button = document.getElementById(`export${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Exporting...'
      button.disabled = true
      
      const response = await axios.get(`/api/site-data/export/${type}`, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully!`, 'success')
    } catch (error) {
      console.error(`Error exporting ${type}:`, error)
      this.showNotification(`Error exporting ${type} data`, 'error')
    } finally {
      const button = document.getElementById(`export${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)
      button.innerHTML = `<i class="fas fa-file-excel mr-2"></i>Export All ${type.charAt(0).toUpperCase() + type.slice(1)}`
      button.disabled = false
    }
  }

  showRawDatabase() {
    // This could open another modal or navigate to a database viewer
    this.showNotification('Raw database viewer coming soon!', 'info')
  }

  backupDatabase() {
    // This would trigger a database backup
    this.showNotification('Database backup feature coming soon!', 'info')
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

  uploadStorePicture(storeId) {
    // Create a hidden file input element
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'
    
    // Handle file selection
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      try {
        // Show loading state
        const button = document.querySelector(`button[onclick="app.uploadStorePicture(${storeId})"]`)
        if (button) {
          button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Uploading...'
          button.disabled = true
        }
        
        // Create FormData and upload file
        const formData = new FormData()
        formData.append('file', file)
        
        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        // Update store with new picture URL (you may want to store multiple pictures)
        // For now, we'll add it to a pictures array or similar
        // This depends on your backend implementation
        
        this.showNotification('Picture uploaded successfully!', 'success')
        
        // Refresh the store details to show new picture
        await this.openStore(storeId)
        
      } catch (error) {
        console.error('Error uploading picture:', error)
        this.showNotification('Error uploading picture', 'error')
      } finally {
        // Reset button state
        const button = document.querySelector(`button[onclick="app.uploadStorePicture(${storeId})"]`)
        if (button) {
          button.innerHTML = '<i class="fas fa-camera mr-1"></i>Add Photo'
          button.disabled = false
        }
      }
    })
    
    // Trigger file selection
    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  }

  showStoreDetails() {
    const { store, staff } = this.currentStore
    
    // Get store hours from custom sections
    const storeHours = this.getStoreHours(store)
    
    // Check for RJO affiliation
    const rjoAffiliation = store.name && store.name.toUpperCase().includes('RJO') ? 'RJO' : 'N/A'
    
    const content = `
      <div class="max-w-6xl mx-auto">
        <!-- Store Header Section -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center space-x-6">
              ${store.logo_url ? 
                `<img src="${store.logo_url}" alt="${store.name}" class="w-20 h-20 rounded-full object-cover shadow-md">` :
                `<div class="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <i class="fas fa-gem text-white text-2xl"></i>
                 </div>`
              }
              <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">${store.name}</h1>
                <p class="text-gray-600 mb-2">${this.getStoreAddress(store) || 'No address available'}</p>
                ${store.description ? `<p class="text-sm text-gray-500">${store.description}</p>` : ''}
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex space-x-2">
              <button onclick="app.editStoreProfile(${store.id})" 
                      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                <i class="fas fa-edit mr-2"></i>Edit Account
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Store Pictures Section -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">
                <i class="fas fa-images text-blue-600 mr-2"></i>
                Store Pictures
              </h3>
              <button onclick="app.uploadStorePicture(${store.id})" 
                      class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200">
                <i class="fas fa-camera mr-1"></i>Add Photo
              </button>
            </div>
            <div id="storePictures-${store.id}" class="grid grid-cols-2 gap-3">
              <!-- Store pictures will be loaded here -->
              <div class="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div class="text-center text-gray-500">
                  <i class="fas fa-camera text-2xl mb-2"></i>
                  <p class="text-sm">Add Store Photos</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Store Hours Section -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              <i class="fas fa-clock text-green-600 mr-2"></i>
              Store Hours
            </h3>
            <div class="space-y-2">
              ${storeHours.length > 0 ? 
                storeHours.map(hours => `
                  <div class="flex justify-between py-1">
                    <span class="font-medium text-gray-700">${hours.day}:</span>
                    <span class="text-gray-600">${hours.hours}</span>
                  </div>
                `).join('') :
                `<div class="text-center text-gray-500 py-4">
                  <i class="fas fa-clock text-2xl mb-2"></i>
                  <p class="text-sm">No store hours available</p>
                </div>`
              }
            </div>
          </div>
        </div>

        <!-- Affiliations Section -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-handshake text-purple-600 mr-2"></i>
            Affiliations:
          </h3>
          <div class="flex items-center space-x-3">
            <span class="px-3 py-1 rounded-full text-sm font-medium ${rjoAffiliation === 'RJO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
              ${rjoAffiliation}
            </span>
          </div>
        </div>

        <!-- Contact & Details Section -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-info-circle text-blue-600 mr-2"></i>
            Account Details
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${this.renderCustomSections(store)}
          </div>
        </div>
        
        <!-- Staff Section -->
        <div class="bg-white rounded-lg shadow-sm p-6">
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
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${staff.length === 0 ? 
              `<div class="col-span-full text-center text-gray-500 py-8">
                <i class="fas fa-user-plus text-4xl mb-3"></i>
                <p class="mb-2">No staff members added yet</p>
                <p class="text-sm">Click "Add Staff" or "Import Excel" to get started</p>
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
        
        <!-- Visit History Section -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-calendar-alt text-green-600 mr-2"></i>
            Visit History
          </h3>
          <div id="visitHistory-${store.id}" class="space-y-3">
            <div class="flex items-center justify-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span class="ml-2 text-sm text-gray-500">Loading visit history...</span>
            </div>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('storeModalContent').innerHTML = content
    this.loadVisitHistory(store.id)
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

  async logout() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await axios.post('/api/logout')
        window.location.reload()
      } catch (error) {
        console.error('Logout error:', error)
        alert('Error logging out. Please try refreshing the page.')
      }
    }
  }

  showVisitModal() {
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    const currentTime = new Date().toTimeString().slice(0, 5) // Get current time in HH:MM format
    
    const content = `
      <form id="visitForm" class="space-y-6" role="form" aria-labelledby="visitFormTitle">
        <h4 id="visitFormTitle" class="text-lg font-semibold text-gray-900 mb-4">Record Account Visit</h4>
        
        <!-- Account Selection -->
        <div>
          <label for="visitAccountSelect" class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-building mr-1" aria-hidden="true"></i>
            Account Name *
          </label>
          <select id="visitAccountSelect" name="storeId" required 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                  aria-describedby="accountHelp">
            <option value="">-- Select an account --</option>
            ${this.stores.map(store => `
              <option value="${store.id}">${store.name}</option>
            `).join('')}
          </select>
          <div id="accountHelp" class="text-xs text-gray-600 mt-1">Choose the account you visited today</div>
        </div>
        
        <!-- Visit Date -->
        <div>
          <label for="visitDate" class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-calendar mr-1" aria-hidden="true"></i>
            Visit Date *
          </label>
          <input type="date" id="visitDate" name="visitDate" required 
                 value="${today}"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                 aria-describedby="dateHelp">
          <div id="dateHelp" class="text-xs text-gray-600 mt-1">Date of your visit</div>
        </div>
        
        <!-- Visit Time -->
        <div>
          <label for="visitTime" class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-clock mr-1" aria-hidden="true"></i>
            Visit Time
          </label>
          <input type="time" id="visitTime" name="visitTime" 
                 value="${currentTime}"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                 aria-describedby="timeHelp">
          <div id="timeHelp" class="text-xs text-gray-600 mt-1">Time of your visit (optional)</div>
        </div>
        
        <!-- Visit Notes -->
        <div>
          <label for="visitNotes" class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-sticky-note mr-1" aria-hidden="true"></i>
            Visit Notes
          </label>
          <textarea id="visitNotes" name="notes" rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                    aria-describedby="notesHelp"
                    placeholder="What happened during this visit? Key discussions, outcomes, next steps, etc."></textarea>
          <div id="notesHelp" class="text-xs text-gray-600 mt-1">Optional: Notes about your visit, discussions, or follow-up items</div>
        </div>
        
        <!-- Submit Buttons -->
        <div class="flex space-x-3 pt-4 border-t border-gray-200" role="group" aria-label="Form actions">
          <button type="submit" 
                  class="flex-1 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none text-white py-3 px-4 rounded-lg transition duration-200 font-medium"
                  aria-label="Save visit record">
            <i class="fas fa-save mr-2" aria-hidden="true"></i>Record Visit
          </button>
          <button type="button" onclick="app.closeModal('visitModal')"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:ring-gray-300 focus:outline-none text-gray-700 py-3 px-4 rounded-lg transition duration-200 font-medium"
                  aria-label="Cancel and close form">
            <i class="fas fa-times mr-2" aria-hidden="true"></i>Cancel
          </button>
        </div>
      </form>
    `
    
    document.getElementById('visitModalContent').innerHTML = content
    document.getElementById('visitForm').addEventListener('submit', (e) => this.handleVisitSubmit(e))
    this.showModal('visitModal')
  }

  async handleVisitSubmit(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const visitData = {
      store_id: parseInt(formData.get('storeId')),
      visit_date: formData.get('visitDate'),
      visit_time: formData.get('visitTime'),
      notes: formData.get('notes')
    }
    
    // Validate required fields
    if (!visitData.store_id || !visitData.visit_date) {
      this.showNotification('Please select an account and visit date', 'error')
      return
    }
    
    try {
      const response = await axios.post('/api/visits', visitData)
      
      if (response.data.id) {
        this.showNotification('Visit recorded successfully!', 'success')
        this.closeModal('visitModal')
        
        // Refresh store list to show any updates
        await this.loadStores()
      } else {
        this.showNotification('Failed to record visit', 'error')
      }
    } catch (error) {
      console.error('Error recording visit:', error)
      this.showNotification(error.response?.data?.error || 'Failed to record visit', 'error')
    }
  }

  async loadVisitHistory(storeId) {
    const visitHistoryDiv = document.getElementById(`visitHistory-${storeId}`)
    
    try {
      const response = await axios.get(`/api/stores/${storeId}/visits`)
      const visits = response.data
      
      if (visits.length === 0) {
        visitHistoryDiv.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-calendar-times text-3xl mb-2"></i>
            <p>No visits recorded yet</p>
            <p class="text-xs mt-1">Use "Today's Visit" button to record your first visit</p>
          </div>
        `
        return
      }
      
      visitHistoryDiv.innerHTML = `
        <div class="space-y-3 max-h-64 overflow-y-auto">
          ${visits.map(visit => {
            const visitDate = new Date(visit.visit_date)
            const formattedDate = visitDate.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
            
            const timeDisplay = visit.visit_time ? 
              ` at ${new Date(`2000-01-01T${visit.visit_time}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}` : ''
            
            return `
              <div class="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-1">
                      <i class="fas fa-calendar text-green-600 mr-2 text-sm"></i>
                      <span class="font-medium text-gray-800">${formattedDate}${timeDisplay}</span>
                    </div>
                    ${visit.notes ? `
                      <div class="mt-2">
                        <i class="fas fa-sticky-note text-blue-500 mr-2 text-sm"></i>
                        <span class="text-sm text-gray-700">${visit.notes}</span>
                      </div>
                    ` : ''}
                    <div class="text-xs text-gray-500 mt-2">
                      <i class="fas fa-clock mr-1"></i>
                      Recorded: ${new Date(visit.created_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </div>
              </div>
            `
          }).join('')}
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-200">
          <button onclick="app.showVisitModal()" 
                  class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200 text-sm font-medium">
            <i class="fas fa-plus mr-2"></i>
            Record New Visit
          </button>
        </div>
      `
    } catch (error) {
      console.error('Error loading visit history:', error)
      visitHistoryDiv.innerHTML = `
        <div class="text-center py-4 text-red-500">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Error loading visit history</p>
        </div>
      `
    }
  }

  async showCalendarModal() {
    try {
      // Fetch all visits for calendar
      const response = await axios.get('/api/calendar/visits')
      const data = response.data
      
      if (!data.success) {
        throw new Error('Failed to load calendar data')
      }
      
      const visitsByDate = data.visitsByDate
      const allVisits = data.visits
      
      // Generate calendar HTML
      const content = `
        <div class="space-y-6">
          <!-- Calendar Header -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-lg font-semibold text-purple-900 mb-1">
                  <i class="fas fa-calendar-check mr-2"></i>
                  Visit Calendar
                </h4>
                <p class="text-sm text-purple-700">
                  Total visits recorded: <span class="font-medium">${data.totalVisits}</span>
                </p>
              </div>
              <button onclick="app.showVisitModal()" 
                      class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium">
                <i class="fas fa-plus mr-2"></i>
                Record New Visit
              </button>
            </div>
          </div>
          
          ${Object.keys(visitsByDate).length === 0 ? `
            <!-- No visits message -->
            <div class="text-center py-12 text-gray-500">
              <i class="fas fa-calendar-times text-4xl mb-4 text-gray-300"></i>
              <h3 class="text-lg font-medium text-gray-600 mb-2">No Visits Recorded Yet</h3>
              <p class="text-gray-500 mb-4">Start tracking your account visits to see them here</p>
              <button onclick="app.showVisitModal()" 
                      class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-200 font-medium">
                <i class="fas fa-calendar-plus mr-2"></i>
                Record Your First Visit
              </button>
            </div>
          ` : `
            <!-- Calendar Layout: Activity Log on Left, Visual Calendar on Right -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Activity Log - Left Side -->
              <div class="lg:col-span-1">
                <h4 class="text-lg font-semibold text-amber-900 mb-4">
                  <i class="fas fa-history text-amber-700 mr-2"></i>
                  Activity Log
                </h4>
                <div class="space-y-3 max-h-96 overflow-y-auto">
                  ${Object.keys(visitsByDate)
                    .sort((a, b) => new Date(b) - new Date(a))
                    .map(date => {
                      const visits = visitsByDate[date]
                      const visitDate = new Date(date)
                      const formattedDate = visitDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                      
                      return `
                        <div class="bg-white border border-amber-200 rounded-lg p-3">
                          <div class="font-medium text-amber-900 mb-2">
                            <i class="fas fa-calendar-day text-amber-700 mr-1 text-sm"></i>
                            ${formattedDate} (${visits.length})
                          </div>
                          <div class="space-y-2">
                            ${visits.map(visit => {
                              const timeDisplay = visit.visit_time ? 
                                new Date(`2000-01-01T${visit.visit_time}`).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                }) : 'No time'
                              
                              return `
                                <div class="text-sm border border-gray-200 rounded p-2 hover:bg-gray-50 transition duration-200">
                                  <div class="flex items-start justify-between">
                                    <div class="flex items-start flex-1">
                                      <i class="fas fa-store text-blue-600 mr-2 mt-0.5 text-xs"></i>
                                      <div class="flex-1">
                                        <div class="font-medium text-gray-800">${visit.store_name}</div>
                                        <div class="text-xs text-gray-500">${timeDisplay}</div>
                                        ${visit.notes ? `<div class="text-xs text-gray-600 mt-1">${visit.notes.substring(0, 50)}${visit.notes.length > 50 ? '...' : ''}</div>` : ''}
                                      </div>
                                    </div>
                                    <div class="flex space-x-1 ml-2">
                                      <button onclick="app.editVisit(${visit.id})" 
                                              class="text-blue-600 hover:text-blue-800 p-1 rounded transition duration-200" 
                                              title="Edit visit"
                                              aria-label="Edit visit to ${visit.store_name}">
                                        <i class="fas fa-edit text-xs"></i>
                                      </button>
                                      <button onclick="app.deleteVisit(${visit.id})" 
                                              class="text-red-600 hover:text-red-800 p-1 rounded transition duration-200" 
                                              title="Delete visit"
                                              aria-label="Delete visit to ${visit.store_name}">
                                        <i class="fas fa-trash text-xs"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              `
                            }).join('')}
                          </div>
                        </div>
                      `
                    }).join('')}
                </div>
              </div>
              
              <!-- Visual Calendar - Right Side -->
              <div class="lg:col-span-2">
                <div class="bg-white border border-amber-200 rounded-lg p-4">
                  ${this.generateCalendarView(visitsByDate)}
                </div>
              </div>
            </div>
          `}
        </div>
      `
      
      document.getElementById('calendarModalContent').innerHTML = content
      this.showModal('calendarModal')
      
    } catch (error) {
      console.error('Error loading calendar:', error)
      document.getElementById('calendarModalContent').innerHTML = `
        <div class="text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <h3 class="text-lg font-medium mb-2">Error Loading Calendar</h3>
          <p class="text-red-600 mb-4">Unable to load visit calendar data</p>
          <button onclick="app.showCalendarModal()" 
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
            <i class="fas fa-refresh mr-2"></i>
            Try Again
          </button>
        </div>
      `
      this.showModal('calendarModal')
    }
  }

  generateCalendarView(visitsByDate) {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Get first day of month and number of days in month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startDay = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    let calendarHTML = `
      <div class="mb-4">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-xl font-bold text-amber-900">
            ${monthNames[currentMonth]} ${currentYear}
          </h4>
          <div class="flex space-x-2">
            <button onclick="app.changeCalendarMonth(-1)" 
                    class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm transition duration-200">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button onclick="app.changeCalendarMonth(1)" 
                    class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm transition duration-200">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <!-- Day Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          ${dayNames.map(day => `
            <div class="bg-amber-100 text-amber-900 font-semibold text-center py-2 text-sm rounded">
              ${day}
            </div>
          `).join('')}
        </div>
        
        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1">
          ${this.generateCalendarDays(currentYear, currentMonth, visitsByDate)}
        </div>
      </div>
    `
    
    return calendarHTML
  }
  
  generateCalendarDays(year, month, visitsByDate) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()
    
    let daysHTML = ''
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      daysHTML += '<div class="h-20 bg-gray-50 rounded border border-gray-200"></div>'
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const visits = visitsByDate[dateString] || []
      const isToday = this.isToday(year, month, day)
      
      daysHTML += `
        <div class="h-20 bg-white border border-amber-200 rounded p-1 relative ${isToday ? 'ring-2 ring-purple-500 bg-purple-50' : ''} hover:bg-amber-50 transition duration-200">
          <div class="text-sm font-medium text-gray-700 mb-1">${day}</div>
          ${visits.length > 0 ? `
            <div class="space-y-1">
              ${visits.slice(0, 2).map(visit => `
                <div class="bg-green-500 hover:bg-green-600 text-white text-xs px-1 py-0.5 rounded truncate cursor-pointer transition duration-200 group" 
                     onclick="app.showVisitActions(${visit.id})" 
                     title="${visit.store_name} - ${visit.visit_time || 'No time'}${visit.notes ? ' - ' + visit.notes : ''}\n\nClick to edit or delete">
                  <i class="fas fa-circle text-xs mr-1"></i>${visit.store_name.substring(0, 10)}${visit.store_name.length > 10 ? '...' : ''}
                </div>
              `).join('')}
              ${visits.length > 2 ? `
                <div class="text-xs text-gray-600 font-medium">+${visits.length - 2} more</div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `
    }
    
    return daysHTML
  }
  
  isToday(year, month, day) {
    const today = new Date()
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate()
  }
  
  changeCalendarMonth(direction) {
    // This would be implemented to navigate between months
    // For now, we'll just reload the current month
    console.log('Calendar navigation not yet implemented')
  }

  async editVisit(visitId) {
    try {
      // First, fetch the visit data to populate the form
      const response = await axios.get(`/api/visits/${visitId}`)
      const visit = response.data
      
      if (!visit.success) {
        throw new Error('Visit not found')
      }
      
      const visitData = visit.visit
      
      // Show edit form modal
      const content = `
        <form id="editVisitForm" class="space-y-6" role="form" aria-labelledby="editVisitFormTitle">
          <h4 id="editVisitFormTitle" class="text-lg font-semibold text-gray-900 mb-4">Edit Visit Record</h4>
          
          <!-- Account Selection -->
          <div>
            <label for="editVisitAccountSelect" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-building mr-1" aria-hidden="true"></i>
              Account Name *
            </label>
            <select id="editVisitAccountSelect" name="storeId" required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900">
              <option value="">-- Select an account --</option>
              ${this.stores.map(store => `
                <option value="${store.id}" ${store.id == visitData.store_id ? 'selected' : ''}>${store.name}</option>
              `).join('')}
            </select>
          </div>
          
          <!-- Visit Date -->
          <div>
            <label for="editVisitDate" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-calendar mr-1" aria-hidden="true"></i>
              Visit Date *
            </label>
            <input type="date" id="editVisitDate" name="visitDate" required 
                   value="${visitData.visit_date}"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900">
          </div>
          
          <!-- Visit Time -->
          <div>
            <label for="editVisitTime" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-clock mr-1" aria-hidden="true"></i>
              Visit Time
            </label>
            <input type="time" id="editVisitTime" name="visitTime" 
                   value="${visitData.visit_time || ''}"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900">
          </div>
          
          <!-- Visit Notes -->
          <div>
            <label for="editVisitNotes" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-sticky-note mr-1" aria-hidden="true"></i>
              Visit Notes
            </label>
            <textarea id="editVisitNotes" name="notes" rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                      placeholder="What happened during this visit?">${visitData.notes || ''}</textarea>
          </div>
          
          <!-- Submit Buttons -->
          <div class="flex space-x-3 pt-4 border-t border-gray-200">
            <button type="submit" 
                    class="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none text-white py-3 px-4 rounded-lg transition duration-200 font-medium">
              <i class="fas fa-save mr-2" aria-hidden="true"></i>Update Visit
            </button>
            <button type="button" onclick="app.closeModal('visitModal')"
                    class="flex-1 bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:ring-gray-300 focus:outline-none text-gray-700 py-3 px-4 rounded-lg transition duration-200 font-medium">
              <i class="fas fa-times mr-2" aria-hidden="true"></i>Cancel
            </button>
          </div>
        </form>
      `
      
      document.getElementById('visitModalContent').innerHTML = content
      document.getElementById('editVisitForm').addEventListener('submit', (e) => this.handleEditVisitSubmit(e, visitId))
      this.showModal('visitModal')
      
    } catch (error) {
      console.error('Error loading visit for edit:', error)
      alert('Error loading visit data. Please try again.')
    }
  }

  async handleEditVisitSubmit(e, visitId) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const visitData = {
      store_id: parseInt(formData.get('storeId')),
      visit_date: formData.get('visitDate'),
      visit_time: formData.get('visitTime'),
      notes: formData.get('notes')
    }
    
    // Validate required fields
    if (!visitData.store_id || !visitData.visit_date) {
      alert('Please select an account and visit date')
      return
    }
    
    try {
      const response = await axios.put(`/api/visits/${visitId}`, visitData)
      
      if (response.data.success) {
        alert('Visit updated successfully!')
        this.closeModal('visitModal')
        // Refresh calendar to show updated visit
        this.showCalendarModal()
      } else {
        throw new Error(response.data.error || 'Failed to update visit')
      }
    } catch (error) {
      console.error('Error updating visit:', error)
      alert('Error updating visit: ' + (error.response?.data?.error || error.message))
    }
  }

  async deleteVisit(visitId) {
    // Get visit details for confirmation
    try {
      const response = await axios.get(`/api/visits/${visitId}`)
      const visit = response.data.visit
      const storeName = this.stores.find(s => s.id == visit.store_id)?.name || 'Unknown Store'
      
      const confirmMessage = `Are you sure you want to delete this visit?\n\nStore: ${storeName}\nDate: ${visit.visit_date}\nTime: ${visit.visit_time || 'No time'}\n\nThis action cannot be undone.`
      
      if (!confirm(confirmMessage)) {
        return
      }
      
      const deleteResponse = await axios.delete(`/api/visits/${visitId}`)
      
      if (deleteResponse.data.success) {
        alert('Visit deleted successfully!')
        // Refresh calendar to show updated visit list
        this.showCalendarModal()
      } else {
        throw new Error(deleteResponse.data.error || 'Failed to delete visit')
      }
    } catch (error) {
      console.error('Error deleting visit:', error)
      alert('Error deleting visit: ' + (error.response?.data?.error || error.message))
    }
  }

  async showVisitActions(visitId) {
    try {
      // Get visit details
      const response = await axios.get(`/api/visits/${visitId}`)
      const visit = response.data.visit
      
      const timeDisplay = visit.visit_time ? 
        new Date(`2000-01-01T${visit.visit_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : 'No time specified'
      
      const confirmAction = confirm(`Visit to ${visit.store_name}\nDate: ${visit.visit_date}\nTime: ${timeDisplay}\n${visit.notes ? 'Notes: ' + visit.notes : ''}\n\nWhat would you like to do?\n\nOK = Edit Visit\nCancel = Delete Visit`)
      
      if (confirmAction) {
        // Edit visit
        this.editVisit(visitId)
      } else {
        // Delete visit
        this.deleteVisit(visitId)
      }
    } catch (error) {
      console.error('Error fetching visit details:', error)
      alert('Error loading visit details')
    }
  }

  showMapModal() {
    // Create map content with Leaflet map
    const content = `
      <div class="h-full flex flex-col">
        <!-- Map Controls -->
        <div class="bg-orange-50 border-b border-orange-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-lg font-semibold text-orange-900 mb-1">
                <i class="fas fa-map text-orange-600 mr-2"></i>
                Account Locations
              </h4>
              <p class="text-sm text-orange-700">
                Total stores: <span class="font-medium">${this.stores.length}</span>
              </p>
            </div>
            <div class="flex space-x-2">
              <button onclick="app.centerMapOnStores()" 
                      class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium">
                <i class="fas fa-crosshairs mr-2"></i>
                Center Map
              </button>
              <button onclick="app.showStoreList()" 
                      class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium">
                <i class="fas fa-list mr-2"></i>
                Store List
              </button>
            </div>
          </div>
        </div>
        
        <!-- Map Container -->
        <div class="flex-1 relative">
          <div id="storeMap" class="w-full h-full bg-gray-100 flex items-center justify-center">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
              <p class="text-gray-600">Loading map...</p>
            </div>
          </div>
        </div>
        
        <!-- Store List Sidebar (Hidden by default) -->
        <div id="storeListSidebar" class="absolute top-0 right-0 w-80 h-full bg-white border-l border-amber-200 hidden overflow-y-auto">
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h5 class="text-lg font-semibold text-amber-900">Store Directory</h5>
              <button onclick="app.hideStoreList()" 
                      class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div id="mapStoreList" class="space-y-3">
              ${this.generateMapStoreList()}
            </div>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('mapModalContent').innerHTML = content
    this.showModal('mapModal')
    
    // Initialize the map after modal is shown
    setTimeout(() => {
      this.initializeMap()
    }, 100)
  }

  generateMapStoreList() {
    return this.stores.map(store => {
      const isOnMap = this.storeMarkers && this.storeMarkers.some(m => m.storeId === store.id)
      const address = this.getStoreAddress(store)
      
      return `
        <div class="border rounded-lg p-3 transition duration-200 cursor-pointer ${
          isOnMap 
            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
            : 'bg-red-50 border-red-200 hover:bg-red-100'
        }" ${isOnMap ? `onclick="app.focusStoreOnMap(${store.id})"` : ''}>
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-medium ${isOnMap ? 'text-green-900' : 'text-red-900'}">${store.name}</div>
              ${store.description ? `<div class="text-sm ${isOnMap ? 'text-green-700' : 'text-red-700'} mt-1">${store.description}</div>` : ''}
              ${address ? `<div class="text-xs text-gray-600 mt-1">${address}</div>` : ''}
            </div>
            <div class="ml-2">
              ${isOnMap 
                ? '<i class="fas fa-map-marker-alt text-green-600"></i>' 
                : '<i class="fas fa-exclamation-triangle text-red-600"></i>'
              }
            </div>
          </div>
          <div class="flex items-center text-xs mt-2 ${isOnMap ? 'text-green-600' : 'text-red-600'}">
            ${isOnMap 
              ? '<span><i class="fas fa-check-circle mr-1"></i>Click to locate on map</span>'
              : '<span><i class="fas fa-times-circle mr-1"></i>Location not found</span>'
            }
          </div>
        </div>
      `
    }).join('')
  }

  initializeMap() {
    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      // Load Leaflet CSS and JS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => {
        this.createMap()
      }
      document.head.appendChild(script)
    } else {
      this.createMap()
    }
  }

  createMap() {
    // Initialize map centered on US with proper zoom controls
    this.map = L.map('storeMap', {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true
    }).setView([39.8283, -98.5795], 4)
    
    // Add OpenStreetMap tiles with better attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 2
    }).addTo(this.map)
    
    // Add store markers with geocoding
    this.addStoreMarkers()
  }

  async addStoreMarkers() {
    this.storeMarkers = []
    this.geocodingErrors = []
    
    // Add a loading indicator
    const loadingDiv = document.createElement('div')
    loadingDiv.id = 'geocoding-progress'
    loadingDiv.className = 'absolute top-20 left-4 bg-white p-3 rounded-lg shadow-lg border z-1000'
    loadingDiv.innerHTML = `
      <div class="flex items-center text-sm">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
        <span>Locating stores on map...</span>
        <span id="progress-count" class="ml-2 font-medium">0/${this.stores.length}</span>
      </div>
    `
    document.getElementById('storeMap').appendChild(loadingDiv)
    
    let processed = 0
    const validMarkers = []
    
    for (const store of this.stores) {
      try {
        // Get the actual store address
        const address = this.getStoreAddress(store)
        let coordinates = null
        
        if (address) {
          coordinates = await this.geocodeAddress(address)
        }
        
        // If geocoding fails, try with store name + description
        if (!coordinates) {
          const fallbackLocation = `${store.name} ${store.description || ''}`.trim()
          if (fallbackLocation) {
            coordinates = await this.geocodeAddress(fallbackLocation)
          }
        }
        
        // If still no coordinates, skip this store
        if (!coordinates) {
          this.geocodingErrors.push({
            store: store.name,
            address: address || 'No address found',
            reason: 'Could not geocode address'
          })
          processed++
          document.getElementById('progress-count').textContent = `${processed}/${this.stores.length}`
          continue
        }
        
        // Create marker with actual coordinates
        const marker = L.marker([coordinates.lat, coordinates.lng])
          .bindPopup(`
            <div class="p-3 min-w-64">
              <h6 class="font-bold text-amber-900 mb-2">${store.name}</h6>
              ${store.description ? `<p class="text-sm text-gray-600 mb-2">${store.description}</p>` : ''}
              ${address ? `<p class="text-xs text-gray-500 mb-3"><i class="fas fa-map-marker-alt mr-1"></i>${address}</p>` : ''}
              <div class="flex space-x-2">
                <button onclick="app.viewStoreFromMap(${store.id})" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition">
                  View Profile
                </button>
                <button onclick="app.recordVisitFromMap(${store.id})" 
                        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition">
                  Record Visit
                </button>
              </div>
            </div>
          `)
          .addTo(this.map)
        
        // Store reference for focusing
        marker.storeId = store.id
        marker.storeData = store
        validMarkers.push(marker)
        this.storeMarkers.push(marker)
        
      } catch (error) {
        console.warn(`Error processing store ${store.name}:`, error)
        this.geocodingErrors.push({
          store: store.name,
          address: address || 'No address found',
          reason: error.message
        })
      }
      
      processed++
      document.getElementById('progress-count').textContent = `${processed}/${this.stores.length}`
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // Remove loading indicator
    document.getElementById('geocoding-progress').remove()
    
    // Auto-fit map to show all valid markers
    if (validMarkers.length > 0) {
      const group = new L.featureGroup(validMarkers)
      this.map.fitBounds(group.getBounds().pad(0.1))
    } else {
      // If no markers were placed, show US map
      this.map.setView([39.8283, -98.5795], 4)
    }
    
    // Show geocoding summary
    this.showGeocodingSummary(validMarkers.length, this.geocodingErrors.length)
  }
  
  async geocodeAddress(address) {
    try {
      // Use Nominatim (OpenStreetMap) geocoding service
      const encodedAddress = encodeURIComponent(address)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      
      return null
    } catch (error) {
      console.warn('Geocoding error:', error)
      return null
    }
  }
  
  showGeocodingSummary(successful, failed) {
    if (failed > 0) {
      const summaryDiv = document.createElement('div')
      summaryDiv.className = 'absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border max-w-sm z-1000'
      summaryDiv.innerHTML = `
        <div class="text-sm">
          <div class="font-medium text-gray-900 mb-2">
            <i class="fas fa-map-marker-alt text-green-600 mr-1"></i>
            ${successful} stores located successfully
          </div>
          ${failed > 0 ? `
            <div class="text-amber-600 mb-2">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              ${failed} stores could not be located
            </div>
            <button onclick="app.showGeocodingErrors()" 
                    class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">
              View Details
            </button>
          ` : ''}
          <button onclick="this.parentElement.remove()" 
                  class="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-xs">
            ×
          </button>
        </div>
      `
      document.getElementById('storeMap').appendChild(summaryDiv)
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        if (summaryDiv.parentElement) {
          summaryDiv.remove()
        }
      }, 8000)
    }
  }

  centerMapOnStores() {
    if (this.map && this.storeMarkers.length > 0) {
      const group = new L.featureGroup(this.storeMarkers)
      this.map.fitBounds(group.getBounds().pad(0.1))
    }
  }

  showStoreList() {
    document.getElementById('storeListSidebar').classList.remove('hidden')
  }

  hideStoreList() {
    document.getElementById('storeListSidebar').classList.add('hidden')
  }

  focusStoreOnMap(storeId) {
    const marker = this.storeMarkers.find(m => m.storeId === storeId)
    if (marker) {
      this.map.setView(marker.getLatLng(), 15) // Zoom closer for better view
      marker.openPopup()
      
      // Hide store list after focusing
      this.hideStoreList()
    } else {
      this.showNotification(`Store not found on map (may not have been geocoded)`, 'warning')
    }
  }
  
  showGeocodingErrors() {
    if (!this.geocodingErrors || this.geocodingErrors.length === 0) {
      this.showNotification('No geocoding errors to display', 'info')
      return
    }
    
    const errorList = this.geocodingErrors.map(error => `
      <div class="bg-red-50 border border-red-200 rounded p-3 mb-2">
        <div class="font-medium text-red-900">${error.store}</div>
        <div class="text-sm text-red-700">Address: ${error.address}</div>
        <div class="text-xs text-red-600">Reason: ${error.reason}</div>
      </div>
    `).join('')
    
    const content = `
      <div class="p-4">
        <h4 class="text-lg font-semibold text-red-900 mb-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Geocoding Errors (${this.geocodingErrors.length})
        </h4>
        <div class="max-h-96 overflow-y-auto">
          ${errorList}
        </div>
        <div class="mt-4 text-sm text-gray-600">
          <p class="mb-2">These stores could not be located on the map. To fix:</p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li>Ensure store addresses are complete and properly formatted</li>
            <li>Include city, state, and country information</li>
            <li>Verify address spelling and accuracy</li>
            <li>Consider adding address information to store profiles</li>
          </ul>
        </div>
        <div class="mt-4 flex justify-end">
          <button onclick="app.closeModal('generalModal')" 
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition">
            Close
          </button>
        </div>
      </div>
    `
    
    this.showGeneralModal('Geocoding Errors', content)
  }
  
  // Enhanced center map function with better bounds calculation
  centerMapOnStores() {
    if (this.map && this.storeMarkers.length > 0) {
      const group = new L.featureGroup(this.storeMarkers)
      const bounds = group.getBounds()
      
      // If all markers are very close together, set a minimum zoom level
      const boundsSize = Math.max(
        bounds.getNorthEast().lat - bounds.getSouthWest().lat,
        bounds.getNorthEast().lng - bounds.getSouthWest().lng
      )
      
      if (boundsSize < 0.01) {
        // Very close together, zoom to city level
        this.map.setView(bounds.getCenter(), 12)
      } else {
        // Normal bounds fitting with padding
        this.map.fitBounds(bounds.pad(0.1))
      }
    } else {
      // No markers found, show default US view
      this.map.setView([39.8283, -98.5795], 4)
      this.showNotification('No store locations found on map', 'warning')
    }
  }

  viewStoreFromMap(storeId) {
    // Close map modal and show store profile
    this.closeModal('mapModal')
    this.showStoreModal(storeId)
  }

  recordVisitFromMap(storeId) {
    // Close map modal and show visit recording
    this.closeModal('mapModal')
    this.showVisitModal()
    // Pre-select the store in the visit form
    setTimeout(() => {
      const storeSelect = document.getElementById('visitAccountSelect')
      if (storeSelect) {
        storeSelect.value = storeId
      }
    }, 100)
  }

  showGeneralModal(title, content) {
    document.getElementById('generalModalTitle').textContent = title
    document.getElementById('generalModalContent').innerHTML = content
    this.showModal('generalModal')
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

  // ===== FILTER AND SORT FUNCTIONALITY =====

  getFilteredAndSortedStores() {
    let filteredStores = [...this.stores]
    
    // Apply filter
    const filterValue = document.getElementById('storeFilter').value
    
    if (filterValue === 'prospect') {
      filteredStores = filteredStores.filter(store => 
        store.name && store.name.toLowerCase().includes('prospect')
      )
    } else if (filterValue === 'non-prospect') {
      filteredStores = filteredStores.filter(store => 
        store.name && !store.name.toLowerCase().includes('prospect')
      )
    } else if (filterValue === 'active') {
      filteredStores = filteredStores.filter(store => {
        // Check if store has "Active" status in custom sections
        if (store.custom_sections && Array.isArray(store.custom_sections)) {
          const statusSection = store.custom_sections.find(section => 
            section.section_name.toLowerCase() === 'status'
          )
          return statusSection && statusSection.section_value.toLowerCase() === 'active'
        }
        return false
      })
    }
    
    // Apply sort
    const sortValue = document.getElementById('storeSort').value
    
    switch(sortValue) {
      case 'name-asc':
        filteredStores.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filteredStores.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'recent':
        filteredStores.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        filteredStores.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      default:
        // Default to name ascending
        filteredStores.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    return filteredStores
  }

  applyFiltersAndSort() {
    const filterValue = document.getElementById('storeFilter').value
    const sortValue = document.getElementById('storeSort').value
    const filterStatus = document.getElementById('filterStatus')
    const clearFiltersBtn = document.getElementById('clearFilters')
    
    // Update filter status display
    let statusText = ''
    let hasActiveFilters = false
    
    if (filterValue === 'prospect') {
      statusText = 'Showing prospects only'
      hasActiveFilters = true
    } else if (filterValue === 'non-prospect') {
      statusText = 'Showing non-prospects only'
      hasActiveFilters = true
    } else if (filterValue === 'active') {
      statusText = 'Showing active accounts only'
      hasActiveFilters = true
    } else {
      statusText = 'Showing all accounts'
    }
    
    // Add sort info
    switch(sortValue) {
      case 'name-asc':
        statusText += ' (A-Z)'
        break
      case 'name-desc':
        statusText += ' (Z-A)'
        break
      case 'recent':
        statusText += ' (newest first)'
        break
      case 'oldest':
        statusText += ' (oldest first)'
        break
    }
    
    filterStatus.textContent = statusText
    
    // Show/hide clear filters button
    if (hasActiveFilters) {
      clearFiltersBtn.style.display = 'block'
    } else {
      clearFiltersBtn.style.display = 'none'
    }
    
    // Re-render stores with new filters
    this.renderStores()
    
    // Update count
    const filteredStores = this.getFilteredAndSortedStores()
    if (filteredStores.length !== this.stores.length) {
      filterStatus.textContent += ` (${filteredStores.length} of ${this.stores.length})`
    }
  }

  clearFilters() {
    document.getElementById('storeFilter').value = 'all'
    document.getElementById('storeSort').value = 'name-asc'
    this.applyFiltersAndSort()
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