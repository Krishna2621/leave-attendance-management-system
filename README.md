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

<p align="center">
  <img src="docs/images/system-architecture.png" alt="LeaveFlow System Architecture" width="100%">
</p>

### 📖 Architecture Overview

LeaveFlow follows a modern client-server architecture built on the MERN stack.

- **Frontend:** React + Vite deployed on **Vercel**
- **Backend:** Express.js REST API deployed on **Render**
- **Database:** MongoDB Atlas
- **Authentication:** JWT + Refresh Tokens using HTTP-only cookies
- **Cloud Storage:** Cloudinary
- **Email Service:** SMTP (Nodemailer)
- **Automation:** Background Cron Jobs
- **CI/CD:** GitHub Actions

- ## 📂 Project Structure

```
leave-attendance-management-system/
│
├── backend/                  # Express.js Backend
│   ├── config/               # Database & application configuration
│   ├── controllers/          # Business logic
│   ├── middleware/           # Authentication & validation
│   ├── models/               # Mongoose models
│   ├── routes/               # REST API routes
│   ├── services/             # Email & automation services
│   ├── templates/            # Email templates
│   ├── utils/                # Helper utilities
│   ├── tests/                # Jest test cases
│   └── server.js             # Entry point
│
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   └── utils/
│   └── public/
│
├── docs/                     # Documentation & diagrams
├── .github/                  # GitHub Actions workflows
├── docker-compose.yml        # Docker Compose configuration
├── README.md                 # Project documentation
└── LICENSE                   # MIT License
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v22 or later)
- npm
- MongoDB Atlas account
- Cloudinary account
- Git
- Docker Desktop (Optional)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Krishna2621/leave-attendance-management-system.git
```

```bash
cd leave-attendance-management-system
```

---

### 2️⃣ Install Dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd frontend
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file inside the **backend** directory.

You can use the provided `.env.example` as a template.

```bash
cp .env.example .env
```

Fill in the required values before starting the application.

---

### 4️⃣ Start the Backend

```bash
cd backend
npm run dev
```

---

### 5️⃣ Start the Frontend

```bash
cd frontend
npm run dev
```

---

### 6️⃣ Open the Application

Frontend

```
http://localhost:5173
```

Backend API

```
http://localhost:5000
```

Swagger Documentation

```
http://localhost:5000/api/docs
```

## 🔑 Environment Variables

Create a `.env` file inside the **backend** directory.

| Variable | Description |
|----------|-------------|
| PORT | Backend server port |
| NODE_ENV | Application environment |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | JWT signing secret |
| JWT_REFRESH_SECRET | JWT refresh signing secret |
| FRONTEND_URL | Frontend application URL |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| SMTP_HOST | SMTP server host |
| SMTP_PORT | SMTP server port |
| SMTP_USER | SMTP username |
| SMTP_PASS | SMTP password |


## 📖 API Documentation

LeaveFlow exposes a RESTful API for authentication, attendance management, leave management, employee management, reporting, and administration.

Interactive API documentation is available through Swagger UI.

### Swagger Documentation

**Local**

```text
http://localhost:5000/api/docs
```

**Production**

```text
https://leave-attendance-management-system.onrender.com/api/docs
```

### API Modules

| Module | Description |
|----------|-------------|
| Authentication | User registration, login, logout, refresh token |
| Users | User profile & employee management |
| Attendance | Attendance marking, calendar, history |
| Leave | Leave application & approval workflow |
| Departments | Department management |
| Dashboard | Dashboard analytics |
| Reports | Attendance & leave reports |
| Notifications | Notification management |
| Automation | Scheduled background jobs |

## 🧪 Testing

### Run Unit Tests

```bash
cd backend
npm test
```

### Run ESLint

Backend

```bash
cd backend
npm run lint
```

Frontend

```bash
cd frontend
npm run lint
```

### Check Code Formatting

```bash
npm run format:check
```

### Format the Project

```bash
npm run format
```

## 🚀 Deployment

The application is deployed using modern cloud platforms.

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Image Storage | Cloudinary |
| CI/CD | GitHub Actions |

### Live Application

Frontend

https://leave-attendance-management-system.vercel.app

Backend

https://leave-attendance-management-system.onrender.com

## 📸 Application Preview

### 🔐 Login

<img width="2880" height="1540" alt="image" src="https://github.com/user-attachments/assets/17600ec7-ab02-4ccb-bdd3-28675aee30b4" />

### 📊 Dashboard

<img width="2880" height="1526" alt="image" src="https://github.com/user-attachments/assets/8052c411-583d-4eaa-9f1d-0cba7e6d353d" />

### 📅 Attendance Management

<img width="2880" height="1532" alt="image" src="https://github.com/user-attachments/assets/6709f080-1e38-4218-8533-d514b64f79f6" />

### 🌴 Leave Management

<img width="2880" height="1524" alt="image" src="https://github.com/user-attachments/assets/033e9802-de4c-4aa5-aca0-14a8d847a659" />

### 📈 Reports Dashboard

<img width="2880" height="1532" alt="image" src="https://github.com/user-attachments/assets/ad02def1-fc28-4848-a28b-2274e5dc9ce2" />


## 🚀 Future Roadmap

- [x] JWT Authentication
- [x] Role-Based Access Control (RBAC)
- [x] Attendance Management
- [x] Leave Management
- [x] Department Management
- [x] Employee Management
- [x] Reporting Dashboard
- [x] Docker Support
- [x] GitHub Actions CI/CD
- [x] Cloud Deployment

### Planned Improvements

- [ ] AI-powered Leave Assistant
- [ ] AI Attendance Analytics
- [ ] Mobile Responsive UI Enhancements
- [ ] Dark Mode
- [ ] Push Notifications
- [ ] Two-Factor Authentication (2FA)
- [ ] Audit Dashboard
- [ ] Advanced Analytics
- [ ] Multi-Organization Support

## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

## 📜 License

This project is licensed under the MIT License.

See the LICENSE file for more details.

## 🙏 Acknowledgements

Special thanks to:

- React
- Express.js
- MongoDB Atlas
- Vercel
- Render
- Cloudinary
- GitHub Actions
- Open Source Community







