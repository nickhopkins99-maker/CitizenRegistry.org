# Jewelry Store Profile Management System

A clean, functional web application for managing jewelry store accounts, staff profiles, and photo uploads built with Hono and Cloudflare Workers.

## 🌐 Live Application
- **GitHub Repository**: https://github.com/nickhopkins99-maker/CitizenRegistry.org
- **Live Demo**: [Deployed on Cloudflare Pages]

## 🚀 Features

### ✅ Currently Working
- **🔐 Authentication**: Secure login system
- **📸 Photo Upload**: Upload images for stores and staff (JPG, PNG, GIF, WebP, BMP, SVG)
- **🏪 Store Management**: Create, edit, and manage jewelry store profiles
- **📊 Bulk Import**: Import multiple stores from CSV/Excel files or copy-paste data
- **👥 Staff Profiles**: Add and manage staff members with photos
- **📅 Visit Calendar**: Track customer visits and appointments
- **🗺️ Map Integration**: View store locations on map
- **💾 Data Storage**: Reliable SQLite database with D1
- **📱 Responsive Design**: Works on desktop and mobile

### 🎯 Core Functionality
1. **Store Profiles**: Name, description, contact info, custom fields
2. **Bulk Import**: Import multiple accounts from CSV/Excel with template
3. **Staff Management**: Employee profiles with roles and photos
4. **Visit Tracking**: Calendar system for customer interactions
5. **Photo Storage**: Database-backed image storage system
6. **Search & Filter**: Find stores and staff quickly

## 🔧 Tech Stack

- **Backend**: Hono framework on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Database-based image storage with base64 encoding
- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript
- **Deployment**: Cloudflare Pages
- **Authentication**: Cookie-based session management

## 📦 Project Structure

```
webapp/
├── src/
│   └── index.tsx           # Main Hono application
├── public/
│   └── static/
│       ├── app.js          # Frontend JavaScript
│       └── styles.css      # Custom styles
├── wrangler.jsonc          # Cloudflare configuration
├── package.json            # Dependencies and scripts
└── ecosystem.config.cjs    # PM2 configuration for development
```

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+
- npm
- Wrangler CLI

### Installation
```bash
git clone https://github.com/nickhopkins99-maker/CitizenRegistry.org.git
cd CitizenRegistry.org
npm install
```

### Local Development
```bash
# Build the application
npm run build

# Start local development server
npm run dev:sandbox

# Access at http://localhost:3000
# Login with password: "Family"
```

### Database Setup
```bash
# Create D1 database
npx wrangler d1 create webapp-production

# Update wrangler.jsonc with database ID

# Apply migrations (for production)
npm run db:migrate:prod
```

## 🚀 Deployment

### Cloudflare Pages Deployment
```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy:prod
```

### Environment Variables
- No external API keys required for basic functionality
- Database automatically configured with D1

## 📋 API Endpoints

### Core APIs
- `POST /api/login` - Authentication
- `GET /api/stores` - List all stores
- `POST /api/stores` - Create new store
- `POST /api/stores/bulk-import` - Import multiple stores from CSV data
- `GET /api/excel-template/stores` - Download CSV template for bulk import
- `PUT /api/stores/:id` - Update store
- `POST /api/upload` - Upload images
- `GET /api/images/:id` - Serve images

### Staff Management
- `POST /api/stores/:id/staff` - Add staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Remove staff member

### Visit Tracking
- `POST /api/visits` - Record visit
- `GET /api/visits` - List visits
- `PUT /api/visits/:id` - Update visit

## 🎨 User Interface

### Clean, Intuitive Design
- **No confusing backend buttons** - Removed developer-oriented features
- **Focused functionality** - Only essential business features
- **Professional appearance** - Jewelry industry appropriate styling
- **Accessible interface** - WCAG compliant with proper ARIA labels

### Key UI Components
- **Store Cards**: Visual overview of each jewelry store
- **Profile Editor**: Clean form for editing store/staff details
- **Photo Upload**: Drag-and-drop or click-to-upload interface
- **Visit Calendar**: Grid-based calendar for tracking interactions
- **Map View**: Geographic visualization of store locations

## 🔒 Security Features
- **Authentication required** for all data operations
- **File validation** for uploaded images
- **SQL injection protection** with prepared statements
- **XSS prevention** with proper data sanitization

## 📊 Database Schema

### Tables
- **stores**: Store profiles and contact information
- **staff**: Employee information and roles
- **images**: Photo storage with base64 encoding
- **visits**: Customer visit tracking
- **custom_sections**: Dynamic form fields

## 🐛 Known Limitations
- **Photo storage**: Uses database encoding (suitable for moderate usage)
- **File size limit**: 10MB per image
- **Local development**: Requires D1 database setup

## 📝 Recent Changes
- ✅ **Bulk Import Restored**: Added back professional bulk import functionality for accounts
- ✅ **CSV Template**: Download sample template with realistic jewelry store data
- ✅ **Multiple Import Methods**: File upload OR copy/paste from Excel/Google Sheets
- ✅ **Error Handling**: Detailed validation and error reporting for imports
- ✅ **Fixed Photo Upload**: Database storage system working perfectly
- ✅ **Clean UI**: Professional interface without confusing developer buttons
- ✅ **All Features Working**: Photo upload, bulk import, store management all tested

## 🤝 Contributing
This is a focused business application. For feature requests or bug reports, please open an issue.

## 📄 License
Private project for jewelry store management.

---

**Last Updated**: September 15, 2025  
**Status**: ✅ Fully functional - All buttons and features working  
**Deploy Status**: Ready for production deployment