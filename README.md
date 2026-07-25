# 🚀 LeaveFlow

> A production-ready Leave & Attendance Management System built with the MERN Stack, featuring JWT Authentication, Role-Based Access Control (RBAC), Attendance Tracking, Leave Management, Automated Notifications, and CI/CD deployment.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌐 Live Demo

**Frontend:** https://leave-attendance-management-system.vercel.app

**Backend API:** https://leave-attendance-management-system.onrender.com

---

## 📖 About

LeaveFlow is a full-stack enterprise Leave & Attendance Management System developed as an internship project. It streamlines attendance tracking, leave applications, employee management, department management, and administrative operations through a secure role-based architecture.

The application follows modern software engineering practices, including authentication using JWT, secure HTTP-only cookies, automated CI with GitHub Actions, cloud deployment, and a modular MERN architecture.

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based Authentication
- Refresh Token Sessions
- Secure HTTP-only Cookies
- Password Hashing with bcrypt
- Role-Based Access Control (RBAC)
- Protected API Routes

### 👥 Employee & Department Management

- Employee Management
- Department Management
- Manager Assignment
- User Profile Management

### 📅 Attendance Management

- Mark Daily Attendance
- Attendance Dashboard
- Attendance Calendar
- Attendance History
- Attendance Reports

### 🌴 Leave Management

- Apply for Leave
- Leave Approval Workflow
- Leave Balance Tracking
- Leave Status Management
- Automatic Leave Balance Initialization

### 📊 Reporting & Analytics

- Attendance Reports
- Leave Reports
- Dashboard Analytics
- Department-wise Statistics

### ⚙️ Automation

- Attendance Automation Jobs
- Leave Reminder Jobs
- Notification Dispatcher
- Scheduled Background Tasks (Cron Jobs)

### 📧 Notifications

- Email Notifications
- Password Reset Emails
- Automated Email Templates

### 🛠 Developer Experience

- RESTful API
- Swagger API Documentation
- Docker & Docker Compose
- GitHub Actions CI
- ESLint
- Prettier
- Jest Unit Testing
- Cloud Deployment (Render & Vercel)

- ## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, Vite, React Router DOM, Axios, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JSON Web Token (JWT), Refresh Tokens, bcrypt |
| **Authorization** | Role-Based Access Control (RBAC) |
| **API Documentation** | Swagger (OpenAPI) |
| **Cloud Storage** | Cloudinary |
| **Email Service** | Nodemailer (SMTP) |
| **Automation** | node-cron |
| **Testing** | Jest |
| **Code Quality** | ESLint, Prettier |
| **DevOps & CI/CD** | Docker, Docker Compose, GitHub Actions |
| **Deployment** | Vercel (Frontend), Render (Backend) |
| **Version Control** | Git, GitHub |

## 🏗️ System Architecture

```text
                              GitHub
                                 │
                                 ▼
                      GitHub Actions (CI/CD)
                                 │
                                 ▼
                          Build & Test Pipeline
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
              ▼                                     ▼
      Frontend (Vercel)                     Backend (Render)
      React + Vite                          Node.js + Express
              │                                     │
              │ HTTPS REST API                      │
              └──────────────────┬──────────────────┘
                                 │
               ┌─────────────────┼─────────────────┐
               │                 │                 │
               ▼                 ▼                 ▼
        MongoDB Atlas      Cloudinary         SMTP Server
         (Database)      (Image Storage)   (Email Service)
```

### 📖 Architecture Overview

LeaveFlow follows a modern client-server architecture based on the MERN stack.

- **Frontend:** Built with React and Vite, deployed on Vercel.
- **Backend:** RESTful API built with Express.js and deployed on Render.
- **Database:** MongoDB Atlas stores users, attendance, leave requests, departments, and reports.
- **Authentication:** JWT-based authentication with refresh tokens stored in secure HTTP-only cookies.
- **Cloud Storage:** Cloudinary manages image uploads.
- **Email Service:** Nodemailer (SMTP) is used for password reset and notification emails.
- **Automation:** Scheduled background jobs handle attendance, leave reminders, and notification dispatch.
- **CI/CD:** GitHub Actions automatically run linting and tests before deployment.

- 
