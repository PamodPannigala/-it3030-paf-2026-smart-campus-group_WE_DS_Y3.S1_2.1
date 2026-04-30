# 🏫 Smart Campus Operations Hub

A comprehensive platform built with **Spring Boot (Java) REST API** and **React** that streamlines university campus operations by integrating facility & asset booking, maintenance/incident ticketing, notifications, QR code check-in, and role-based access control.

**Note:** This project was developed as part of the **IT3030 – Programming Applications and Frameworks** assignment at **SLIIT, Faculty of Computing**.

The system eliminates manual booking conflicts, provides transparent incident tracking, and ensures efficient utilization of university resources with strong auditability.

## 🎯 Problem Statement

Traditional campus resource and incident management often suffers from:

- **Manual booking & allocation** → delays, double-bookings, and resource conflicts
- **Fragmented incident reporting** → no centralized ticketing system for maintenance issues
- **Poor communication** between students, faculty, technicians, and administration
- **Lack of real-time updates & transparency** for booking and ticket status
- **No proper check-in mechanism** for resource usage verification
- **Scattered systems** for booking, maintenance, and notifications
- **No role-based access** leading to security and authorization issues

## 💡 Our Solution

The Smart Campus Operations Hub provides a unified digital platform with five core modules:

| Module | Description |
|--------|-------------|
| **Module A – Facilities & Assets Catalogue** | Browse, search, and filter bookable resources (lecture halls, labs, meeting rooms, equipment) with metadata (type, capacity, location, availability windows, status) |
| **Module B – Booking Management** | Real-time booking with conflict detection, approval workflow (PENDING → APPROVED/REJECTED → CANCELLED), and QR code check-in |
| **Module C – Maintenance & Incident Ticketing** | Create, track, and resolve incident tickets with categories, priorities, image attachments, and technician assignment |
| **Module D – Notifications** | Real-time in-app notifications for booking approval/rejection, ticket status changes, and new comments |
| **Module E – Authentication & Authorization** | OAuth 2.0 (Google Sign-In) + local login, role-based access (USER, ADMIN, TECHNICIAN, SECURITY) |

### Special Features (Innovation)
- ✅ **QR Code Check-in** for approved bookings with 72-hour expiry and resource confirmation
- ✅ **Admin Dashboard** with usage analytics (booking trends, top resources, check-in statistics)
- ✅ **Service-level Timer** for tickets (time-to-first-response tracking)
- ✅ **Notification Preferences** (enable/disable categories)

## 🚀 Features by Module

### Module A – Facilities & Assets Catalogue
- 🔍 Browse all bookable resources (lecture halls, labs, meeting rooms, equipment)
- 📊 View resource metadata: type, capacity, location, operating hours, availability windows
- 🏷️ Status indicators (ACTIVE / OUT_OF_SERVICE / MAINTENANCE)
- 🔎 Search and filter by type, capacity, location, and status
- 🖼️ Resource images with fallback support

### Module B – Booking Management
- 📅 Real-time booking with availability checking
- ✅ Booking workflow: PENDING → APPROVED / REJECTED → CANCELLED
- ⚡ Conflict detection – prevents overlapping bookings for same resource
- 🔔 Email & in-app notifications for status updates
- 📱 **QR Code generation** for approved bookings
- 🔐 **QR Code check-in** with confirmation dialog and 72-hour expiry
- 📊 Admin dashboard with filters (status, date, check-in status) and analytics
- 📄 PDF report generation with booking statistics

### Module C – Maintenance & Incident Ticketing
- 🛠️ Create incident tickets with category, description, priority, and contact details
- 📎 Upload up to 3 image attachments (evidence for damaged equipment)
- 🔄 Ticket workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- ❌ Admin can set REJECTED with reason
- 👨‍🔧 Assign tickets to technicians
- 📝 Add resolution notes and update ticket status
- 💬 Comment system with edit/delete ownership rules
- ⏱️ Service-level timer (time-to-first-response, time-to-resolution)

### Module D – Notifications
- 🔔 Real-time notifications for booking approval/rejection
- 📬 Notifications for ticket status changes and new comments
- 🔔 Notification panel in the web UI
- ⚙️ Notification preferences (enable/disable categories)

### Module E – Authentication & Authorization
- 🔐 OAuth 2.0 login (Google Sign-In)
- 🔑 Local login with email/password
- 👥 Role-based access control: USER, ADMIN, TECHNICIAN, SECURITY
- 🔒 Secure API endpoints with role restrictions
- 🛡️ Frontend route protection based on user roles

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Core language |
| Spring Boot 3.4.3 | Framework |
| Spring Data JPA | Database ORM |
| Spring Security | Authentication & Authorization |
| Spring Mail | Email notifications |
| MySQL | Relational database |
| JWT | Token-based authentication |
| OAuth 2.0 | Google Sign-In integration |
| ZXing | QR code generation |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| React Router DOM | Navigation |
| Axios | HTTP client for API calls |
| Lucide React | Icons |
| React Hot Toast | Toast notifications |
| React ApexCharts | Analytics and charts |
| html5-qrcode | QR code scanning via webcam |
| jsPDF + jspdf-autotable | PDF report generation |
| Bootstrap 5 / CSS | Styling |

### DevOps & Tools
- Git & GitHub – Version control
- GitHub Actions – CI/CD workflow (build + test)
- Postman – API testing

## ⚙️ Prerequisites

- JDK 21+
- Node.js 18+ and npm
- MySQL 8.0+
- Maven
- Git
- Google Cloud Console account (for OAuth 2.0 credentials)

## 🚀 Getting Started

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/it3030-paf-2026-smart-campus-group_WE_DS_Y3.S1_2.1.git
cd it3030-paf-2026-smart-campus-group_WE_DS_Y3.S1_2.1/backend

# Configure application.properties (update MySQL credentials)
# Configure OAuth 2.0 credentials (Google Client ID & Secret)

# Build and run
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
# 📂 Project Structure

```bash
backend/
├── src/main/java/com/campus/hub/
│   ├── controller/          # REST API Controllers
│   ├── dto/                  # Data Transfer Objects
│   ├── entity/               # JPA Entities
│   ├── repository/           # JPA Repositories
│   ├── service/              # Business Logic
│   └── security/             # Security Configuration
└── src/main/resources/
    └── application.properties

frontend/
├── src/
│   ├── pages/                # Page Components
│   ├── components/           # Reusable Components
│   ├── context/              # React Context
│   ├── services/             # API Services
│   ├── styles/               # CSS Stylesheets
│   └── utils/                # Utility Functions
├── public/                   # Static assets
└── package.json
```
