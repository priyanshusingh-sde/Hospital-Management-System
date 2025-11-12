// backend/routes/auth.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

// Admin Login - SECURE VERSION
router.post('/admin/login', async (req, res) => {
    try {
        const { adminId, password } = req.body;

        if (!adminId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Admin ID and password are required'
            });
        }

        // Get admin from database
        const [admins] = await pool.query(
            'SELECT * FROM admin WHERE admin_id = ?',
            [adminId]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const admin = admins[0];

        // Validate password with bcrypt
        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        return res.json({
            success: true,
            message: 'Login successful',
            data: {
                adminId: admin.admin_id,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Patient Login - FIXED SECURE VERSION
router.post('/patient/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for email:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Get patient from database
        const [patients] = await pool.query(
            'SELECT * FROM patients WHERE email = ?',
            [email]
        );

        if (patients.length === 0) {
            console.log('Patient not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const patient = patients[0];
        console.log('Patient found:', patient.email);

        // CRITICAL FIX: Only use bcrypt.compare - no fallback logic
        let isValidPassword = false;
        
        try {
            isValidPassword = await bcrypt.compare(password, patient.password);
            console.log('Password validation result:', isValidPassword);
        } catch (err) {
            console.error('Password comparison error:', err);
            return res.status(500).json({
                success: false,
                message: 'Authentication error'
            });
        }

        if (!isValidPassword) {
            console.log('Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Return patient data (excluding password)
        const { password: _, ...patientData } = patient;

        console.log('Login successful for:', email);
        res.json({
            success: true,
            message: 'Login successful',
            data: patientData
        });

    } catch (error) {
        console.error('Patient login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Patient Registration - SECURE VERSION
router.post('/patient/register', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            bloodGroup,
            password,
            address,
            height,
            weight,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender || !password) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password strength (minimum 8 characters)
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Check if email already exists
        const [existingPatients] = await pool.query(
            'SELECT id FROM patients WHERE email = ?',
            [email]
        );

        if (existingPatients.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Calculate age
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

        if (age < 0 || age > 150) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date of birth'
            });
        }

        // Generate patient ID
        const year = new Date().getFullYear();
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as count FROM patients WHERE patient_id LIKE ?',
            [`P-${year}-%`]
        );
        const patientNumber = String(countResult[0].count + 1).padStart(4, '0');
        const patientId = `P-${year}-${patientNumber}`;

        // Hash password securely
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert patient
        const [result] = await pool.query(
            `INSERT INTO patients (
                patient_id, first_name, last_name, email, phone, date_of_birth, age, 
                gender, blood_group, height, weight, address, emergency_contact_name, 
                emergency_contact_phone, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patientId, firstName, lastName, email, phone, dateOfBirth, age,
                gender, bloodGroup || null, height || null, weight || null, 
                address || null, emergencyContactName || null,
                emergencyContactPhone || null, hashedPassword
            ]
        );

        console.log('New patient registered:', email);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please login with your credentials.',
            data: {
                patientId: patientId,
                email: email
            }
        });

    } catch (error) {
        console.error('Patient registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Change Password endpoint
router.post('/patient/change-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, current password, and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        // Get patient from database
        const [patients] = await pool.query(
            'SELECT * FROM patients WHERE email = ?',
            [email]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const patient = patients[0];

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, patient.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await pool.query(
            'UPDATE patients SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
            [hashedPassword, email]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change'
        });
    }
});

module.exports = router;