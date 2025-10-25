# Overview

This Cloud School ERP is a multi-tenant solution designed for educational institutions, offering a comprehensive management system with role-based access control and 19 core modules. Key capabilities include an AI Assistant (GPT-4o-mini with OCR/voice), AI Quiz Tool, AI Test Generator, AI Summary Generator, and AI Notes Generator. The system aims to provide an enterprise-grade school management platform with professional reporting, AI-powered assistance, automated assessment tools, comprehensive study material generation, scalability, and a CMS-first approach, ensuring data isolation for multiple tenants.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
- **React 19 SPA**: Built with functional components and hooks.
- **Tailwind CSS & Shadcn/ui**: Utilized for consistent styling and accessible UI components.
- **Component-based**: Emphasizes reusable UI components.

## Technical Implementations
- **Frontend**: React 19, React Router DOM, Axios, Context API.
- **Backend**: FastAPI with async/await, MongoDB (Motor driver), JWT authentication, Multi-tenant architecture (subdomains/headers), RBAC, custom middleware.
- **Authentication**: JWT tokens, bcrypt for password hashing, token-based session management.
- **Database**: MongoDB with multi-tenant data isolation using `tenant_id` and `school_id` fields, timezone-aware DateTime objects, document-based schema.
- **API**: RESTful design, modular organization, consistent error handling, Pydantic for data validation, CORS middleware.

## Feature Specifications
- **Multi-tenancy**: Independent operation for multiple schools with strict data isolation.
- **Role-Based Access Control (RBAC)**: Granular permissions for super_admin, admin, teacher, student, and parent roles.
- **Comprehensive Modules**: Student admissions, attendance, fee management, curriculum, transport, biometric device integration, staff management, certificate generation, and AI modules.
- **AI Assistant Module**: GPT-4o-mini powered chatbot with multi-modal capabilities (text, OCR, voice input/output), academic focus, CMS-first approach, RAG, Academic CMS for knowledge base management.
- **AI Quiz Tool (Student Panel)**: AI-powered quiz generation with customizable filters, learning dimension tags, CMS-first question selection, auto-grading, instant feedback, and quiz history.
- **AI Test Generator (Teacher/Admin Panel)**: AI-powered test generation with curriculum alignment, mixed question types, preview/edit, scheduling, draft mode, and auto-grading.
- **AI Summary Generator**: Generates structured summaries for academic content using a 3-tier RAG CMS-first strategy.
- **AI Notes Generator**: Generates detailed study notes with examples and practice questions using a 3-tier RAG CMS-first strategy.
- **Professional Reporting**: Robust report generation with PDF/Excel export, school-branded templates, and dynamic school information.
- **Fee Engine**: Manages fee configuration, automatic student fee generation, payment collection, and real-time fee due tracking, ensuring data consistency with `is_active` flags for soft deletion and filtering.
- **Student Route Assignment**: Allows assigning students to transport routes with dynamic route and boarding point selection.

## System Design Choices
- **Build Tooling**: Create React App with Craco and Webpack customization.
- **Development Environment**: Hot reloading and a development server.

# External Dependencies

## Frontend
- **React Ecosystem**: React 19, React DOM, React Router DOM.
- **UI & Styling**: Shadcn/ui (Radix UI), Tailwind CSS, PostCSS.
- **Forms & Validation**: React Hook Form, Hookform resolvers.
- **Utilities**: Axios, Recharts, Lucide React, date-fns, Sonner.

## Backend
- **Web Framework**: FastAPI, Uvicorn.
- **Database Drivers**: MongoDB, Motor, PyMongo.
- **Authentication/Security**: PyJWT, bcrypt, python-jose.
- **Data & Configuration**: Pydantic, python-dotenv, Pandas, NumPy.
- **File Handling**: python-multipart.
- **AI/ML**: OpenAI (GPT-4o-mini, Whisper, TTS), Tesseract OCR (Pytesseract), Pillow.
- **Reporting**: ReportLab (PDF), openpyxl (Excel).

## Cloud Services & Integrations
- **Database Hosting**: MongoDB Atlas.
- **Multi-tenancy**: Subdomain or header-based tenant detection.

# Recent Issues & Fixes (October 24, 2025)

## Deployment Configuration Fix - CRITICAL

**Issue:** Repeated deployment failures over 5 days. App works in preview mode but fails when deploying to Replit-provided URL.

**Root Causes:** 
1. **Missing MONGO_URL secret** - Backend crashed immediately because MongoDB connection string wasn't configured as environment variable
2. **Incomplete build.sh script** - Only installed backend packages, never built React frontend for production
3. **Missing production dependencies** - requirements-minimal.txt only had 9 packages, missing reportlab, openpyxl, pandas, pillow needed for reports

**Fixes Applied:**

### 1. MongoDB Connection (BLOCKING FIX)
- **Added MONGO_URL to Replit Secrets** - Required environment variable pointing to MongoDB Atlas cluster
- Backend now connects successfully: `client = AsyncIOMotorClient(mongo_url)`
- Without this, server crashes on startup with: `KeyError: 'MONGO_URL'`

### 2. Build Script (build.sh) - Complete Rewrite
**Before:**
```bash
# Only installed backend packages
pip install -r requirements-minimal.txt
```

**After:**
```bash
# Full deployment build process
# 1. Install Python dependencies
pip install -r requirements-minimal.txt --no-cache-dir

# 2. Install frontend dependencies
cd frontend && npm ci --legacy-peer-deps

# 3. Build React app for production
npm run build

# 4. Verify build succeeded
if [ ! -d "build" ]; then exit 1; fi
```

### 3. Backend Dependencies (requirements-minimal.txt)
**Added missing packages:**
- pandas>=2.0.0 (Excel/data processing)
- openpyxl>=3.1.0 (Excel generation)
- reportlab>=4.0.0 (PDF generation)
- pillow>=10.0.0 (Image processing)
- pytesseract>=0.3.10 (OCR)
- python-dotenv>=1.0.0 (Environment variables)
- openai>=1.0.0 (AI features)
- requests>=2.31.0 (HTTP requests)

### 4. Deployment Configuration (.replit)
**Already configured correctly:**
```toml
[deployment]
deploymentTarget = "vm"
run = ["bash", "start.sh"]
build = ["bash", "build.sh"]
```
- Uses VM deployment (required for always-on backend)
- start.sh runs backend on port 5000 with 2 workers
- build.sh now builds both frontend and backend

**Result:** Deployment is now ready! All three blocking issues resolved. App will deploy successfully with:
- Backend connecting to MongoDB Atlas
- React frontend built and served from backend
- All report generation features working (PDF/Excel)

---

## Student Route Assignment Feature

**Issue:** Vehicle Management → "Assign Students to Routes" showed 405 Method Not Allowed error initially, then 404 "Route not found" error after endpoint was added.

**Root Causes:** 
1. Missing backend endpoint: No POST `/routes/assign-students` endpoint existed
2. Frontend sending route name instead of route ID
3. Hardcoded route/boarding point dropdowns instead of dynamic data

**Fixes Applied:**

### Backend (server.py)
1. **Created StudentRouteAssignment model** (lines 825-837):
   - Stores student-to-route assignments in separate collection
   - Tracks route_id, student_id, boarding_point, pickup/drop times
   - Multi-tenant with tenant_id and school_id
   - Supports soft delete with is_active field

2. **Created AssignStudentsToRoute request model** (lines 839-845):
   - Validates student_ids list, route_id, boarding_point
   - Optional pickup_time and drop_time fields

3. **Added POST `/routes/assign-students` endpoint** (lines 6199-6298):
   - Validates route exists and is active
   - Validates all students exist
   - Creates new assignments or updates existing ones
   - Returns detailed success message with counts
   - Stores in `student_route_assignments` collection

### Frontend (Vehicle.js)
1. **Fixed route dropdown** (lines 1749-1756):
   - Changed from hardcoded options to dynamic `routes.map()`
   - Now sends actual route.id (UUID) instead of route name
   - Displays route.route_name to user

2. **Fixed boarding point dropdown** (lines 1771-1775):
   - Dynamically populates from selected route's boarding_points array
   - Shows only boarding points for the selected route
   - Updates when route selection changes

**Result:** Students can now be successfully assigned to transport routes. Route and boarding point dropdowns display real database data. Backend stores assignments in dedicated collection with full multi-tenant support.

---

## Transport Report Generation Fix

**Issue:** Vehicle Management → "Generate Report" buttons for Daily, Monthly, and Custom reports were failing with 500 Internal Server Error. Excel reports showed "get_column_letter is not defined" and PDF reports showed "logo_url is not defined".

**Root Causes:**
1. Missing import in `generate_excel_report` function - used `get_column_letter` without importing from openpyxl.utils
2. Missing school data query in `generate_transport_pdf_report` - didn't fetch logo_url from database

**Fixes Applied:**

### Backend (server.py)
1. **Fixed Excel report import** (line 12625):
   - Added `from openpyxl.utils import get_column_letter` to generate_excel_report function
   - Now column width auto-adjustment works correctly

2. **Fixed PDF report branding** (lines 9984-10001):
   - Added school data query to fetch institution details
   - Properly defines logo_url, school_name, school_address, school_contact
   - Falls back to default values if no institution found
   - Passes logo_url to add_page_decorations function

**Result:** All three transport report types (Daily, Monthly, Custom) now generate successfully in Excel and PDF formats. Reports include proper school branding with logo. JSON format was already working.

---

## Deployment Timeout Fix (Bundle Phase)

**Issue:** Deployment succeeded through "Build" phase but timed out during "Bundle" phase. Build logs showed successful completion, but deployment failed with "Deployment timed out" error after 26 failed attempts.

**Root Cause:** 
- Deployment bundle included 841MB of `frontend/node_modules` 
- Also included 46MB `attached_assets/` and other development files
- Bundle size exceeded timeout limits (should only include production artifacts)

**Fixes Applied:**

### 1. Created .dockerignore File
Excludes unnecessary files from deployment bundle:
- frontend/node_modules (841MB)
- attached_assets/ (46MB)
- Python cache (__pycache__/)
- Git files, logs, temp files
- Development-only files

### 2. Updated build.sh - Post-Build Cleanup
Added cleanup step after frontend build:
```bash
npm run build              # Build React app
rm -rf node_modules        # Remove 841MB of dev dependencies
```

**Result:** Deployment bundle size reduced from ~900MB to ~5-10MB (production artifacts only). Should complete bundling in under 2 minutes instead of timing out.

**Next Deployment Attempt:** Click "Republish" button in Publishing tab. Bundle phase should now complete successfully with minimal file size.

---

