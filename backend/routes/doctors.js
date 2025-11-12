const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const [doctors] = await pool.query(`
            SELECT 
                d.*,
                dept.name as department_name
            FROM doctors d
            LEFT JOIN departments dept ON d.department_id = dept.id
            ORDER BY d.created_at DESC
        `);

        res.json({
            success: true,
            data: doctors
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors'
        });
    }
});

// Get single doctor
router.get('/:id', async (req, res) => {
    try {
        const [doctors] = await pool.query(`
            SELECT 
                d.*,
                dept.name as department_name
            FROM doctors d
            LEFT JOIN departments dept ON d.department_id = dept.id
            WHERE d.id = ?
        `, [req.params.id]);

        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: doctors[0]
        });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctor'
        });
    }
});

// Create new doctor
router.post('/', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            specialization,
            qualification,
            experience,
            department
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !specialization || !qualification || !experience) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }

        // Check if email already exists
        const [existing] = await pool.query(
            'SELECT id FROM doctors WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Insert doctor
        const [result] = await pool.query(
            `INSERT INTO doctors (
                first_name, last_name, email, phone, specialization, 
                qualification, experience, department_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, phone, specialization, qualification, experience, department]
        );

        // Fetch created doctor
        const [newDoctor] = await pool.query(`
            SELECT 
                d.*,
                dept.name as department_name
            FROM doctors d
            LEFT JOIN departments dept ON d.department_id = dept.id
            WHERE d.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Doctor added successfully',
            data: newDoctor[0]
        });

    } catch (error) {
        console.error('Create doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating doctor'
        });
    }
});

// Update doctor
router.put('/:id', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            specialization,
            qualification,
            experience,
            department
        } = req.body;

        // Check if doctor exists
        const [existing] = await pool.query(
            'SELECT id FROM doctors WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Update doctor
        await pool.query(
            `UPDATE doctors SET 
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                specialization = COALESCE(?, specialization),
                qualification = COALESCE(?, qualification),
                experience = COALESCE(?, experience),
                department_id = COALESCE(?, department_id),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [firstName, lastName, email, phone, specialization, qualification, experience, department, req.params.id]
        );

        // Fetch updated doctor
        const [updated] = await pool.query(`
            SELECT 
                d.*,
                dept.name as department_name
            FROM doctors d
            LEFT JOIN departments dept ON d.department_id = dept.id
            WHERE d.id = ?
        `, [req.params.id]);

        res.json({
            success: true,
            message: 'Doctor updated successfully',
            data: updated[0]
        });

    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating doctor'
        });
    }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
    try {
        // Check if doctor exists
        const [existing] = await pool.query(
            'SELECT id FROM doctors WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Check if doctor has appointments
        const [appointments] = await pool.query(
            'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?',
            [req.params.id]
        );

        if (appointments[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete doctor with existing appointments'
            });
        }

        // Delete doctor
        await pool.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Doctor deleted successfully'
        });

    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting doctor'
        });
    }
});

// Get doctors by department
router.get('/department/:departmentId', async (req, res) => {
    try {
        const [doctors] = await pool.query(`
            SELECT 
                d.*,
                dept.name as department_name
            FROM doctors d
            LEFT JOIN departments dept ON d.department_id = dept.id
            WHERE d.department_id = ?
            ORDER BY d.first_name
        `, [req.params.departmentId]);

        res.json({
            success: true,
            data: doctors
        });
    } catch (error) {
        console.error('Get doctors by department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors'
        });
    }
});

module.exports = router;