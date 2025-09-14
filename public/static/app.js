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
              <p class="text-sm text-gray-600">${store.description || 'No description'}</p>
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
            <button onclick="app.showAddStaffForm(${store.id})" 
                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition duration-200">
              <i class="fas fa-plus mr-1"></i>Add Staff
            </button>
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