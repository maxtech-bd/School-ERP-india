# Overview

This Cloud School ERP is a multi-tenant, comprehensive management system designed for educational institutions. It offers 19 core modules, role-based access control, and advanced AI capabilities including an AI Assistant (GPT-4o-mini with OCR/voice), AI Quiz Tool, AI Test Generator, AI Summary Generator, and AI Notes Generator. The system aims to provide an enterprise-grade, scalable, and CMS-first solution with professional reporting and automated assessment tools, ensuring data isolation for multiple tenants.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
- **Frontend Framework**: React 19 SPA using functional components and hooks.
- **Styling**: Tailwind CSS and Shadcn/ui for consistent styling and accessible UI components.
- **Dark Mode**: Comprehensive dark mode support across all routes using Tailwind CSS `dark:` variants with automatic theme detection.
- **Responsiveness**: Fully responsive design across all devices using Tailwind CSS breakpoints and adaptive layouts.

## Recent Changes (December 2025)
- **Enterprise Attendance System**: Comprehensive attendance management system with:
  - Session-based attendance model (class/date/period context) with individual student records
  - Multi-mode tracking: Daily attendance and period-wise attendance support
  - TeacherAttendance component (`/attendance/mark`) - Teachers mark attendance with bulk actions, search, real-time stats
  - StudentAttendanceWidget (`/attendance/my-attendance`) - Students view calendar, history, attendance percentage, apply for leave
  - ParentAttendanceWidget (`/attendance/children`) - Parents view all children's attendance with child selector
  - AdminAttendanceAnalytics (`/attendance/analytics`) - Admins view trends, class comparisons, low attendance alerts, rules configuration
  - Leave management workflow: Students/parents apply, teachers approve/reject
  - Automatic absence notifications to parents via notification system
  - Configurable attendance rules per school (late threshold, minimum percentage, notification settings)
  - Role-based access: teachers see assigned classes only, students/parents view-only, admin full control
  - New MongoDB collections: `attendance_sessions`, `enterprise_attendance`, `attendance_rules`, `student_leave_requests`
  - Backend APIs: `/attendance/enterprise/sessions`, `/attendance/enterprise/mark`, `/attendance/enterprise/student/{id}`, `/attendance/enterprise/my-attendance`, `/attendance/enterprise/parent-view`, `/attendance/leave/apply`, `/attendance/leave/list`, `/attendance/leave/{id}`, `/attendance/enterprise/analytics`, `/attendance/enterprise/rules`
- **Enterprise Fee Management System**: Comprehensive monthly invoice-based fee tracking system with:
  - Monthly billing cycles with automated invoice generation for all students
  - Invoice status tracking (pending, partial, paid, overdue)
  - Student Fee Dashboard (`/fees/my-fees`) - Students can view their payment history, pending fees, and monthly breakdown
  - Parent Fee Dashboard (`/fees/parent-dashboard`) - Parents can view consolidated fee status for all children with child selector
  - Fee invoice payment integration with existing payment processing
  - Dynamic fee summary calculations replacing hardcoded values
  - Role-based access: students view-only, parents view children, admin/accountant manage
  - New MongoDB collections: `fee_invoices`, `fee_billing_cycles`
  - Backend APIs: `/fees/invoices`, `/fees/billing-cycles`, `/fees/student-dashboard/{id}`, `/fees/parent-dashboard`, `/fees/my-fees`
- **School List (Super Admin Panel)**: New centralized control panel for Super Admin to manage all ERP-linked schools (genuine and demo). Features include: school CRUD operations, type classification (small/medium/large), package amount tracking, genuine vs demo school distinction with deletion protection for genuine schools.
- **Mobile Responsiveness Enhancements**: 
  - AI Quiz Tool and AI Test Generator tabs now scroll horizontally on mobile
  - Subject Configuration table converts to card layout on mobile devices
  - Notifications and Rating/Reviews modules optimized for 320px+ screens
  - Footer appears inline at bottom of all routes with background styling
- **Role-Based Route Protection**: Enhanced ProtectedRoute component now supports allowedRoles parameter for route-level access control.
- **Dark Mode Fixes**: Added comprehensive dark mode support to 15+ components including LoginPage, Calendar, Results, StudentResults, ParentResults, RatingSurveys, QuizTool, TestGenerator, AINotes, AISummary, BiometricDevices, Reports, AcademicCMS, Vehicle, and StaffList.
- **AI Model Upgrade**: Upgraded AI Assistant and all AI modules from GPT-4o-mini to GPT-4o (Turbo) for improved response quality.
- **OpenAI Key Management**: Added secure API key management in Settings allowing admins to configure custom OpenAI API keys per tenant without exposing the key to frontend.
- **Mobile Responsiveness**: Enhanced mobile responsiveness across all modules with scrollable tabs (overflow-x-auto, scrollbar-hide), improved layouts for AI Assistant, AI Logs, Academic CMS, and Settings components.

## Technical Implementations
- **Frontend**: React 19, React Router DOM, Axios, Context API.
- **Backend**: FastAPI with async/await, JWT authentication, RBAC, and custom middleware.
- **Database**: MongoDB, designed for multi-tenant data isolation using `tenant_id` and `school_id`.
- **API**: RESTful design, modular organization, consistent error handling, Pydantic for data validation.
- **Mobile App**: React Native (Expo) for iOS/Android, integrating with the backend API for key functionalities.

## Feature Specifications
- **Multi-tenancy & RBAC**: Strict data isolation for schools with granular permissions (super_admin, admin, teacher, student, parent).
- **Core Modules**: Student admissions, attendance, fee management, curriculum, transport, staff management, certificate generation, and user management.
- **Academic Content CMS**: Hierarchical content management system for academic books, reference books, previous years' question papers, and a Q&A knowledge base, supporting file uploads and CRUD operations.
- **AI Modules**:
    - **AI Assistant**: GPT-4o (Turbo) powered chatbot with multi-modal input (text, OCR, voice), RAG, and a CMS-first approach for academic content.
    - **AI Quiz Tool (Student)**: AI-powered quiz generation with customizable filters, auto-grading, and performance tracking.
    - **AI Test Generator (Teacher/Admin)**: AI-powered test generation with curriculum alignment, mixed question types, inline editing, and scheduling.
    - **AI Summary Generator**: Generates structured summaries using a 3-tier RAG CMS-first strategy.
    - **AI Notes Generator**: Generates detailed study notes with examples and practice questions using a 3-tier RAG CMS-first strategy.
- **GiNi School Dashboard**: Professional analytics dashboard providing real-time usage statistics for all AI modules with dynamic filters and interactive charts.
- **Enhanced Class & Subject Management**: Comprehensive module for managing classes, sections, and class-specific subjects, with dynamic subject integration across the ERP.
- **Calendar Module**: School calendar with monthly view, event types, role-based permissions, and tenant isolation.
- **Timetable Module**: Advanced timetable management with automatic period slot adjustment, break configurations, and editable periods.
- **Notification Module**: Event-driven notification system with automatic triggers, role-based access, in-app display, email integration, and customizable templates.
- **Pop-up Rating/Review Module**: Flexible feedback collection system with various formats (rating, MCQ) and response analytics.
- **Bulk Student Upload**: Import multiple students via Excel/CSV with validation, duplicate detection, and progress tracking.
- **Student Result Automation**: Comprehensive result management including exam term configuration, mark entry, bulk upload, automatic grading, publication workflow, and student/parent viewing portals.
- **Dynamic Currency System**: Global currency configuration for the institution, applied across financial modules.

## System Design Choices
- **Build Tooling**: Create React App with Craco and Webpack.
- **Development Environment**: Hot reloading development server.
- **React Performance**: Consistent use of `useCallback` with `useEffect` for async fetches to prevent re-renders.

# External Dependencies

## Frontend
- **React Ecosystem**: React 19, React DOM, React Router DOM.
- **UI & Styling**: Shadcn/ui (Radix UI), Tailwind CSS.
- **Forms & Validation**: React Hook Form.
- **Utilities**: Axios, Recharts, Lucide React, date-fns, Sonner.

## Backend
- **Web Framework**: FastAPI, Uvicorn.
- **Database Drivers**: MongoDB, Motor, PyMongo.
- **Authentication/Security**: PyJWT, bcrypt, python-jose.
- **Data & Configuration**: Pydantic, python-dotenv, Pandas, NumPy.
- **File Handling**: python-multipart.
- **AI/ML**: OpenAI (GPT-4o Turbo, Whisper, TTS), Tesseract OCR (Pytesseract), Pillow.
- **Reporting**: ReportLab (PDF), openpyxl (Excel).

## Cloud Services & Integrations
- **Database Hosting**: MongoDB Atlas.
- **Multi-tenancy**: Subdomain or header-based tenant detection.
- **Email Integration**: Replit Mail API.

## Mobile App (React Native / Expo)
- **Framework**: React Native 0.81.5 with Expo SDK 54.
- **Navigation**: React Navigation (Stack, Tab, Drawer navigators).
- **Dependencies**: axios, @react-native-async-storage/async-storage, expo-linear-gradient, @react-native-picker/picker.
- **Screens (22 total)**:
  - Core: Login, Dashboard, Profile, Settings
  - AI Features: Assistant, Quiz, Summary, Notes, TestGenerator
  - Academic: TimeTable, Calendar, Attendance, Results, AcademicCMS
  - Management: StudentList, StaffList, ClassManagement, UserManagement
  - Financial: Fees, Certificates
  - Communication: CommunicationScreen
  - Analytics: Reports
- **Role-Based Navigation**: Different menu items and quick access buttons for super_admin, admin, teacher, principal, student, and parent roles.
- **API Integration**: Centralized API service layer in `mobile/src/services/api.js` with axios interceptors for JWT token and tenant ID handling.