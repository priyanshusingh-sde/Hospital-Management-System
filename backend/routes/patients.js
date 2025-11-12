const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

// Get all patients
router.get('/', async (req, res) => {
    try {
        const [patients] = await pool.query(`
            SELECT 
                id, patient_id, first_name, last_name, email, phone, 
                date_of_birth, age, gender, blood_group, height, weight, 
                address, emergency_contact_name, emergency_contact_phone,
                created_at, updated_at
            FROM patients 
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: patients
        });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patients'
        });
    }
});

// Get single patient
router.get('/:id', async (req, res) => {
    try {
        const [patients] = await pool.query(`
            SELECT 
                id, patient_id, first_name, last_name, email, phone, 
                date_of_birth, age, gender, blood_group, height, weight, 
                address, emergency_contact_name, emergency_contact_phone,
                created_at, updated_at
            FROM patients 
            WHERE id = ?
        `, [req.params.id]);

        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        res.json({
            success: true,
            data: patients[0]
        });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient'
        });
    }
});

// backend/routes/patients.js
// REPLACE the entire "Create new patient" route with this:

// Create new patient - FIXED VERSION
router.post('/', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            bloodGroup,
            height,
            weight,
            address,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }

        // Check if email already exists
        const [existing] = await pool.query(
            'SELECT id FROM patients WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Calculate age
        const birthDate = new Date(dateOfBirth);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

        // Generate patient ID
        const year = new Date().getFullYear();
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as count FROM patients WHERE patient_id LIKE ?',
            [`P-${year}-%`]
        );
        const patientNumber = String(countResult[0].count + 1).padStart(4, '0');
        const patientId = `P-${year}-${patientNumber}`;

        // Default password
        const defaultPassword = 'patient123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Insert patient - ONLY set values that are actually provided
        // Use NULL for optional fields instead of 'N/A'
        const [result] = await pool.query(
            `INSERT INTO patients (
                patient_id, first_name, last_name, email, phone, date_of_birth, age, 
                gender, blood_group, height, weight, address, emergency_contact_name, 
                emergency_contact_phone, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patientId, 
                firstName, 
                lastName, 
                email, 
                phone, 
                dateOfBirth, 
                age,
                gender, 
                bloodGroup || null,  // NULL if not provided
                height || null,       // NULL if not provided
                weight || null,       // NULL if not provided
                address || null,      // NULL if not provided
                emergencyContactName || null,  // NULL if not provided
                emergencyContactPhone || null, // NULL if not provided
                hashedPassword
            ]
        );

        // Fetch created patient (without password)
        const [newPatient] = await pool.query(
            `SELECT 
                id, patient_id, first_name, last_name, email, phone, 
                date_of_birth, age, gender, blood_group, height, weight, 
                address, emergency_contact_name, emergency_contact_phone,
                created_at
            FROM patients WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Patient added successfully',
            data: newPatient[0]
        });

    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating patient'
        });
    }
});

// Update patient
router.put('/:id', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            bloodGroup,
            height,
            weight,
            address,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

        // Check if patient exists
        const [existing] = await pool.query(
            'SELECT id FROM patients WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Calculate age if date of birth is provided
        let age = null;
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        }

        // Update patient
        await pool.query(
            `UPDATE patients SET 
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                date_of_birth = COALESCE(?, date_of_birth),
                age = COALESCE(?, age),
                gender = COALESCE(?, gender),
                blood_group = COALESCE(?, blood_group),
                height = COALESCE(?, height),
                weight = COALESCE(?, weight),
                address = COALESCE(?, address),
                emergency_contact_name = COALESCE(?, emergency_contact_name),
                emergency_contact_phone = COALESCE(?, emergency_contact_phone),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
                firstName, lastName, email, phone, dateOfBirth, age,
                gender, bloodGroup, height, weight, address,
                emergencyContactName, emergencyContactPhone, req.params.id
            ]
        );

        // Fetch updated patient
        const [updated] = await pool.query(
            'SELECT id, patient_id, first_name, last_name, email, phone, age, gender, blood_group FROM patients WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Patient updated successfully',
            data: updated[0]
        });

    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating patient'
        });
    }
});

// Delete patient
router.delete('/:id', async (req, res) => {
    try {
        // Check if patient exists
        const [existing] = await pool.query(
            'SELECT id FROM patients WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Delete patient (cascades to appointments)
        await pool.query('DELETE FROM patients WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Patient deleted successfully'
        });

    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting patient'
        });
    }
});

module.exports = router;