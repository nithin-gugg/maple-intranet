# Build a Production-Ready Company Intranet, LMS, SCORM and AI Platform

Build a complete production-ready internal company platform called **Maple Intranet**.

This is a real full-stack enterprise application, NOT a UI-only prototype.

The platform will serve as:

1. Company Intranet
2. Employee Portal
3. Company Document Management Portal
4. Policy Management Portal
5. Employee Directory
6. Company Calendar
7. Internal Learning Management System
8. SCORM LMS
9. xAPI Learning Activity Store
10. Company AI Assistant
11. Admin CMS
12. Training Analytics Dashboard
13. Company Applications Hub
14. Optional Chrome Extension integration

The application must be modular, secure, scalable, responsive and production-ready.

---

# 1. CORE TECHNOLOGY STACK

Use the following stack.

## Frontend

Use:

* Next.js
* TypeScript
* React
* App Router
* Tailwind CSS
* shadcn/ui
* Lucide React
* React Hook Form
* Zod
* TanStack Query
* Recharts
* FullCalendar

Use Server Components wherever appropriate.

Use Client Components only where interactivity requires them.

---

# 2. BACKEND

Use:

* Python
* FastAPI
* Pydantic
* SQLAlchemy 2.0
* Alembic
* PostgreSQL driver using asyncpg
* httpx
* Redis
* Celery where background processing is required

Do NOT use Prisma.

Do NOT use multiple ORMs.

Use **SQLAlchemy 2.0 as the only ORM**.

Use Alembic for database migrations.

The backend must contain all business logic.

Next.js should communicate with FastAPI through well-defined APIs.

---

# 3. DATABASE

Use:

**Supabase PostgreSQL**

Use PostgreSQL as the primary database.

Use:

* PostgreSQL indexes
* Foreign keys
* constraints
* transactions
* JSONB where appropriate
* pgvector for AI embeddings

Do not create a second database.

Supabase PostgreSQL is the single source of truth.

---

# 4. AUTHENTICATION

Use:

**Clerk**

Do NOT build custom authentication.

Clerk handles:

* Login
* Signup
* Logout
* Password reset
* Sessions
* User identity
* Profile image

FastAPI must verify Clerk authentication tokens/server-side.

Do not trust role information sent by the frontend.

All protected backend endpoints must verify:

1. User identity
2. User role
3. Resource permissions

---

# 5. APPLICATION ARCHITECTURE

Use this architecture:

```text
                         MAPLE INTRANET
                              |
                 +------------+------------+
                 |                         |
                 v                         v
          Next.js Frontend          FastAPI Backend
                 |                         |
                 |                         |
                 |                    SQLAlchemy
                 |                         |
                 |                         v
                 |                  Supabase PostgreSQL
                 |                         |
                 |                         |
                 |                    pgvector
                 |                         |
                 |                         |
                 |                    Redis/Celery
                 |                         |
                 |              +----------+----------+
                 |              |          |          |
                 |              v          v          v
                 |           SCORM      xAPI       AI/RAG
                 |                         |
                 |                         v
                 |                       Groq
                 |
                 +---- Google Drive
                 |
                 +---- Confluence
                 |
                 +---- Trello
                 |
                 +---- Chrome Extension
```

---

# 6. PROJECT STRUCTURE

Create a clean project structure.

```text
maple-intranet/

├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── middleware.ts
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── documents/
│   │   │   ├── courses/
│   │   │   ├── scorm/
│   │   │   ├── xapi/
│   │   │   ├── calendar/
│   │   │   ├── announcements/
│   │   │   ├── integrations/
│   │   │   ├── ai/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── database.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   │
│   │   ├── scorm/
│   │   ├── xapi/
│   │   ├── ai/
│   │   ├── rag/
│   │   └── workers/
│   │
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── pyproject.toml
│
├── chrome-extension/
│   ├── manifest.json
│   └── src/
│
├── docker/
├── docs/
├── .env.example
└── README.md
```

Keep frontend and backend independently deployable.

---

# 7. BRAND / UI

The application should look like a premium modern enterprise SaaS platform.

Use a visual style inspired by:

* modern enterprise dashboards
* Notion
* Linear
* Slack
* Microsoft 365
* modern HR portals

But do not copy their designs.

Use:

* clean layouts
* large readable typography
* subtle shadows
* subtle borders
* rounded cards
* modern icons
* smooth transitions
* professional spacing
* responsive layout

Primary brand direction:

* black
* white
* green accent
* subtle green gradients

Use the company brand accent:

```text
#00DC82
```

Use dark text on light backgrounds.

Avoid:

* excessive gradients
* excessive animations
* childish UI
* generic template appearance
* excessive glassmorphism

---

# 8. MAIN NAVIGATION

Desktop sidebar:

```text
Dashboard
Documents
Learning
Calendar
Employees
Announcements
Apps
AI Assistant
```

For administrators:

```text
Admin Dashboard
Employees
Departments
Documents
Categories
Courses
SCORM
Learning Analytics
Calendar
Announcements
Integrations
AI Knowledge
Notifications
Audit Logs
Settings
```

Use role-based navigation.

Employees must not see admin navigation.

---

# 9. TOP NAVIGATION

Top navigation must contain:

* Global Search
* Notifications
* Help
* User Profile
* User Name
* Profile menu

Profile menu:

```text
My Profile
Settings
Sign Out
```

---

# 10. USER ROLES

Create these roles:

```text
SUPER_ADMIN
ADMIN
HR
MANAGER
TRAINING_MANAGER
CONTENT_MANAGER
EMPLOYEE
```

Implement proper RBAC.

Examples:

SUPER_ADMIN:

* everything

ADMIN:

* employee management
* document management
* course management
* system settings

HR:

* employee information
* HR documents
* HR announcements

TRAINING_MANAGER:

* courses
* SCORM
* training analytics

CONTENT_MANAGER:

* documents
* policies
* training content

MANAGER:

* team information
* team training visibility

EMPLOYEE:

* own profile
* documents they are authorized to view
* assigned courses
* calendar
* announcements
* AI assistant

---

# 11. DATABASE MODELS

Create SQLAlchemy models and Alembic migrations.

Core tables:

```text
users
employees
roles
user_roles
departments
```

Documents:

```text
document_categories
documents
document_permissions
document_views
```

Announcements:

```text
announcements
announcement_targets
```

Calendar:

```text
events
event_attendees
```

Learning:

```text
courses
course_categories
course_modules
course_enrollments
course_progress
course_certificates
```

SCORM:

```text
scorm_packages
scorm_package_versions
scorm_manifests
scorm_scos
scorm_attempts
scorm_sessions
scorm_tracking
```

xAPI:

```text
xapi_statements
xapi_actors
xapi_activities
xapi_verbs
```

AI:

```text
knowledge_documents
knowledge_chunks
knowledge_embeddings
ai_conversations
ai_messages
```

Notifications:

```text
notifications
notification_preferences
```

Security:

```text
audit_logs
```

Integrations:

```text
integrations
```

---

# 12. EMPLOYEE DIRECTORY

Create:

```text
/employees
```

Display employees in a modern directory.

Each card:

```text
Profile Image
Name
Designation
Department
Email
```

Features:

* search
* department filter
* designation filter
* status filter
* alphabetical sorting

Employee profile:

```text
Profile image
Name
Designation
Department
Email
Phone
Joining Date
Manager
Location
Bio
Skills
```

Do not display confidential employee information.

---

# 13. DEPARTMENT MANAGEMENT

Departments must be dynamic.

Do not hard-code departments.

Admin can:

* create
* edit
* archive
* restore
* assign employees
* assign manager

Example initial departments:

```text
HR
IT
Marketing
Development
Design
Finance
Sales
Management
Learning & Development
```

These are seed data only.

---

# 14. DOCUMENT SYSTEM

This is a core feature.

Create three primary document categories:

```text
Official Documents
Training Documents
Policy Documents
```

Also create:

```text
Other Documents
```

Admins can create additional categories.

Document structure:

```text
Department
    |
    +---- Category
              |
              +---- Document
```

Example:

```text
HR
 ├── Policies
 │   ├── Leave Policy
 │   ├── Attendance Policy
 │   └── Work From Home Policy
 │
 └── Official
     └── Employee Handbook
```

---

# 15. GOOGLE DRIVE DOCUMENTS

Google Drive is the source of truth.

The application should NOT unnecessarily upload or duplicate company documents.

Store:

```text
title
description
department_id
category_id
drive_url
drive_preview_url
thumbnail_url
document_type
version
effective_date
expiry_date
visibility
status
created_by
updated_by
created_at
updated_at
```

The main document file remains in Google Drive.

---

# 16. DOCUMENT GRID

The employee Documents page should initially show four large category cards.

Desktop:

```text
+----------------------+----------------------+
| Official Documents   | Policy Documents     |
|                      |                      |
| 24 documents         | 18 documents         |
| View All →           | View All →            |
+----------------------+----------------------+

+----------------------+----------------------+
| Training Documents   | Other Documents      |
|                      |                      |
| 12 documents         | 31 documents         |
| View All →           | View All →            |
+----------------------+----------------------+
```

Use two-column large grid.

On mobile, use one column.

---

# 17. DOCUMENT LIST

After selecting a category:

Display document cards.

Each card:

```text
Document icon
Title
Department
Category
Version
Last updated
Preview
Open Full
```

Add:

* search
* filters
* sorting
* pagination

---

# 18. DOCUMENT VIEWER

Route:

```text
/documents/[id]
```

Display:

```text
Back
Document title
Department
Category
Version
Last Updated

Google Drive Preview

Open in Google Drive
```

Use the stored Drive preview URL.

Embed using iframe only where supported.

If preview cannot be embedded:

```text
Preview unavailable.

[Open in Google Drive]
```

---

# 19. DOCUMENT PERMISSIONS

Implement:

```text
ALL_EMPLOYEES
DEPARTMENT
ROLE
MANAGERS_ONLY
SPECIFIC_USERS
```

Permissions must be enforced by FastAPI.

Never rely on frontend filtering for security.

---

# 20. ADMIN DOCUMENT CMS

Create:

```text
/admin/documents
/admin/documents/new
/admin/documents/[id]/edit
```

Admin can:

* create
* edit
* delete
* archive
* publish
* update Drive URL
* change category
* change department
* change permissions
* update version
* set effective date
* set expiry date

Document status:

```text
DRAFT
PUBLISHED
ARCHIVED
```

---

# 21. EMPLOYEE DASHBOARD

Create:

```text
/dashboard
```

Display:

```text
Good morning, [Employee Name] 👋

Welcome to Maple Intranet.
```

Widgets:

```text
Documents
My Learning
Upcoming Events
Employees
Announcements
```

Then:

```text
Important Documents

Official Documents
Policies
Training
```

Then:

```text
Continue Learning
```

Then:

```text
Upcoming Events
```

Then:

```text
Connected Apps
```

---

# 22. ANNOUNCEMENTS

Create announcement CMS.

Admin can:

* create
* edit
* publish
* schedule
* archive
* target users
* target department
* target role

Announcement fields:

```text
title
content
image
priority
publish_at
expires_at
created_by
```

Priority:

```text
NORMAL
IMPORTANT
URGENT
```

---

# 23. CALENDAR

Create:

```text
/calendar
```

Use FullCalendar.

Views:

* month
* week
* day
* agenda

Event types:

```text
COMPANY_EVENT
HOLIDAY
TRAINING
MEETING
BIRTHDAY
WORK_ANNIVERSARY
ANNOUNCEMENT
```

Admins can create and manage events.

Employees can view events.

---

# 24. CONFLUENCE

Create an Apps page.

Display:

```text
Confluence
Company Knowledge Base

[Open Confluence]
```

Initially support configured URL redirect.

Admin can configure:

```text
name
workspace_url
description
icon
enabled
```

Architecture must allow future Confluence API integration.

---

# 25. TRELLO

Create:

```text
Trello
Project Management

[Open Trello]
```

Admin configures:

```text
workspace_url
display_name
description
icon
enabled
```

Initially redirect to the configured Trello URL.

Architecture should later support Trello API.

Future:

* boards
* cards
* assigned cards
* due dates

---

# 26. LEARNING MANAGEMENT SYSTEM

Create:

```text
/learning
```

Sections:

```text
All Courses
My Courses
Mandatory
In Progress
Completed
```

Course card:

```text
Course image
Course title
Description
Category
Duration
Progress
Status
```

---

# 27. COURSE DETAILS

Route:

```text
/learning/courses/[id]
```

Show:

```text
Course title
Description
Category
Duration
Difficulty
Instructor
Learning objectives
Modules
Mandatory/Optional
Progress
Start Course
Continue Course
```

---

# 28. COURSE ASSIGNMENT

Admins can assign courses to:

```text
ALL_EMPLOYEES
DEPARTMENT
ROLE
SPECIFIC_USERS
```

Course type:

```text
OPTIONAL
MANDATORY
```

Enrollment statuses:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
FAILED
EXPIRED
```

---

# 29. SCORM SUPPORT

Implement a real SCORM engine.

Start with:

**SCORM 1.2**

Architecture must allow future SCORM 2004 support.

Do NOT fake SCORM by simply displaying index.html.

The application must implement the SCORM runtime API.

---

# 30. SCORM ADMIN UPLOAD

Admin workflow:

```text
Courses
↓
Create Course
↓
Upload SCORM ZIP
↓
Validate ZIP
↓
Extract ZIP
↓
Find imsmanifest.xml
↓
Parse manifest
↓
Identify SCO
↓
Identify launch file
↓
Create package version
↓
Publish
```

---

# 31. SCORM ZIP SECURITY

Treat every uploaded ZIP as untrusted.

Prevent:

```text
../../
absolute paths
directory traversal
unsafe extraction
oversized packages
malicious file structures
```

Validate:

* ZIP integrity
* manifest existence
* XML validity
* launch file existence
* SCO resources

Each SCORM package must have isolated storage.

Example:

```text
/scorm/
  course-id/
    package-version-id/
      imsmanifest.xml
      index.html
      assets/
      css/
      js/
```

---

# 32. SCORM MANIFEST

Parse:

```text
imsmanifest.xml
```

Extract:

```text
course title
organization
SCOs
resources
launch URL
metadata
```

Store manifest metadata in database.

---

# 33. SCORM PLAYER

Create:

```text
/learning/scorm/[attempt_id]
```

Player:

```text
+------------------------------------------------+
| Course Name                       Progress 70% |
+------------------------------------------------+
|                                                |
|                                                |
|               SCORM COURSE                     |
|                                                |
|                                                |
+------------------------------------------------+
| Exit                 Previous        Next      |
+------------------------------------------------+
```

Run SCORM content in an iframe.

---

# 34. SCORM 1.2 API

Implement:

```text
LMSInitialize
LMSFinish
LMSGetValue
LMSSetValue
LMSCommit
LMSGetLastError
LMSGetErrorString
LMSGetDiagnostic
```

Support important SCORM values:

```text
cmi.core.lesson_status
cmi.core.score.raw
cmi.core.score.min
cmi.core.score.max
cmi.core.session_time
cmi.core.total_time
cmi.core.lesson_location
cmi.suspend_data
cmi.core.entry
cmi.core.exit
cmi.interactions
```

Persist values.

Use batching/debouncing to prevent excessive database writes.

---

# 35. SCORM RESUME

Support:

```text
suspend_data
lesson_location
```

When an employee returns to a course:

```text
Continue where you left off.
```

Restore previous SCORM state.

---

# 36. SCORM ATTEMPTS

Track:

```text
employee
course
package version
attempt number
started_at
last_activity_at
completed_at
status
score
progress
time_spent
```

Support multiple attempts.

Do not destroy historical attempts when a course package is replaced.

---

# 37. SCORM COMPLETION

Map:

```text
passed
completed
failed
incomplete
browsed
not attempted
```

to application course statuses.

When completed:

Store:

```text
completion date
score
time spent
attempt
```

---

# 38. TRAINING ANALYTICS

Admin learning dashboard:

```text
Total Courses
Total Enrollments
Completed
In Progress
Not Started
Failed
```

Charts:

```text
Completion Rate
Average Score
Training by Department
Course Completion
```

Course table:

```text
Course
Enrollments
Completion %
Average Score
Pass Rate
Average Time
```

Employee table:

```text
Employee
Course
Status
Progress
Score
Time
Attempt
Completed
```

---

# 39. CERTIFICATES

Support course certificates.

When a course is completed:

Generate a certificate record.

Fields:

```text
certificate_id
employee_id
course_id
completion_date
score
certificate_url
```

Generate a professional PDF certificate later or through a certificate service.

---

# 40. xAPI

Implement xAPI support.

Create endpoint:

```text
/api/xapi/statements
```

Validate xAPI statements.

Support:

```text
actor
verb
object
result
context
timestamp
authority
```

Store statements.

Support common learning verbs:

```text
launched
initialized
experienced
progressed
completed
passed
failed
answered
```

---

# 41. SCORM + xAPI

Keep the two systems logically separate.

SCORM:

```text
SCORM Course
↓
SCORM API
↓
SCORM tracking
```

xAPI:

```text
Learning Activity
↓
xAPI statement
↓
xAPI store
```

Optionally generate xAPI statements from important SCORM events.

For example:

```text
SCORM course completed
↓
Create xAPI completed statement
```

---

# 42. CHROME EXTENSION

Create a separate optional Chrome Extension using:

**Chrome Manifest V3**

The extension should NOT be a covert surveillance tool.

Only implement explicitly approved business functionality.

Possible features:

```text
Open Maple Intranet
View assigned learning
View announcements
Quick access to company resources
Open documents
Open Trello
Open Confluence
```

Potential future learning integration:

```text
Detect approved company learning pages
Send approved learning activity
```

Do NOT collect:

* passwords
* keystrokes
* personal browsing history
* unrelated website contents
* private data

Never put secret API keys in the extension.

Authenticate the extension against the backend.

---

# 43. AI ASSISTANT

Create:

```text
/ai
```

Modern AI chat UI.

Features:

* new conversation
* conversation history
* chat messages
* copy answer
* regenerate
* source citations
* source document links

Example:

Employee:

```text
What is the company leave policy?
```

Assistant:

```text
According to the Leave Policy v2.1...

Source:
Leave Policy
```

---

# 44. GROQ

Use Groq API.

Environment variables:

```text
GROQ_API_KEY
GROQ_MODEL
```

The key must remain server-side.

Use Python FastAPI AI service.

Architecture:

```text
Next.js
↓
FastAPI
↓
RAG
↓
Groq
↓
Answer
```

Never call Groq directly from browser code.

---

# 45. RAG

Implement RAG using:

```text
PostgreSQL
+
pgvector
```

Knowledge sources:

* approved company policies
* official documents
* training documents
* internal knowledge
* FAQ

Pipeline:

```text
Document
↓
Extract text
↓
Clean
↓
Chunk
↓
Embedding
↓
pgvector
```

Question:

```text
Question
↓
Authorization
↓
Permission-filtered vector search
↓
Relevant chunks
↓
Groq
↓
Answer
↓
Citations
```

---

# 46. AI DOCUMENT PERMISSIONS

This is mandatory.

If an employee cannot access a document through the normal document system, the AI must not retrieve that document.

Permission filtering happens BEFORE the content reaches Groq.

Never allow:

```text
AI
↓
retrieve everything
↓
filter afterward
```

Instead:

```text
User
↓
permissions
↓
allowed documents
↓
vector search
↓
Groq
```

---

# 47. AI HALLUCINATION CONTROL

If the answer cannot be found in authorized company sources:

Say:

```text
I couldn't find an authoritative company document covering this question.
```

Do not fabricate company policies.

Provide source citations whenever possible.

---

# 48. AI DOCUMENT INGESTION

Company documents remain in Google Drive.

For AI indexing, approved documents can be processed.

Store metadata:

```text
source_document_id
source_url
department
category
version
permissions
last_indexed_at
```

When a document is:

```text
updated
archived
deleted
```

update or remove corresponding AI knowledge.

---

# 49. GLOBAL SEARCH

Implement global search across:

```text
Documents
Courses
Employees
Announcements
Events
```

Admin search additionally:

```text
SCORM packages
Audit logs
```

Search must support:

* debounce
* filtering
* sorting
* pagination

---

# 50. NOTIFICATIONS

Create notification system.

Types:

```text
DOCUMENT_UPDATED
NEW_ANNOUNCEMENT
COURSE_ASSIGNED
COURSE_COMPLETED
TRAINING_REMINDER
EVENT_REMINDER
SYSTEM_NOTIFICATION
```

Show notification bell.

Support:

```text
read
unread
mark all as read
```

---

# 51. AUDIT LOGGING

Log sensitive actions.

Examples:

```text
Admin uploaded SCORM package
Admin updated policy
Admin changed employee role
Admin deleted document
Admin assigned training
```

Store:

```text
user_id
action
resource_type
resource_id
metadata
timestamp
ip_address
user_agent
```

Only authorized admins can view logs.

---

# 52. ADMIN DASHBOARD

Create:

```text
/admin
```

Widgets:

```text
Total Employees
Active Employees
Total Documents
Published Documents
Total Courses
Active Enrollments
Completion Rate
Upcoming Events
```

Charts:

```text
Training Completion
Course Performance
Department Training
Document Activity
```

---

# 53. ADMIN COURSE CMS

Routes:

```text
/admin/courses
/admin/courses/new
/admin/courses/[id]/edit
```

Admin can:

* create course
* edit course
* upload thumbnail
* upload SCORM package
* assign employees
* set mandatory
* publish
* unpublish
* archive
* view analytics

---

# 54. ADMIN SCORM MANAGEMENT

Routes:

```text
/admin/scorm
/admin/scorm/upload
/admin/scorm/[id]
```

Show:

```text
Package
Course
Version
Manifest
SCO count
Launch file
Uploaded date
Status
```

Allow:

```text
Upload
Replace
Archive
Delete
View
```

Never delete historical package versions if existing training records depend on them.

---

# 55. API STRUCTURE

FastAPI routes:

```text
/api/v1/auth
/api/v1/users
/api/v1/employees
/api/v1/departments
/api/v1/documents
/api/v1/categories
/api/v1/courses
/api/v1/enrollments
/api/v1/scorm
/api/v1/xapi
/api/v1/calendar
/api/v1/announcements
/api/v1/integrations
/api/v1/notifications
/api/v1/ai
/api/v1/admin
/api/v1/audit
```

Use:

* Pydantic request schemas
* Pydantic response schemas
* dependency injection
* service layer
* repository layer where useful
* consistent error handling

---

# 56. API ERROR FORMAT

Use consistent errors.

Example:

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document not found"
  }
}
```

Never expose Python stack traces.

---

# 57. DATABASE DESIGN

Use proper normalization.

Use:

* foreign keys
* unique constraints
* indexes
* cascading rules carefully
* created_at
* updated_at

Add indexes for:

```text
employees.email
employees.department_id
employees.status

documents.category_id
documents.department_id
documents.status
documents.created_at

course_enrollments.user_id
course_enrollments.course_id
course_enrollments.status

scorm_attempts.user_id
scorm_attempts.course_id

notifications.user_id
notifications.read

audit_logs.user_id
audit_logs.created_at
```

---

# 58. STORAGE

Use Supabase Storage.

Buckets:

```text
scorm-packages
scorm-extracted
employee-assets
certificates
```

Do not expose storage publicly unless intentionally required.

Use signed URLs where appropriate.

---

# 59. REDIS / CELERY

Use Redis and Celery for operations that should not block HTTP requests.

Examples:

```text
SCORM ZIP processing
AI document ingestion
embedding generation
certificate generation
notification jobs
analytics aggregation
```

The initial application must still function without unnecessary background complexity.

Use background jobs only where beneficial.

---

# 60. SECURITY

Implement:

* Clerk authentication
* RBAC
* server-side authorization
* request validation
* file validation
* secure ZIP extraction
* rate limiting
* CORS
* secure headers
* CSP
* XSS protection
* SQL injection protection
* audit logs
* secure environment variables

Never expose:

```text
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY
CLERK_SECRET_KEY
```

to frontend code.

---

# 61. SCORM SECURITY

SCORM packages contain HTML and JavaScript.

Treat them as untrusted code.

Isolate SCORM content from the main application.

Do not allow SCORM content to:

* access admin APIs
* access application cookies
* access authentication tokens
* access arbitrary internal APIs

Use appropriate:

* iframe isolation
* sandboxing where compatible
* CSP
* separate serving origin/path where practical

---

# 62. PERFORMANCE

Optimize:

* database queries
* API responses
* frontend bundles
* image loading
* search
* document listing
* course listing

Use:

* pagination
* indexes
* lazy loading
* caching
* TanStack Query
* efficient SQLAlchemy queries
* select only necessary fields
* avoid N+1 queries

Do not load all employees/documents/courses into the browser.

---

# 63. LOADING / ERROR / EMPTY STATES

Every page must have:

Loading state
Skeleton
Empty state
Error state

Examples:

```text
No documents found.
```

```text
No courses assigned.
```

```text
Unable to load calendar.
Retry
```

---

# 64. ACCESSIBILITY

Target WCAG 2.1 AA where practical.

Implement:

* semantic HTML
* keyboard navigation
* focus states
* accessible dialogs
* accessible forms
* ARIA labels
* sufficient color contrast

---

# 65. TESTING

Create tests for:

Authentication
RBAC
Employees
Documents
Permissions
Courses
Enrollments
SCORM
xAPI
AI authorization
Audit logging

Critical E2E flows:

```text
Employee login
↓
Dashboard
↓
Open document
```

```text
Admin login
↓
Create document
↓
Employee sees document
```

```text
Admin
↓
Upload SCORM
↓
Publish
↓
Employee launches
↓
Progress
↓
Resume
↓
Complete
↓
Analytics
```

```text
Employee
↓
AI
↓
Question
↓
Permission filtering
↓
RAG
↓
Groq
↓
Cited answer
```

---

# 66. SCORM TEST PACKAGE

Create a simple valid SCORM 1.2 test package.

It must test:

```text
LMSInitialize
LMSGetValue
LMSSetValue
LMSCommit
LMSFinish
lesson_status
score
suspend_data
lesson_location
session_time
```

Use this package to test the runtime.

---

# 67. SEED DATA

Create development seed data.

Departments:

```text
HR
IT
Marketing
Development
Design
Finance
Sales
Management
Learning & Development
```

Document categories:

```text
Official Documents
Training Documents
Policies
Other Documents
```

Courses:

```text
Company Induction
Cybersecurity Awareness
Workplace Safety
```

Events:

```text
Company Meeting
Training Session
Holiday
```

Do not hard-code these values into frontend code.

---

# 68. ENVIRONMENT VARIABLES

Create `.env.example`.

Include:

```text
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Backend
BACKEND_URL=

# Database
DATABASE_URL=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Groq
GROQ_API_KEY=
GROQ_MODEL=

# Redis
REDIS_URL=

# Confluence
CONFLUENCE_URL=
CONFLUENCE_CLIENT_ID=
CONFLUENCE_CLIENT_SECRET=

# Trello
TRELLO_API_KEY=
TRELLO_API_TOKEN=

# xAPI
XAPI_ENDPOINT=
XAPI_USERNAME=
XAPI_PASSWORD=
```

Never commit actual values.

---

# 69. DEPLOYMENT

Recommended deployment:

Frontend:

```text
Vercel
```

Backend:

```text
Render
```

or:

```text
AWS
OCI
Railway
```

Database:

```text
Supabase
```

Storage:

```text
Supabase Storage
```

Redis:

```text
Upstash Redis
```

Use environment variables in production.

---

# 70. OPTIONAL DOCKER

Provide Dockerfiles for:

```text
frontend
backend
```

Create:

```text
docker-compose.yml
```

for optional self-hosted deployment.

Do not make Docker mandatory for local development if it is unnecessary.

---

# 71. README

Create complete README documentation.

Include:

```text
Architecture
Prerequisites
Installation
Environment Variables
Clerk Setup
Supabase Setup
Database Setup
Alembic Migrations
Running FastAPI
Running Next.js
Running Redis
Running Celery
Running Tests
SCORM Testing
xAPI Testing
Groq Setup
Deployment
Troubleshooting
```

---

# 72. DEVELOPMENT PHASES

Do NOT try to implement everything simultaneously.

Keep the project buildable after every phase.

## PHASE 1

Build:

```text
Next.js
FastAPI
Supabase
SQLAlchemy
Alembic
Clerk
RBAC
Base layout
Sidebar
Top navigation
```

Verify everything works.

---

## PHASE 2

Build:

```text
Employees
Departments
Employee profiles
Admin employee management
```

---

## PHASE 3

Build:

```text
Documents
Categories
Drive URLs
Drive preview
Document permissions
Document CMS
```

---

## PHASE 4

Build:

```text
Dashboard
Announcements
Calendar
Notifications
```

---

## PHASE 5

Build:

```text
Confluence
Trello
Apps Hub
```

---

## PHASE 6

Build:

```text
Learning
Courses
Enrollment
Assignments
Progress
Completion
```

---

## PHASE 7

Build the actual:

```text
SCORM 1.2 engine
```

Do not fake this.

---

## PHASE 8

Build:

```text
SCORM analytics
Certificates
Attempts
Resume
```

---

## PHASE 9

Build:

```text
xAPI
xAPI statements
Learning Activity Store
```

---

## PHASE 10

Build:

```text
Groq
RAG
pgvector
AI chat
Source citations
Permission-aware retrieval
```

---

## PHASE 11

Build:

```text
Chrome Manifest V3 extension
```

---

## PHASE 12

Complete:

```text
Security
Testing
Performance
Accessibility
Deployment
Documentation
```

---

# 73. DEVELOPMENT RULES

Do not generate fake functionality.

Do not leave buttons that do nothing.

Do not use mock APIs in the production implementation.

Do not hard-code database records.

Do not put secrets in frontend code.

Do not use Prisma.

Do not use another ORM.

Use:

```text
SQLAlchemy 2.0
+
Alembic
```

for all Python database access.

Keep business logic in FastAPI services.

Keep frontend presentation logic in Next.js.

---

# 74. COMPONENT ARCHITECTURE

Create reusable components.

Examples:

```text
Sidebar
TopNav
DashboardWidget
DocumentCard
DocumentGrid
DocumentViewer
CategoryCard
EmployeeCard
EmployeeTable
EmployeeProfile
CourseCard
CourseProgress
CoursePlayer
SCORMPlayer
CalendarWidget
AnnouncementCard
NotificationMenu
IntegrationCard
AIChat
AIMessage
SearchBar
DataTable
ConfirmDialog
```

---

# 75. SERVICE ARCHITECTURE

Backend services:

```text
employee_service
department_service
document_service
permission_service
course_service
enrollment_service
scorm_service
xapi_service
calendar_service
announcement_service
notification_service
integration_service
ai_service
rag_service
audit_service
```

Use dependency injection.

Keep routers thin.

Business logic belongs in services.

---

# 76. FINAL ACCEPTANCE CRITERIA

The application is complete only when:

## Authentication

* Clerk login works
* Logout works
* Protected routes work
* RBAC works
* Backend verifies identity

## Documents

* Admin can create documents
* Admin can edit documents
* Admin can archive documents
* Google Drive preview works
* Full document view works
* Search works
* Permissions work

## Employees

* Employee directory works
* Profiles work
* Departments work
* Admin management works

## Calendar

* Events work
* Admin can manage events
* Employees can view events

## Applications

* Confluence works
* Trello works

## LMS

* Courses work
* Enrollment works
* Assignment works
* Progress works
* Completion works

## SCORM

* ZIP upload works
* ZIP validation works
* Manifest parsing works
* SCO detection works
* Launch works
* SCORM 1.2 API works
* Tracking works
* Resume works
* Score works
* Completion works
* Attempts work
* Analytics work

## xAPI

* Statements are validated
* Statements are stored
* Learning activities are tracked
* Analytics can consume xAPI events

## AI

* Groq works
* RAG works
* pgvector works
* Permission filtering works
* Sources are shown
* AI does not fabricate company policy

## Admin

* CMS works
* Employee management works
* Course management works
* SCORM management works
* Analytics works
* Audit logs work

## Security

* Secrets are protected
* RBAC enforced server-side
* SCORM packages isolated
* AI respects permissions
* Uploaded ZIPs are validated
* API rate limits exist where appropriate

## Quality

* No broken imports
* No TypeScript errors
* No Python errors
* No unused fake buttons
* No fake API responses in production paths
* Responsive UI
* Accessible UI
* Proper loading states
* Proper error states
* Proper empty states

---

# 77. FINAL INSTRUCTION TO THE AI BUILDER

Treat this document as the complete technical specification.

Do not reduce the requirements to a simple dashboard.

Build the application as a modular production system.

Start with Phase 1.

After Phase 1 is complete and verified, proceed to Phase 2.

At the end of every phase:

1. Run frontend type checking.
2. Run frontend linting.
3. Run backend tests.
4. Run Alembic/database validation.
5. Verify API endpoints.
6. Verify authentication.
7. Verify authorization.
8. Verify the UI.
9. Fix all errors before continuing.
10. Keep the repository in a runnable state.

Do not proceed with broken functionality.

The final result should be a complete enterprise-grade Maple Intranet combining:

Company Intranet
+
Document Portal
+
Employee Directory
+
Calendar
+
Applications Hub
+
Learning Management System
+
SCORM LMS
+
xAPI
+
AI/RAG Assistant
+
Admin CMS
+
Training Analytics
+
Optional Chrome Extension

Build it cleanly, securely, modularly and with production-quality code.
