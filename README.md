# 💎 Jewelry Store Profile Manager

A mobile-optimized web application for managing jewelry store accounts and staff profiles with comprehensive Excel bulk import capabilities. Built with Hono framework and designed for Cloudflare Pages deployment.

## 🎯 Project Overview

- **Name**: Jewelry Store Profile Manager
- **Goal**: Streamline jewelry store management with comprehensive staff profiling and account management
- **Features**: Store management, staff profiles, Excel/copy-paste bulk import, automatic custom section creation
- **Target**: Mobile-first responsive design for on-the-go management

## 🌐 URLs

- **Development**: https://3000-i9tr7bwgymrnqynzw6wlq-6532622b.e2b.dev
- **API Health**: https://3000-i9tr7bwgymrnqynzw6wlq-6532622b.e2b.dev/api/stores
- **GitHub**: [To be configured when deploying to production]

## ✨ Current Features

### 🏪 Store Management
- **Add new jewelry stores** with name, description, and logo upload
- **Import stores from Excel** with comprehensive account profile data
- **Copy-paste functionality** - directly paste from Excel, Google Sheets, or any spreadsheet
- **Filter and sort accounts** - show only prospects, active accounts, or sort alphabetically
- **Smart prospect detection** - automatically identifies accounts with "PROSPECT" in name
- **Edit store information** including logo updates and custom sections
- **Delete stores** (cascades to remove all associated staff)
- **Browse all stores** in an organized card layout

### 📊 Excel Bulk Import (ENHANCED!)
- **Import multiple jewelry stores** from Excel spreadsheets with automatic custom section creation
- **Import multiple staff profiles** from Excel spreadsheets instantly  
- **Copy-paste functionality** - directly paste from Excel, Google Sheets, or any spreadsheet
- **Download Excel templates** with proper formatting and sample data (separate for stores and staff)
- **Support for .xlsx, .xls, and .csv** file formats
- **Intelligent field mapping** automatically detects common column names and creates custom sections
- **Auto-detection of custom fields** - any additional columns become custom sections automatically
- **Dual import methods** - file upload OR copy-paste from clipboard
- **Import validation** with detailed error reporting and success summary
- **Progress tracking** with real-time import status updates
- **Mobile-optimized workflow** for importing on any device

### 👥 Staff Profile Management
- **Add staff members** with name, role, start year, and profile picture
- **View detailed staff profiles** with all information and custom sections
- **Edit staff information** including profile picture updates
- **Delete staff members** with confirmation

### 🎯 Dynamic Custom Sections
- **Add unlimited custom sections** to both stores and staff profiles
- **Automatic creation from Excel headers** - any unknown columns become custom sections
- **Flexible section management** with custom names and values
- **Organized display** with proper ordering and management controls
- **Easy deletion** of unwanted sections

### 🔐 Password Authentication (NEW!)
- **Login Protection** - Entire application protected by password authentication
- **Password**: `Family` (case-sensitive) - Required on first visit
- **Secure Sessions** - 24-hour authentication using HTTP-only cookies
- **Login Page** - Professional login interface matching app design with:
  - Amber/blue theme consistency with app branding
  - Auto-focus password field for immediate access
  - Error messaging for invalid password attempts
  - Professional security messaging and branding
- **Logout Functionality** - Red logout button in header with confirmation dialog
- **API Protection** - All endpoints protected except login/logout
- **Session Management**:
  - HTTP-only cookies prevent XSS attacks
  - SameSite=Strict prevents CSRF attacks
  - Automatic session expiration after 24 hours
  - Unauthorized requests return to login page

### 📅 Visit Tracking (NEW!)
- **Today's Visit Button** - Prominent green button in the header for easy access
- **Visit Recording Modal** - Full-screen white background popup for distraction-free data entry
- **Account Selection Dropdown** - Choose from all available store profiles
- **Date & Time Input** - Auto-populated with today's date and current time
- **Visit Notes** - Add detailed notes about the visit
- **Automatic Linking** - All visit data is automatically linked to the selected account profile
- **Visit History Display** - View all past visits within account profile modals
- **Complete CRUD Operations** - Create, view, edit, and delete visit records
- **API Integration** - Full REST API endpoints for visit management

### 📆 Visit Calendar (NEW!)
- **Calendar Button** - Purple button in header to view all recorded visits
- **Dual Layout Design** - Split-screen calendar with Activity Log (left) and Visual Calendar (right)
- **Activity Log Panel** - Chronological list of all visits with store names, times, and truncated notes
- **Visual Calendar Grid** - Proper month calendar showing visits on actual dates with:
  - Month/year navigation header with previous/next buttons
  - Day-of-week headers (Sun-Mon-Tue-Wed-Thu-Fri-Sat)
  - Calendar grid displaying visits as green indicators on appropriate dates
  - Today's date highlighted with purple ring
  - Visit tooltips showing store name, time, and notes on hover
  - Multiple visits per day with "+" counter for overflow
- **Responsive Design** - Stacks vertically on mobile, side-by-side on desktop
- **Quick Record Access** - "Record New Visit" button available directly in calendar
- **Visit Management** - Complete CRUD operations for visits directly in calendar:
  - **Edit Visits** - Blue pencil icon in activity log opens pre-populated edit form
  - **Delete Visits** - Red trash icon in activity log with confirmation dialog
  - **Calendar Grid Actions** - Click visit indicators in calendar for edit/delete options
  - **Form Validation** - Ensures required fields and data integrity
  - **Real-time Updates** - Calendar automatically refreshes after changes
- **Empty State Guidance** - Encourages users to record their first visit if calendar is empty
- **Seamless Integration** - Calendar data syncs with Today's Visit functionality
- **REST API Endpoints** - Full CRUD API support:
  - `GET /api/calendar/visits` - Grouped visit data for calendar display
  - `GET /api/visits/:id` - Fetch single visit for editing ✨ NEW!
  - `PUT /api/visits/:id` - Update visit with store change support ✨ NEW!

### 🔍 Advanced Filtering & Sorting (ENHANCED!)
- **All Accounts** - Display every account in the database (default view)
- **Prospects Only** - Show only accounts with "PROSPECT" in the name
- **Non-Prospects** - Display accounts that DON'T have "PROSPECT" in name ✨ NEW!
- **Active Only** - Show accounts marked as "Active" in custom sections
- **Alphabetical Sort** - Sort accounts A-Z or Z-A by name
- **Date Sort** - Order by newest or oldest accounts first
- **Real-time Status** - See current filter and result count with live updates
- **Quick Clear** - Reset all filters with one click
- **Mobile Optimized** - Touch-friendly filter controls with proper accessibility

### 📱 Mobile-Optimized Design
- **Responsive layout** that works perfectly on phones and tablets
- **Touch-friendly buttons** with proper sizing for mobile interaction
- **Smooth animations** and transitions for better user experience
- **Progressive Web App** features for app-like experience

### 🖼️ Image Management
- **Logo uploads** for jewelry stores
- **Profile pictures** for staff members
- **Automatic image optimization** and secure storage
- **Fallback placeholders** with elegant icons

## 🏗️ Data Architecture

### 📊 Database Tables (Cloudflare D1)
1. **stores** - Jewelry store information (id, name, description, logo_url, timestamps)
2. **store_custom_sections** - Dynamic store information (address, phone, website, hours, specialties, etc.)
3. **staff** - Staff member profiles (id, store_id, name, role, year_started, profile_picture_url, timestamps)
4. **staff_custom_sections** - Dynamic profile sections (certifications, languages, awards, experience, etc.)
5. **visits** - Visit tracking records (id, store_id, visit_date, visit_time, notes, timestamps)

### 💾 Storage Services
- **Cloudflare D1** - SQLite database for relational data with global distribution
- **Cloudflare R2** - Object storage for images (logos and profile pictures)
- **Local SQLite** - Development database (--local mode)

### 🔄 Data Flow
1. **Frontend** → Hono API routes → **D1 Database** operations
2. **Image uploads** → **R2 Storage** → URL returned for database storage
3. **Real-time updates** through API calls with immediate UI refresh

## 📱 User Guide

### Getting Started
1. **Open the app** in your mobile browser or desktop
2. **Add your first jewelry store** by clicking "Add Store" OR use "Import Stores" for bulk setup
3. **Fill in store details** and optionally upload a logo
4. **Click on a store** to view details and manage staff

### Managing Stores
- **Add Store**: Click the blue "Add Store" button, fill in details, optionally upload logo
- **Import Stores**: Click "Import Stores" for bulk upload from Excel or copy-paste
- **Filter Accounts**: Use filter dropdown to show only Prospects, Active accounts, or All
- **Sort Accounts**: Sort alphabetically (A-Z, Z-A) or by date (newest/oldest first)
- **Edit Store**: Click the edit icon (pencil) on any store card
- **Delete Store**: Click the trash icon (will remove all staff too)  
- **View Store**: Click anywhere on a store card to open details

### Managing Staff
1. **From store view**, click "Add Staff" to create new profile OR "Import Excel" for bulk upload
2. **Fill in basic info**: Name, role, start year, profile picture
3. **Click on staff member** to view full profile
4. **Add custom sections**: Certifications, languages, specialties, etc.
5. **Edit or delete** using the profile action buttons

### Excel Bulk Import Process

#### For Jewelry Stores:
1. **Access import**: Click "Import Stores" on the main page
2. **Choose method**: File upload or copy-paste from spreadsheet
3. **Download template**: Get stores template with sample account profile data
4. **Import data**: Upload file or paste directly from Excel/Google Sheets
5. **Auto-sections**: Any additional columns automatically become custom store sections

#### For Staff Profiles:
1. **Access import**: Click "Import Excel" from any store view
2. **Download template**: Get staff template with sample data
3. **Fill in data**: Name and Role required, all other fields become custom sections
4. **Import method**: Upload file or paste from clipboard
5. **Review results**: See detailed import summary with success/error counts
6. **View imported**: Automatically refreshes to show new profiles

#### Copy-Paste Feature:
- **Direct paste** from Excel, Google Sheets, Numbers, or any spreadsheet
- **Automatic detection** of tab-separated or comma-separated values
- **Headers included** - first row should contain column names
- **Custom fields auto-created** - any unknown columns become custom sections
- **Sample data provided** - click "View Sample Data" for examples

### Excel Template Formats

**Account Profiles Template:**
```
Account | Contact | Phone Number | Store Address | Website | Facebook Link | Email Address | Monday Store Hours | Tuesday Store Hours | Wednesday Store Hours | Thursday Store Hours | Friday Store Hours | Saturday Store Hours | Sunday Store Hours | Notes | Net Sales FY 2025 | Net Sales FY 2024 | Net Sales FY 2023 | 23 + '24 | Status
```

**Staff Profiles Template:**
```
Name | Role | Year Started | Certifications | Languages | Specialties | Education | Awards | Experience | Phone | Email | Notes
```

**Custom Fields:** Any additional columns you add will automatically become custom sections!

## 🛠️ Tech Stack

- **Backend**: Hono framework (lightweight, fast, edge-optimized)
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Styling**: TailwindCSS (CDN) + Custom CSS for mobile optimization
- **Icons**: Font Awesome 6.0 for consistent iconography
- **HTTP Client**: Axios for API communication
- **Excel Processing**: SheetJS for file parsing and copy-paste support
- **Database**: Cloudflare D1 (globally distributed SQLite)
- **File Storage**: Cloudflare R2 (S3-compatible object storage)
- **Deployment**: Cloudflare Pages with edge computing

## 🚀 Deployment Status

- **Platform**: Cloudflare Pages (ready to deploy)
- **Status**: ✅ Development Active
- **Local Database**: ✅ Initialized with sample data
- **API Endpoints**: ✅ All functional
- **Image Upload**: ✅ Configured for R2 storage
- **Excel Import**: ✅ Both file upload and copy-paste working
- **Mobile Optimization**: ✅ Fully responsive
- **Today's Visit Feature**: ✅ **Fully implemented with modal and form**
- **Calendar Feature**: ✅ **Complete calendar view of all visits** ✨ NEW!
- **Authentication System**: ✅ **Password protection with 'Family' password** ✨ NEW!
- **Latest Features**: 
  - 🔐 **Authentication** - Secure login system protecting entire application (Password: 'Family')
  - 📆 **Calendar** - Full calendar view displaying all recorded visits grouped by date
  - 📅 **Today's Visit** - Record visits to accounts with date/time tracking
  - 🔍 Non-Prospects Filter for comprehensive account management
  - ♿ Full WCAG 2.1 AA accessibility compliance with keyboard navigation
  - 🎨 Pantone color scheme with warm amber tones, blue accents, and purple calendar
- **Last Updated**: 2025-09-15

## 📋 API Endpoints

### Stores
- `GET /api/stores` - Get all stores with custom sections
- `GET /api/stores/:id` - Get store with staff
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Bulk Import (ENHANCED!)
- `POST /api/stores/bulk-import` - Import multiple stores from Excel data with auto-sections
- `POST /api/stores/:storeId/staff/bulk-import` - Import multiple staff from Excel data with auto-sections
- `GET /api/excel-template/stores` - Download account profiles Excel/CSV template
- `GET /api/excel-template/staff` - Download staff Excel/CSV template with sample data
- `GET /api/excel-template` - Legacy endpoint (redirects to staff template)

### Staff
- `POST /api/stores/:storeId/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Custom Sections
- `POST /api/stores/:storeId/sections` - Add store custom section
- `PUT /api/stores/sections/:id` - Update store section
- `DELETE /api/stores/sections/:id` - Delete store section
- `POST /api/staff/:staffId/sections` - Add staff custom section
- `PUT /api/staff/sections/:id` - Update staff section
- `DELETE /api/staff/sections/:id` - Delete staff section

### Visits
- `POST /api/visits` - Create new visit record
- `GET /api/visits/:id` - Get single visit with store details ✨ NEW!
- `GET /api/stores/:storeId/visits` - Get all visits for a specific store
- `GET /api/visits/recent` - Get recent visits across all stores (limit 50)
- `GET /api/calendar/visits` - Get all visits grouped by date for calendar display ✨ NEW!
- `PUT /api/visits/:id` - Update visit record (supports store changes) ✨ ENHANCED!
- `DELETE /api/visits/:id` - Delete visit record

### File Upload
- `POST /api/upload` - Upload image file
- `GET /api/images/:fileName` - Serve uploaded images

### Authentication ✨ NEW!
- `POST /api/login` - Authenticate with password (expects `{"password":"Family"}`)
- `POST /api/logout` - Clear authentication session and logout

## 🔧 Development Commands

```bash
# Start development server
npm run dev:sandbox

# Build for production
npm run build

# Database management
npm run db:migrate:local    # Apply migrations locally
npm run db:seed            # Add sample data
npm run db:reset           # Reset and reseed database

# Testing
npm run test              # Test API endpoints

# Git shortcuts
npm run git:status        # Check git status
npm run git:log          # View commit history
```

## 🚀 Next Development Steps

### Immediate Enhancements
1. **Search and filtering** for stores and staff members
2. **Export functionality** for staff profiles (PDF/CSV)
3. ✅ **Bulk operations** for managing multiple staff members (Excel Import - COMPLETED!)
4. **Profile templates** for quick staff setup
5. **Import history** and audit trail for bulk operations

### Advanced Features
1. **User authentication** for multi-tenant usage
2. **Role-based permissions** for different user levels
3. **Analytics dashboard** for store performance metrics and sales data
4. **Integration APIs** with jewelry management systems
5. **Offline mode** with data synchronization
6. **Financial reporting** using the imported sales data

### Production Deployment
1. **Configure Cloudflare API key** for production deployment
2. **Set up custom domain** for professional branding
3. **Configure environment variables** for production database
4. **Set up monitoring** and error tracking
5. **Implement backup strategy** for data protection

## 🔐 Security Features

- **Input validation** on all forms and API endpoints
- **CORS protection** configured for API routes
- **File upload restrictions** (images only, size limits)
- **SQL injection protection** through prepared statements
- **XSS prevention** through proper data handling
- **Data sanitization** for all Excel imports

## 🎯 Perfect For

- 💎 **Jewelry store owners** managing multiple locations with detailed account profiles
- 👥 **HR managers** tracking employee information with custom fields
- 📋 **Store managers** organizing staff profiles and store data
- 📊 **Franchise managers** importing data from corporate systems
- 🔄 **System migrations** from other jewelry management software
- 📱 **Mobile-first business management** with comprehensive import capabilities

## 📞 Support

The app includes comprehensive error handling and user-friendly notifications. All actions provide immediate feedback, and the mobile-optimized design ensures smooth operation across all devices. The enhanced Excel import system makes bulk data entry effortless with automatic custom section creation.

---

*Built with ❤️ for jewelry store professionals who value efficiency, elegant design, and powerful data management capabilities*