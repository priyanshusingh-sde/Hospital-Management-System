# 🏥 Hospital Management System

A comprehensive web-based Hospital Management System built with modern web technologies. This system provides separate interfaces for administrators and patients to manage hospital operations efficiently.

![Hospital Management System](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Admin Dashboard
- 📊 **Dashboard Overview**: Real-time statistics and analytics
- 👥 **Patient Management**: Add, edit, view, and delete patient records
- 👨‍⚕️ **Doctor Management**: Manage doctor profiles and specializations
- 📅 **Appointment Management**: Approve, reject, and manage appointments
- 🏢 **Department Management**: Create and manage hospital departments
- 📈 **Reports & Analytics**: Generate reports and view trends

### Patient Portal
- 🔐 **Secure Login/Registration**: Patient authentication system
- 📅 **Book Appointments**: Schedule appointments with doctors
- 💊 **Medicine Tracking**: Track prescribed medicines and schedules
- 🛒 **Online Pharmacy**: Order medicines online
- 📄 **Medical Reports**: View and download medical reports
- 👤 **Profile Management**: Update personal and medical information

### General Features
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI/UX**: Clean and intuitive interface
- 🔒 **Secure Authentication**: Password hashing with bcrypt
- ⚡ **Fast Performance**: Optimized for speed and efficiency
- 🔔 **Real-time Notifications**: Instant updates and alerts

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Structure and semantic markup
- **CSS3** - Styling with modern features (Grid, Flexbox, Animations)
- **JavaScript (ES6+)** - Interactive functionality
- **GSAP** - Advanced animations
- **Locomotive Scroll** - Smooth scrolling effects

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing

## 📁 Project Structure

```
hospital-management-system/
│
├── frontend/                      # Frontend files
│   ├── index.html                # Landing page
│   ├── styles.css                # Landing page styles
│   ├── script.js                 # Landing page scripts
│   │
│   ├── patient_login.html        # Patient login/register
│   ├── patient_login.css
│   ├── patient_login.js
│   │
│   ├── patient_dashboard.html    # Patient dashboard
│   ├── patient_dashboard.css
│   ├── patient_dashboard.js
│   │
│   ├── admin_login.html          # Admin login
│   ├── admin_login.css
│   ├── admin_login.js
│   │
│   ├── admin_dashboard.html      # Admin dashboard
│   ├── admin_dashboard.css
│   ├── admin_dashboard.js
│   │
│   └── images/                   # Image assets
│
├── backend/                      # Backend files
│   ├── server.js                 # Main server file
│   ├── package.json              # Dependencies
│   ├── .env                      # Environment variables
│   │
│   ├── config/                   # Configuration files
│   │   └── database.js           # Database connection
│   │
│   ├── routes/                   # API routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── patients.js          # Patient routes
│   │   ├── doctors.js           # Doctor routes
│   │   ├── appointments.js      # Appointment routes
│   │   └── departments.js       # Department routes
│   │
│   └── database/                 # Database files
│       └── database.sql          # Database schema & sample data
│
└── README.md                     # Project documentation
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** (optional) - [Download](https://git-scm.com/)
- A code editor (VS Code recommended) - [Download](https://code.visualstudio.com/)

## 🚀 Installation

### Step 1: Clone or Download the Project

**Option A: Using Git**
```bash
git clone https://github.com/yourusername/hospital-management-system.git
cd hospital-management-system
```

**Option B: Download ZIP**
1. Download the project as ZIP
2. Extract to your desired location
3. Open the folder in VS Code

### Step 2: Install Backend Dependencies

Open terminal in VS Code (Ctrl + ` or Cmd + `) and run:

```bash
cd backend
npm install
```

This will install all required dependencies:
- express
- mysql2
- cors
- dotenv
- bcrypt
- body-parser

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
# Navigate to backend folder
cd backend

# Create .env file (Windows)
type nul > .env

# Create .env file (Mac/Linux)
touch .env
```

Open `.env` and add the following configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=hospital_management
DB_PORT=3306

# Admin Credentials
ADMIN_ID=admin123
ADMIN_PASSWORD=admin@123

# Demo Patient Credentials
DEMO_PATIENT_EMAIL=shreya.sinde@email.com
DEMO_PATIENT_PASSWORD=patient123
```

**⚠️ Important**: Replace `your_mysql_password_here` with your actual MySQL root password!

## 🗄️ Database Setup

### Step 1: Start MySQL Server

**Windows:**
- Open MySQL Workbench or Command Line
- Start MySQL service

**Mac:**
```bash
mysql.server start
```

**Linux:**
```bash
sudo systemctl start mysql
```

### Step 2: Import Database

**Method 1: Using MySQL Workbench (Recommended)**
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Go to **Server** → **Data Import**
4. Select **Import from Self-Contained File**
5. Browse and select `backend/database/database.sql`
6. Click **Start Import**

**Method 2: Using Command Line**
```bash
# Login to MySQL
mysql -u root -p

# Create and import database
source backend/database/database.sql

# OR use this command directly
mysql -u root -p < backend/database/database.sql
```

### Step 3: Verify Database

Login to MySQL and verify:

```sql
-- Show databases
SHOW DATABASES;

-- Use the database
USE hospital_management;

-- Show tables
SHOW TABLES;

-- Check sample data
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM doctors;
SELECT COUNT(*) FROM departments;
```

You should see:
- 7 departments
- 7 doctors
- 6 patients (including demo patient Shreya Sinde)
- 6 sample appointments

### Step 4: Fix Password Hashes (Important!)

The sample data includes a dummy password hash. Run this script to fix it:

```bash
cd backend
node fix-passwords.js
```

This will properly hash all passwords in the database.

## 🏃 Running the Application

### Start the Backend Server

Open terminal in VS Code and run:

```bash
cd backend
npm start
```

You should see:
```
==================================================
🏥 HOSPITAL MANAGEMENT SYSTEM API
==================================================
✓ Database connected successfully
✓ Server running on port 3000
✓ Environment: development
✓ API URL: http://localhost:3000
✓ Health Check: http://localhost:3000/health
==================================================
```

### Access the Application

Open your web browser and navigate to:

**Main Website:**
```
http://localhost:3000
```

**Admin Portal:**
```
http://localhost:3000/admin_login.html
```

**Patient Portal:**
```
http://localhost:3000/patient_login.html
```

## 🔑 Default Credentials

### Admin Login
```
Admin ID: admin123
Password: admin@123
```

### Demo Patient Login
```
Email: shreya.sinde@email.com
Password: patient123
```

**OR** you can login with any of these sample patients:
```
Email: aarav.sharma@email.com
Email: ananya.gupta@email.com
Email: rohan.mehta@email.com
Email: diya.patel@email.com
Email: aryan.singh@email.com
Password for all: patient123
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/admin/login          - Admin login
POST   /api/auth/patient/login        - Patient login
POST   /api/auth/patient/register     - Patient registration
POST   /api/auth/patient/change-password - Change password
```

### Patients
```
GET    /api/patients                  - Get all patients
GET    /api/patients/:id              - Get single patient
POST   /api/patients                  - Create patient
PUT    /api/patients/:id              - Update patient
DELETE /api/patients/:id              - Delete patient
```

### Doctors
```
GET    /api/doctors                   - Get all doctors
GET    /api/doctors/:id               - Get single doctor
GET    /api/doctors/department/:id    - Get doctors by department
POST   /api/doctors                   - Create doctor
PUT    /api/doctors/:id               - Update doctor
DELETE /api/doctors/:id               - Delete doctor
```

### Appointments
```
GET    /api/appointments              - Get all appointments
GET    /api/appointments/:id          - Get single appointment
GET    /api/appointments/stats/summary - Get statistics
POST   /api/appointments              - Create appointment
PUT    /api/appointments/:id          - Update appointment
PUT    /api/appointments/:id/status   - Update status
DELETE /api/appointments/:id          - Delete appointment

Query Parameters:
?status=pending|approved|completed|cancelled
?patientId=1
```

### Departments
```
GET    /api/departments               - Get all departments
GET    /api/departments/:id           - Get single department
POST   /api/departments               - Create department
PUT    /api/departments/:id           - Update department
DELETE /api/departments/:id           - Delete department
```

### Health Check
```
GET    /health                        - Server health check
```

## 🧪 Testing the Application

### 1. Test Backend API

Check if server is running:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Hospital Management System API is running",
  "timestamp": "2024-11-13T10:30:00.000Z"
}
```

### 2. Test Database Connection

Check patients endpoint:
```bash
curl http://localhost:3000/api/patients
```

### 3. Test Admin Login

1. Go to `http://localhost:3000/admin_login.html`
2. Enter credentials: `admin123` / `admin@123`
3. Should redirect to admin dashboard

### 4. Test Patient Login

1. Go to `http://localhost:3000/patient_login.html`
2. Enter credentials: `shreya.sinde@email.com` / `patient123`
3. Should redirect to patient dashboard

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
1. Check if MySQL is running
2. Verify `.env` database credentials
3. Ensure database `hospital_management` exists
4. Check MySQL user permissions

### Password Login Issues
Run the password fix script:
```bash
cd backend
node fix-passwords.js
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Not Loading
1. Ensure server is running on port 3000
2. Check browser console for errors
3. Clear browser cache (Ctrl+Shift+R)

## 📸 Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Patient Dashboard
![Patient Dashboard](screenshots/patient-dashboard.png)

### Appointment Booking
![Appointment Booking](screenshots/appointment-booking.png)

## 🔐 Security Considerations

For **Production Deployment**, ensure you:

1. **Change Default Credentials**
   - Update admin password
   - Remove demo patient accounts

2. **Secure Environment Variables**
   - Never commit `.env` file to version control
   - Use strong database passwords
   - Change JWT secret keys

3. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Redirect HTTP to HTTPS

4. **Database Security**
   - Use prepared statements (already implemented)
   - Regular backups
   - Limit database user permissions

5. **Rate Limiting**
   - Add rate limiting middleware
   - Prevent brute force attacks

6. **Input Validation**
   - Sanitize all user inputs
   - Validate file uploads

## 🚀 Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku app
```bash
heroku create your-app-name
```

3. Add MySQL addon
```bash
heroku addons:create jawsdb
```

4. Deploy
```bash
git push heroku main
```

### Deploy to DigitalOcean

1. Create a Droplet (Ubuntu recommended)
2. Install Node.js and MySQL
3. Clone your repository
4. Set up Nginx as reverse proxy
5. Use PM2 to manage Node.js process

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Inspired by modern healthcare management systems
- Icons from [RemixIcon](https://remixicon.com/)
- Animations powered by [GSAP](https://greensock.com/gsap/)
- Smooth scrolling by [Locomotive Scroll](https://locomotivemtl.github.io/locomotive-scroll/)

## 📧 Support

For support, email support@yourdomain.com or create an issue in the GitHub repository.

## 🔄 Version History

- **1.0.0** (2024-11-13)
  - Initial release
  - Admin and Patient portals
  - Complete CRUD operations
  - Responsive design

---

Made with ❤️ by [Priyanshu Singh]