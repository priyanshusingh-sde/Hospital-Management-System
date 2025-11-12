// frontend/admin_dashboard.js - FIXED VERSION WITH REAL-TIME UPDATES

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Check authentication
function checkAuth() {
    const adminSession = sessionStorage.getItem('adminSession');
    if (!adminSession) {
        window.location.href = 'admin_login.html';
        return false;
    }
    return true;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;

    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });

    // Tab handling
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadAppointments(tab);
        });
    });

    // Form submissions
    document.getElementById('addPatientForm').addEventListener('submit', handleAddPatient);
    document.getElementById('addDoctorForm').addEventListener('submit', handleAddDoctor);
    document.getElementById('addDepartmentForm').addEventListener('submit', handleAddDepartment);

    // Load initial data
    loadDashboardData();
    loadPatients();
    loadDoctors();
    loadAppointments('pending'); // Load pending by default
    loadDepartments();
    
    // Auto-refresh appointments every 30 seconds
    setInterval(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && document.getElementById('appointments').classList.contains('active')) {
            loadAppointments(activeTab.getAttribute('data-tab'));
        }
        // Refresh dashboard stats
        if (document.getElementById('overview').classList.contains('active')) {
            loadDashboardData();
        }
    }, 30000);
});

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Switch sections
function switchSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    // Load data when switching to appointments
    if (sectionId === 'appointments') {
        loadAppointments('pending');
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminSession');
        window.location.href = 'admin_login.html';
    }
}

// =======================
// DASHBOARD DATA
// =======================

async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Load statistics
        const [patientsRes, doctorsRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/patients`),
            fetch(`${API_URL}/doctors`),
            fetch(`${API_URL}/appointments/stats/summary`)
        ]);

        const patients = await patientsRes.json();
        const doctors = await doctorsRes.json();
        const stats = await statsRes.json();

        console.log('Dashboard stats:', stats);

        // Update statistics
        document.getElementById('totalPatients').textContent = patients.data?.length || 0;
        document.getElementById('totalDoctors').textContent = doctors.data?.length || 0;
        document.getElementById('totalAppointments').textContent = stats.data?.today || 0;
        document.getElementById('pendingAppointments').textContent = stats.data?.pending || 0;

        // Load recent patients
        loadRecentPatients(patients.data?.slice(0, 5) || []);
        
        // Load pending appointments list
        await loadPendingAppointmentsList();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

function loadRecentPatients(patients) {
    const container = document.getElementById('recentPatients');
    
    if (patients.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No patients yet</p>';
        return;
    }

    container.innerHTML = patients.map(patient => `
        <div class="list-item">
            <div class="list-item-icon">
                ${patient.first_name[0]}${patient.last_name[0]}
            </div>
            <div class="list-item-content">
                <h4>${patient.first_name} ${patient.last_name}</h4>
                <p>${patient.patient_id} • ${patient.blood_group || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

async function loadPendingAppointmentsList() {
    try {
        const response = await fetch(`${API_URL}/appointments?status=pending`);
        const result = await response.json();
        
        const container = document.getElementById('pendingAppointmentsList');
        const appointments = result.data?.slice(0, 5) || [];
        
        if (appointments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096;">No pending appointments</p>';
            return;
        }

        container.innerHTML = appointments.map(appt => `
            <div class="list-item" onclick="switchSection('appointments')" style="cursor: pointer;">
                <div class="list-item-icon">${new Date(appt.appointment_date).getDate()}</div>
                <div class="list-item-content">
                    <h4>${appt.patient_name}</h4>
                    <p>${appt.doctor_name} • ${formatTime(appt.appointment_time)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading pending appointments:', error);
    }
}

// =======================
// PATIENTS
// =======================

async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/patients`);
        const result = await response.json();

        if (result.success) {
            displayPatients(result.data);
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        showNotification('Error loading patients', 'error');
    }
}

function displayPatients(patients) {
    const tbody = document.getElementById('patientsTableBody');
    
    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No patients found</td></tr>';
        return;
    }

    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.patient_id}</td>
            <td>${patient.first_name} ${patient.last_name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.blood_group || 'N/A'}</td>
            <td>${patient.phone}</td>
            <td>${patient.email}</td>
            <td class="table-actions">
                <button class="btn-success" onclick="viewPatient(${patient.id})">View</button>
                <button class="btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function handleAddPatient(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const patientData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        height: formData.get('height'),
        weight: formData.get('weight'),
        address: formData.get('address'),
        emergencyContactName: formData.get('emergencyContactName'),
        emergencyContactPhone: formData.get('emergencyContactPhone')
    };

    try {
        const response = await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Patient added successfully!', 'success');
            closeAddPatientModal();
            loadPatients();
            loadDashboardData();
            e.target.reset();
        } else {
            showNotification(result.message || 'Error adding patient', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding patient', 'error');
    }
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
        const response = await fetch(`${API_URL}/patients/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Patient deleted successfully!', 'success');
            loadPatients();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting patient', 'error');
    }
}

function viewPatient(id) {
    showNotification('View patient feature coming soon!', 'info');
}

// =======================
// DOCTORS
// =======================

async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        const result = await response.json();

        if (result.success) {
            displayDoctors(result.data);
            populateDoctorDepartments();
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
        showNotification('Error loading doctors', 'error');
    }
}

function displayDoctors(doctors) {
    const container = document.getElementById('doctorsGrid');
    
    if (doctors.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096; grid-column: 1/-1;">No doctors found</p>';
        return;
    }

    container.innerHTML = doctors.map(doctor => `
        <div class="doctor-card">
            <div class="doctor-avatar">
                ${doctor.first_name[0]}${doctor.last_name[0]}
            </div>
            <h3>Dr. ${doctor.first_name} ${doctor.last_name}</h3>
            <p><strong>${doctor.specialization}</strong></p>
            <p>${doctor.department_name || 'N/A'}</p>
            <p>${doctor.experience} years experience</p>
            <p>${doctor.email}</p>
            <p>${doctor.phone}</p>
            <div class="doctor-card-actions">
                <button class="btn-danger" onclick="deleteDoctor(${doctor.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleAddDoctor(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const doctorData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        specialization: formData.get('specialization'),
        qualification: formData.get('qualification'),
        experience: formData.get('experience'),
        department: formData.get('department')
    };

    try {
        const response = await fetch(`${API_URL}/doctors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Doctor added successfully!', 'success');
            closeAddDoctorModal();
            loadDoctors();
            loadDashboardData();
            e.target.reset();
        } else {
            showNotification(result.message || 'Error adding doctor', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding doctor', 'error');
    }
}

async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
        const response = await fetch(`${API_URL}/doctors/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Doctor deleted successfully!', 'success');
            loadDoctors();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting doctor', 'error');
    }
}

// =======================
// APPOINTMENTS - FIXED
// =======================

async function loadAppointments(status) {
    try {
        console.log('Loading appointments with status:', status);
        
        const response = await fetch(`${API_URL}/appointments?status=${status}`);
        const result = await response.json();

        console.log('Appointments loaded:', result);

        if (result.success) {
            displayAppointments(result.data, status);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Error loading appointments', 'error');
    }
}

function displayAppointments(appointments, status) {
    const container = document.getElementById('appointmentsContainer');
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <p style="color: #718096; font-size: 16px;">No ${status} appointments</p>
            </div>
        `;
        return;
    }

    container.innerHTML = appointments.map(appt => `
        <div class="appointment-card">
            <div class="appointment-card-icon">
                ${new Date(appt.appointment_date).getDate()}<br>
                <span style="font-size: 12px;">${new Date(appt.appointment_date).toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div class="appointment-card-content">
                <h3>${appt.patient_name} (${appt.patient_id})</h3>
                <p><strong>Doctor:</strong> Dr. ${appt.doctor_name}</p>
                <p><strong>Department:</strong> ${appt.department_name}</p>
                <p><strong>Date & Time:</strong> ${formatDate(appt.appointment_date)} at ${formatTime(appt.appointment_time)}</p>
                <p><strong>Reason:</strong> ${appt.reason}</p>
                <p><strong>Status:</strong> <span style="color: ${getStatusColor(appt.status)}; text-transform: capitalize; font-weight: 600;">${appt.status}</span></p>
            </div>
            <div class="appointment-card-actions">
                ${status === 'pending' ? `
                    <button class="btn-success" onclick="updateAppointmentStatus(${appt.id}, 'approved')">✓ Approve</button>
                    <button class="btn-danger" onclick="updateAppointmentStatus(${appt.id}, 'cancelled')">✗ Reject</button>
                ` : status === 'approved' ? `
                    <button class="btn-success" onclick="updateAppointmentStatus(${appt.id}, 'completed')">✓ Complete</button>
                    <button class="btn-danger" onclick="updateAppointmentStatus(${appt.id}, 'cancelled')">✗ Cancel</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'pending': '#f59e0b',
        'approved': '#10b981',
        'completed': '#3b82f6',
        'cancelled': '#ef4444'
    };
    return colors[status] || '#718096';
}

async function updateAppointmentStatus(id, status) {
    const action = status === 'approved' ? 'approve' : 
                  status === 'completed' ? 'complete' : 'cancel';
    
    if (!confirm(`Are you sure you want to ${action} this appointment?`)) return;

    try {
        console.log(`Updating appointment ${id} to status ${status}`);
        
        const response = await fetch(`${API_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        const result = await response.json();
        console.log('Update response:', result);

        if (result.success) {
            showNotification(`Appointment ${status} successfully!`, 'success');
            
            // Reload appropriate tab
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                loadAppointments(activeTab.getAttribute('data-tab'));
            }
            loadDashboardData(); // Refresh dashboard stats
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Error updating appointment', 'error');
    }
}

// =======================
// DEPARTMENTS
// =======================

async function loadDepartments() {
    try {
        const response = await fetch(`${API_URL}/departments`);
        const result = await response.json();

        if (result.success) {
            displayDepartments(result.data);
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        showNotification('Error loading departments', 'error');
    }
}

function displayDepartments(departments) {
    const container = document.getElementById('departmentsGrid');
    
    if (departments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096; grid-column: 1/-1;">No departments found</p>';
        return;
    }

    container.innerHTML = departments.map(dept => `
        <div class="department-card">
            <div class="department-icon">${dept.name[0]}</div>
            <h3>${dept.name}</h3>
            <p>${dept.description || 'No description available'}</p>
            <div class="doctor-card-actions" style="margin-top: 16px;">
                <button class="btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleAddDepartment(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const deptData = {
        name: formData.get('name'),
        description: formData.get('description')
    };

    try {
        const response = await fetch(`${API_URL}/departments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deptData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Department added successfully!', 'success');
            closeAddDepartmentModal();
            loadDepartments();
            populateDoctorDepartments();
            e.target.reset();
        } else {
            showNotification(result.message || 'Error adding department', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding department', 'error');
    }
}

async function deleteDepartment(id) {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
        const response = await fetch(`${API_URL}/departments/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Department deleted successfully!', 'success');
            loadDepartments();
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting department', 'error');
    }
}

async function populateDoctorDepartments() {
    try {
        const response = await fetch(`${API_URL}/departments`);
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('doctorDepartment');
            select.innerHTML = '<option value="">Select Department</option>';
            
            result.data.forEach(dept => {
                select.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// =======================
// MODAL FUNCTIONS
// =======================

function openAddPatientModal() {
    document.getElementById('addPatientModal').classList.add('active');
}

function closeAddPatientModal() {
    document.getElementById('addPatientModal').classList.remove('active');
}

function openAddDoctorModal() {
    document.getElementById('addDoctorModal').classList.add('active');
}

function closeAddDoctorModal() {
    document.getElementById('addDoctorModal').classList.remove('active');
}

function openAddDepartmentModal() {
    document.getElementById('addDepartmentModal').classList.add('active');
}

function closeAddDepartmentModal() {
    document.getElementById('addDepartmentModal').classList.remove('active');
}

// Close modals on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// =======================
// UTILITY FUNCTIONS
// =======================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes} ${ampm}`;
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}