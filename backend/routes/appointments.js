const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all appointments
router.get('/', async (req, res) => {
    try {
        const { status, patientId } = req.query;
        
        let query = `
            SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                p.patient_id,
                p.phone as patient_phone,
                CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
                d.specialization,
                dept.name as department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN departments dept ON a.department_id = dept.id
        `;
        
        const conditions = [];
        const params = [];
        
        if (status) {
            conditions.push('a.status = ?');
            params.push(status);
        }
        
        if (patientId) {
            conditions.push('a.patient_id = ?');
            params.push(patientId);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
        
        const [appointments] = await pool.query(query, params);

        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments'
        });
    }
});

// Get single appointment
router.get('/:id', async (req, res) => {
    try {
        const [appointments] = await pool.query(`
            SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                p.patient_id,
                p.phone as patient_phone,
                p.email as patient_email,
                CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
                d.specialization,
                d.phone as doctor_phone,
                dept.name as department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN departments dept ON a.department_id = dept.id
            WHERE a.id = ?
        `, [req.params.id]);

        if (appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: appointments[0]
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment'
        });
    }
});

// Create new appointment
router.post('/', async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            departmentId,
            appointmentDate,
            appointmentTime,
            reason
        } = req.body;

        // Validate required fields
        if (!patientId || !doctorId || !departmentId || !appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if patient exists
        const [patients] = await pool.query('SELECT id FROM patients WHERE id = ?', [patientId]);
        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Check if doctor exists
        const [doctors] = await pool.query('SELECT id FROM doctors WHERE id = ?', [doctorId]);
        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Check if appointment slot is available
        const [existingAppointments] = await pool.query(`
            SELECT id FROM appointments 
            WHERE doctor_id = ? 
            AND appointment_date = ? 
            AND appointment_time = ?
            AND status != 'cancelled'
        `, [doctorId, appointmentDate, appointmentTime]);

        if (existingAppointments.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        // Insert appointment
        const [result] = await pool.query(`
            INSERT INTO appointments (
                patient_id, doctor_id, department_id, 
                appointment_date, appointment_time, reason, status
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `, [patientId, doctorId, departmentId, appointmentDate, appointmentTime, reason]);

        // Fetch created appointment
        const [newAppointment] = await pool.query(`
            SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                p.patient_id,
                CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
                dept.name as department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN departments dept ON a.department_id = dept.id
            WHERE a.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: newAppointment[0]
        });

    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating appointment'
        });
    }
});

// Update appointment status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        // Check if appointment exists
        const [existing] = await pool.query(
            'SELECT id FROM appointments WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Update appointment status
        await pool.query(
            'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.params.id]
        );

        // Fetch updated appointment
        const [updated] = await pool.query(`
            SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                p.patient_id,
                CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
                dept.name as department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN departments dept ON a.department_id = dept.id
            WHERE a.id = ?
        `, [req.params.id]);

        res.json({
            success: true,
            message: `Appointment ${status} successfully`,
            data: updated[0]
        });

    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment status'
        });
    }
});

// Update appointment details
router.put('/:id', async (req, res) => {
    try {
        const {
            doctorId,
            departmentId,
            appointmentDate,
            appointmentTime,
            reason
        } = req.body;

        // Check if appointment exists
        const [existing] = await pool.query(
            'SELECT id FROM appointments WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Update appointment
        await pool.query(`
            UPDATE appointments SET 
                doctor_id = COALESCE(?, doctor_id),
                department_id = COALESCE(?, department_id),
                appointment_date = COALESCE(?, appointment_date),
                appointment_time = COALESCE(?, appointment_time),
                reason = COALESCE(?, reason),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [doctorId, departmentId, appointmentDate, appointmentTime, reason, req.params.id]);

        // Fetch updated appointment
        const [updated] = await pool.query(`
            SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                p.patient_id,
                CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
                dept.name as department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN departments dept ON a.department_id = dept.id
            WHERE a.id = ?
        `, [req.params.id]);

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: updated[0]
        });

    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment'
        });
    }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
    try {
        // Check if appointment exists
        const [existing] = await pool.query(
            'SELECT id FROM appointments WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Delete appointment
        await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });

    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment'
        });
    }
});

// Get appointment statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_appointments,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN appointment_date = CURDATE() THEN 1 ELSE 0 END) as today
            FROM appointments
        `);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Get appointment stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment statistics'
        });
    }
});

module.exports = router;