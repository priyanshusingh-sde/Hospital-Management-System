const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all departments
router.get('/', async (req, res) => {
    try {
        const [departments] = await pool.query(`
            SELECT 
                d.*,
                COUNT(DISTINCT doc.id) as doctor_count,
                COUNT(DISTINCT a.id) as appointment_count
            FROM departments d
            LEFT JOIN doctors doc ON d.id = doc.department_id
            LEFT JOIN appointments a ON d.id = a.department_id
            GROUP BY d.id
            ORDER BY d.name
        `);

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching departments'
        });
    }
});

// Get single department
router.get('/:id', async (req, res) => {
    try {
        const [departments] = await pool.query(`
            SELECT 
                d.*,
                COUNT(DISTINCT doc.id) as doctor_count,
                COUNT(DISTINCT a.id) as appointment_count
            FROM departments d
            LEFT JOIN doctors doc ON d.id = doc.department_id
            LEFT JOIN appointments a ON d.id = a.department_id
            WHERE d.id = ?
            GROUP BY d.id
        `, [req.params.id]);

        if (departments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.json({
            success: true,
            data: departments[0]
        });
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department'
        });
    }
});

// Create new department
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

        // Check if department already exists
        const [existing] = await pool.query(
            'SELECT id FROM departments WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Department already exists'
            });
        }

        // Insert department
        const [result] = await pool.query(
            'INSERT INTO departments (name, description) VALUES (?, ?)',
            [name, description]
        );

        // Fetch created department
        const [newDepartment] = await pool.query(
            'SELECT * FROM departments WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Department added successfully',
            data: newDepartment[0]
        });

    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating department'
        });
    }
});

// Update department
router.put('/:id', async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if department exists
        const [existing] = await pool.query(
            'SELECT id FROM departments WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Update department
        await pool.query(
            `UPDATE departments SET 
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [name, description, req.params.id]
        );

        // Fetch updated department
        const [updated] = await pool.query(
            'SELECT * FROM departments WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Department updated successfully',
            data: updated[0]
        });

    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating department'
        });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    try {
        // Check if department exists
        const [existing] = await pool.query(
            'SELECT id FROM departments WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if department has doctors
        const [doctors] = await pool.query(
            'SELECT COUNT(*) as count FROM doctors WHERE department_id = ?',
            [req.params.id]
        );

        if (doctors[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete department with assigned doctors'
            });
        }

        // Delete department
        await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });

    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department'
        });
    }
});

module.exports = router;