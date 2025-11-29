# Overview

This Cloud School ERP is a multi-tenant solution designed for educational institutions, offering a comprehensive management system with role-based access control and 19 core modules. It includes advanced AI capabilities such as an AI Assistant (GPT-4o-mini with OCR/voice), AI Quiz Tool, AI Test Generator, AI Summary Generator, and AI Notes Generator. The system aims to provide an enterprise-grade school management platform with professional reporting, AI-powered assistance, automated assessment tools, comprehensive study material generation, scalability, and a CMS-first approach, ensuring data isolation for multiple tenants.

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
- **Academic Content CMS Module**: Comprehensive content management system with hierarchical navigation for organizing academic resources. Features include: (1) Academic Books section with class/subject organization, (2) Reference Books section with drill-down navigation (Class → Subject → Books with Author/Chapters), (3) Previous Years' Question Papers section with hierarchical browsing (Class → Subject → Year → Paper Type), (4) Q&A Knowledge Base for questions and answers, (5) File upload support for PDF/TXT/DOCX files up to 30MB, (6) Breadcrumb navigation and back buttons for intuitive browsing, (7) Full CRUD operations at appropriate hierarchy levels, (8) Chapter-wise book display with smart detection - books with chapters show "View Chapters" button that opens a modal listing all chapters with file links, books without chapters show "Full Book" button that opens the complete book file, (9) Chapter count badges displayed on book cards for quick reference.
- **AI Assistant Module**: GPT-4o-mini powered chatbot with multi-modal capabilities (text, OCR, voice input/output), academic focus, CMS-first approach, RAG, Academic CMS for knowledge base management. Supports content source filtering including Academic Books, Reference Books, Q&A Knowledge Base, and Previous Years' Papers.
- **AI Quiz Tool (Student Panel)**: AI-powered quiz generation with customizable filters, learning dimension tags, CMS-first question selection, auto-grading, instant feedback, quiz history, and chapter-wise performance tracking with detailed analytics showing average scores, accuracy, and progress per chapter.
- **AI Test Generator (Teacher/Admin Panel)**: AI-powered test generation with curriculum alignment, mixed question types, inline question editing, preview/edit, maximum marks configuration per subject, scheduling, draft mode, and auto-grading. Teachers can edit questions directly with save/cancel controls.
- **AI Summary Generator**: Generates structured summaries for academic content using a 3-tier RAG CMS-first strategy. Supports filtering by class, subject, and chapter for targeted content generation.
- **AI Notes Generator**: Generates detailed study notes with examples and practice questions using a 3-tier RAG CMS-first strategy. Supports filtering by class, subject, and chapter for precise note generation.
- **GiNi School Dashboard**: Professional analytics dashboard with real-time usage statistics for all AI modules (AI Assistant, Quiz, Test Generator, Summary, Notes). Features include: 4 summary cards (Total Students Using AI, Total AI Interactions, Active Classes, Weekly Growth), dynamic filters (Week/Month, Class, Subject), module tabs for drill-down analysis, three interactive charts (Usage Trend line chart, Class-wise bar chart, Subject-wise bar chart), detailed data table, and export options (PDF, Excel, Share Report). Fully responsive design matching buyer specifications.
- **Professional Reporting**: Robust report generation with PDF/Excel export, school-branded templates, and dynamic school information.
- **Fee Engine**: Manages fee configuration, automatic student fee generation, payment collection, and real-time fee due tracking.
- **Student Route Assignment**: Allows assigning students to transport routes with dynamic route and boarding point selection.
- **User Management and Admin Control System**: Comprehensive system for super_admins to manage users, reset passwords, suspend/activate accounts, and view audit logs, secured with role-based access and audit logging.
- **Calendar Module**: School calendar management system with monthly view, event filtering, and role-based permissions. Features include: (1) Monthly calendar view with event markers and navigation, (2) Event types: holidays, school events, functions, exams, meetings, sports events, cultural events, (3) Add/Edit/Delete events with modals (Admin only), (4) Role-based permissions: Admins have full CRUD access, Teachers/Students have view-only access, (5) Upcoming events sidebar, (6) Color-coded event types for easy visualization, (7) Tenant isolation with strict verification on all write operations.
- **Timetable Module (Day Structure Mode)**: Advanced timetable management with automatic period slot adjustment. Features include: (1) Create timetables with configurable periods per day (1-12), (2) Automatic slot adjustment - when periods per day is increased/decreased, slots are automatically added/removed across Monday-Saturday, (3) Preserves existing subject/teacher/room assignments when adjusting periods, (4) Break period configuration with Morning Break (period 4) and Lunch Break (period 7), (5) Edit individual periods via click-to-edit with subject/teacher/room selection, (6) Weekly schedule view with color-coded periods, (7) Changes persist after Edit → Modify Subjects → Save.
- **Notification Module**: Comprehensive event-driven notification system with automatic triggers and role-based access. Features include: (1) Automatic event-driven notifications triggered by: New admissions, Attendance marking (absent alerts to parents, late alerts to admin), Fee payments and overdue reminders, Calendar event creation, Timetable updates, (2) Admin/Teacher can view/edit/delete notifications, Students can view only, (3) Real-time header bell icon with unread count badge, (4) In-app notification display with read/unread tracking, (5) Class-wise, Section-wise, Subject-wise filtering, (6) Built-in templates: Timetable Upgrade, Exam Date Alert, Progress Report Update, Custom Notification, (7) Notification format with Title + Body, (8) Priority levels (low, normal, high, urgent), (9) Mark as read/Mark all as read functionality, (10) Notification Settings API for admin configuration, (11) Background task processing using FastAPI BackgroundTasks for non-blocking delivery, (12) NotificationService for centralized notification management with email integration via Replit Mail API.
- **Pop-up Rating/Review Module**: Feedback collection system with multiple formats. Features include: (1) Rating + Text pop-up format, (2) Rating Only format, (3) MCQ (Multiple Choice) format, (4) Can be sent to Admin/Staff/Students with role-based targeting, (5) Mandatory response option, (6) 5-star or 10-point rating scales, (7) Response analytics with distribution charts, (8) Pending surveys notification for mandatory responses.
- **Bulk Student Upload**: Import multiple students from Excel file using a standardized template. Features include: (1) Download sample Excel template with all required columns, (2) Upload Excel (.xlsx/.xls) or CSV files, (3) Automatic column mapping for template variations (handles F/phone, F/ Whatsapp no, M/phone, M/whatsapp no, email id columns), (4) Per-row validation with detailed error messages showing missing fields, (5) Duplicate detection based on admission number, (6) Progress tracking with success/failure counts, (7) Extended contact fields: father_whatsapp, mother_phone, mother_whatsapp, (8) Role-based access for Admin and Teacher roles.

## System Design Choices
- **Build Tooling**: Create React App with Craco and Webpack customization.
- **Development Environment**: Hot reloading and a development server.
- **React Performance Pattern**: All async fetch functions in useEffect hooks are wrapped in useCallback with proper dependency arrays to prevent infinite render loops. This pattern is consistently applied across AINotes, AISummary, and AILogs components.

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