const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const departmentRoutes = require('./routes/departments');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://curenation.netlify.app';
app.use(cors({ origin: FRONTEND_ORIGIN }));

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Hospital Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend static files. Use the project `frontend` folder as the static root.
// If a `frontend/landing/index.html` exists prefer that for the root route, otherwise use `frontend/index.html`.
const fs = require('fs');
const frontendRoot = path.join(__dirname, '..', 'frontend');
const landingIndex = path.join(frontendRoot, 'landing', 'index.html');

if (!fs.existsSync(frontendRoot)) {
    console.warn(`Frontend directory not found at ${frontendRoot}. Static files won't be served.`);
}

// Serve the entire frontend folder so pages like admin_login.html and patient_login.html are available.
app.use(express.static(frontendRoot));

// Root route: prefer landing/index.html if present, otherwise serve frontend/index.html
app.get('/', (req, res) => {
    if (fs.existsSync(landingIndex)) {
        return res.sendFile(landingIndex);
    }
    return res.sendFile(path.join(frontendRoot, 'index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/departments', departmentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            // Don't exit here - allow the server to run for frontend/dev work even if DB isn't available.
            console.warn('Failed to connect to database. Continuing without DB connection for development. Some API features may not work.');
        }

        // Start listening
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🏥 HOSPITAL MANAGEMENT SYSTEM API');
            console.log('='.repeat(50));
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✓ API URL: http://localhost:${PORT}`);
            console.log(`✓ Health Check: http://localhost:${PORT}/health`);
            console.log('='.repeat(50) + '\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;