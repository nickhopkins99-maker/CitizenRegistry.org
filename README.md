# 💎 Jewelry Store Profile Manager

A mobile-optimized web application for managing jewelry store accounts and staff profiles. Built with Hono framework and designed for Cloudflare Pages deployment.

## 🎯 Project Overview

- **Name**: Jewelry Store Profile Manager
- **Goal**: Streamline jewelry store management with comprehensive staff profiling
- **Features**: Store management, staff profiles, image uploads, dynamic custom sections
- **Target**: Mobile-first responsive design for on-the-go management

## 🌐 URLs

- **Development**: https://3000-i9tr7bwgymrnqynzw6wlq-6532622b.e2b.dev
- **API Health**: https://3000-i9tr7bwgymrnqynzw6wlq-6532622b.e2b.dev/api/stores
- **GitHub**: [To be configured when deploying to production]

## ✨ Current Features

### 🏪 Store Management
- **Add new jewelry stores** with name, description, and logo upload
- **Edit store information** including logo updates
- **Delete stores** (cascades to remove all associated staff)
- **Browse all stores** in an organized card layout

### 👥 Staff Profile Management
- **Add staff members** with name, role, start year, and profile picture
- **View detailed staff profiles** with all information and custom sections
- **Edit staff information** including profile picture updates
- **Delete staff members** with confirmation

### 🎯 Dynamic Custom Sections
- **Add unlimited custom sections** to staff profiles (certifications, languages, awards, etc.)
- **Flexible section management** with custom names and values
- **Organized display** with proper ordering and management controls
- **Easy deletion** of unwanted sections

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
2. **staff** - Staff member profiles (id, store_id, name, role, year_started, profile_picture_url, timestamps)
3. **staff_custom_sections** - Dynamic profile sections (id, staff_id, section_name, section_value, section_order, timestamps)

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
2. **Add your first jewelry store** by clicking "Add Store"
3. **Fill in store details** and optionally upload a logo
4. **Click on a store** to view details and manage staff

### Managing Stores
- **Add Store**: Click the blue "Add Store" button, fill in details, optionally upload logo
- **Edit Store**: Click the edit icon (pencil) on any store card
- **Delete Store**: Click the trash icon (will remove all staff too)
- **View Store**: Click anywhere on a store card to open details

### Managing Staff
1. **From store view**, click "Add Staff" to create new profile
2. **Fill in basic info**: Name, role, start year, profile picture
3. **Click on staff member** to view full profile
4. **Add custom sections**: Certifications, languages, specialties, etc.
5. **Edit or delete** using the profile action buttons

### Custom Sections Examples
- **Certifications**: "GIA Certified Gemologist"
- **Languages**: "English, Spanish, French"
- **Specialties**: "Vintage Jewelry Restoration"
- **Awards**: "Salesperson of the Year 2023"
- **Education**: "Gemology Institute Graduate"

## 🛠️ Tech Stack

- **Backend**: Hono framework (lightweight, fast, edge-optimized)
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Styling**: TailwindCSS (CDN) + Custom CSS for mobile optimization
- **Icons**: Font Awesome 6.0 for consistent iconography
- **HTTP Client**: Axios for API communication
- **Database**: Cloudflare D1 (globally distributed SQLite)
- **File Storage**: Cloudflare R2 (S3-compatible object storage)
- **Deployment**: Cloudflare Pages with edge computing

## 🚀 Deployment Status

- **Platform**: Cloudflare Pages (ready to deploy)
- **Status**: ✅ Development Active
- **Local Database**: ✅ Initialized with sample data
- **API Endpoints**: ✅ All functional
- **Image Upload**: ✅ Configured for R2 storage
- **Mobile Optimization**: ✅ Fully responsive
- **Last Updated**: 2025-09-14

## 📋 API Endpoints

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store with staff
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Staff
- `POST /api/stores/:storeId/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Custom Sections
- `POST /api/staff/:staffId/sections` - Add custom section
- `PUT /api/staff/sections/:id` - Update section
- `DELETE /api/staff/sections/:id` - Delete section

### File Upload
- `POST /api/upload` - Upload image file
- `GET /api/images/:fileName` - Serve uploaded images

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
3. **Bulk operations** for managing multiple staff members
4. **Profile templates** for quick staff setup

### Advanced Features
1. **User authentication** for multi-tenant usage
2. **Role-based permissions** for different user levels
3. **Analytics dashboard** for store performance metrics
4. **Integration APIs** with jewelry management systems
5. **Offline mode** with data synchronization

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

## 📞 Support

The app includes comprehensive error handling and user-friendly notifications. All actions provide immediate feedback, and the mobile-optimized design ensures smooth operation across all devices.

---

*Built with ❤️ for jewelry store professionals who value efficiency and elegant design*