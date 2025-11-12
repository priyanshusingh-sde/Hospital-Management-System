// frontend/patient_dashboard.js - FIXED VERSION WITH DYNAMIC USER DATA

// API Configuration
const API_URL = 'http://localhost:3000/api';

// Global variables
let currentPatient = null;
let cart = [];

// Check authentication and load patient data
async function checkAuth() {
    const patientSession = sessionStorage.getItem('patientSession');
    if (!patientSession) {
        window.location.href = 'patient_login.html';
        return false;
    }
    
    try {
        currentPatient = JSON.parse(patientSession);
        console.log('Current patient:', currentPatient);
        
        // Load patient's full data from backend
        await loadPatientData();
        return true;
    } catch (error) {
        console.error('Error loading patient data:', error);
        sessionStorage.removeItem('patientSession');
        window.location.href = 'patient_login.html';
        return false;
    }
}

// Load patient data from backend
async function loadPatientData() {
    try {
        const response = await fetch(`${API_URL}/patients/${currentPatient.id}`);
        const result = await response.json();
        
        if (result.success) {
            currentPatient = { ...currentPatient, ...result.data };
            sessionStorage.setItem('patientSession', JSON.stringify(currentPatient));
            updateUserInterface();
        }
    } catch (error) {
        console.error('Error loading patient data:', error);
    }
}

// Update user interface with patient data
function updateUserInterface() {
    // Update user name in top bar
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = `${currentPatient.first_name} ${currentPatient.last_name}`;
    });
    
    // Update welcome message
    const welcomeHeader = document.querySelector('#overview .section-header h1');
    if (welcomeHeader) {
        welcomeHeader.textContent = `Welcome back, ${currentPatient.first_name}! 👋`;
    }
    
    // Update profile section
    updateProfileSection();
    
    // Update avatar initials
    updateAvatarInitials();
}

// Update avatar with patient initials
function updateAvatarInitials() {
    const initials = `${currentPatient.first_name[0]}${currentPatient.last_name[0]}`;
    
    // Update all avatar images
    document.querySelectorAll('.user-profile img, .profile-avatar img').forEach(img => {
        img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23667eea'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='white' font-size='40' font-family='Arial'%3E${initials}%3C/text%3E%3C/svg%3E`;
    });
    
    // Update avatar text
    document.querySelectorAll('.list-item-icon, .appointment-icon').forEach(el => {
        if (el.textContent.length === 2) {
            el.textContent = initials;
        }
    });
}

// Update profile section with patient data
function updateProfileSection() {
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        profileCard.querySelector('h2').textContent = `${currentPatient.first_name} ${currentPatient.last_name}`;
        profileCard.querySelector('p').textContent = `Patient ID: ${currentPatient.patient_id}`;
    }
    
    // Update profile details
    const detailItems = {
        'Full Name': `${currentPatient.first_name} ${currentPatient.last_name}`,
        'Date of Birth': formatDate(currentPatient.date_of_birth),
        'Age': `${currentPatient.age} Years`,
        'Blood Group': currentPatient.blood_group || 'N/A',
        'Email': currentPatient.email,
        'Phone': currentPatient.phone,
        'Height': currentPatient.height ? `${currentPatient.height} cm` : 'N/A',
        'Weight': currentPatient.weight ? `${currentPatient.weight} kg` : 'N/A'
    };
    
    document.querySelectorAll('.detail-item').forEach(item => {
        const label = item.querySelector('label').textContent;
        const valueEl = item.querySelector('p');
        if (detailItems[label]) {
            valueEl.textContent = detailItems[label];
        }
    });
    
    // Update emergency contact
    const emergencyItems = document.querySelectorAll('.detail-grid')[1]?.querySelectorAll('.detail-item');
    if (emergencyItems) {
        emergencyItems[0].querySelector('p').textContent = currentPatient.emergency_contact_name || 'N/A';
        emergencyItems[2].querySelector('p').textContent = currentPatient.emergency_contact_phone || 'N/A';
    }
}

// Load patient's appointments from backend
async function loadPatientAppointments(status = 'upcoming') {
    try {
        const response = await fetch(`${API_URL}/appointments?patientId=${currentPatient.id}`);
        const result = await response.json();
        
        if (result.success) {
            const appointments = result.data;
            
            // Filter by status and date
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const filtered = appointments.filter(appt => {
                const apptDate = new Date(appt.appointment_date);
                
                if (status === 'upcoming') {
                    return appt.status !== 'cancelled' && appt.status !== 'completed' && apptDate >= today;
                } else if (status === 'past') {
                    return appt.status === 'completed' || apptDate < today;
                } else if (status === 'cancelled') {
                    return appt.status === 'cancelled';
                }
                return true;
            });
            
            displayAppointments(filtered, status);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Error loading appointments', 'error');
    }
}

// Display appointments
function displayAppointments(appointments, status) {
    const container = document.getElementById('appointmentsContainer');
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 20px; opacity: 0.3;">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p style="color: #718096; font-size: 16px;">No ${status} appointments</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(appt => `
        <div class="appointment-card">
            <div class="appointment-card-icon">
                ${new Date(appt.appointment_date).getDate()}<br>
                <span style="font-size: 12px; font-weight: 500;">${new Date(appt.appointment_date).toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div class="appointment-card-content">
                <h3>Dr. ${appt.doctor_name}</h3>
                <p><strong>${appt.department_name}</strong></p>
                <p>📅 ${formatDate(appt.appointment_date)} at ${formatTime(appt.appointment_time)}</p>
                <p><strong>Status:</strong> <span style="color: ${getStatusColor(appt.status)}; text-transform: capitalize;">${appt.status}</span></p>
                <p><strong>Reason:</strong> ${appt.reason}</p>
            </div>
            ${status === 'upcoming' && appt.status === 'pending' ? `
                <div class="appointment-card-actions">
                    <button class="reschedule-btn" onclick="rescheduleAppointment(${appt.id})">Reschedule</button>
                    <button class="cancel-btn" onclick="cancelAppointment(${appt.id})">Cancel</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Get status color
function getStatusColor(status) {
    const colors = {
        'pending': '#f59e0b',
        'approved': '#10b981',
        'completed': '#3b82f6',
        'cancelled': '#ef4444'
    };
    return colors[status] || '#718096';
}

// Load departments for booking form
async function loadDepartments() {
    try {
        const response = await fetch(`${API_URL}/departments`);
        const result = await response.json();
        
        if (result.success) {
            const select = document.querySelector('#bookingForm select[name="department"]');
            if (select) {
                select.innerHTML = '<option value="">Choose department...</option>' +
                    result.data.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Load doctors by department
async function loadDoctorsByDepartment(departmentId) {
    try {
        const response = await fetch(`${API_URL}/doctors/department/${departmentId}`);
        const result = await response.json();
        
        if (result.success) {
            const select = document.querySelector('#bookingForm select[name="doctor"]');
            if (select) {
                select.innerHTML = '<option value="">Choose doctor...</option>' +
                    result.data.map(doc => `<option value="${doc.id}">Dr. ${doc.first_name} ${doc.last_name} - ${doc.specialization}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Navigation
document.addEventListener('DOMContentLoaded', async function() {
    const authenticated = await checkAuth();
    if (!authenticated) return;
    
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
    
    // Tab handling in appointments
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadPatientAppointments(tab);
        });
    });
    
    // Department change handler
    const deptSelect = document.querySelector('#bookingForm select[name="department"]');
    if (deptSelect) {
        deptSelect.addEventListener('change', function() {
            if (this.value) {
                loadDoctorsByDepartment(this.value);
            }
        });
    }
    
    // Initialize data
    await loadDepartments();
    await loadPatientAppointments('upcoming');
    loadOverviewData();
    
    // Booking form submission - FIXED
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
});

// ============================================
// FIXED APPOINTMENT BOOKING - patient_dashboard.js
// Replace the entire handleBookingSubmit function with this
// ============================================

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    console.log('=== BOOKING FORM SUBMISSION ===');
    
    const form = e.target;
    
    // Get form elements by their position in the form
    const formElements = form.elements;
    const departmentSelect = form.querySelector('select:nth-of-type(1)');
    const doctorSelect = form.querySelector('select:nth-of-type(2)');
    const dateInput = form.querySelector('input[type="date"]');
    const timeInput = form.querySelector('input[type="time"]');
    const reasonTextarea = form.querySelector('textarea');
    
    console.log('Form elements found:', {
        department: !!departmentSelect,
        doctor: !!doctorSelect,
        date: !!dateInput,
        time: !!timeInput,
        reason: !!reasonTextarea
    });
    
    // Get values
    const departmentId = departmentSelect ? parseInt(departmentSelect.value) : null;
    const doctorId = doctorSelect ? parseInt(doctorSelect.value) : null;
    const appointmentDate = dateInput ? dateInput.value : '';
    const appointmentTime = timeInput ? timeInput.value : '';
    const reason = reasonTextarea ? reasonTextarea.value.trim() : '';
    
    console.log('Form values:', {
        departmentId,
        doctorId,
        appointmentDate,
        appointmentTime,
        reason: reason ? 'Provided' : 'Empty'
    });
    
    // Validate current patient
    if (!currentPatient || !currentPatient.id) {
        showNotification('User session not found. Please login again.', 'error');
        console.error('No current patient:', currentPatient);
        return;
    }
    
    console.log('Current patient ID:', currentPatient.id);
    
    // Validate all required fields
    const validationErrors = [];
    
    if (!departmentId || isNaN(departmentId)) {
        validationErrors.push('Department');
    }
    if (!doctorId || isNaN(doctorId)) {
        validationErrors.push('Doctor');
    }
    if (!appointmentDate) {
        validationErrors.push('Date');
    }
    if (!appointmentTime) {
        validationErrors.push('Time');
    }
    if (!reason) {
        validationErrors.push('Reason for visit');
    }
    
    if (validationErrors.length > 0) {
        const message = `Please fill in: ${validationErrors.join(', ')}`;
        showNotification(message, 'error');
        console.error('Validation failed:', validationErrors);
        return;
    }
    
    // Validate date is in future
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('Please select a future date', 'error');
        console.error('Date in past:', appointmentDate);
        return;
    }
    
    // Prepare appointment data
    const appointmentData = {
        patientId: currentPatient.id,
        doctorId: doctorId,
        departmentId: departmentId,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        reason: reason
    };
    
    console.log('Appointment data to send:', appointmentData);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;
    
    try {
        console.log('Sending request to:', `${API_URL}/appointments`);
        
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to book appointment');
        }
        
        showNotification('Appointment booked successfully! Waiting for admin approval.', 'success');
        closeBookingModal();
        form.reset();
        
        // Reset doctor select
        if (doctorSelect) {
            doctorSelect.disabled = true;
            doctorSelect.innerHTML = '<option value="">First select a department</option>';
        }
        
        // Reload appointments after short delay
        setTimeout(() => {
            loadPatientAppointments('upcoming');
            switchSection('appointments');
        }, 1000);
        
    } catch (error) {
        console.error('Booking error:', error);
        showNotification(error.message || 'Error booking appointment. Please try again.', 'error');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ============================================
// IMPROVED MODAL AND FORM INITIALIZATION
// ============================================

// Initialize booking form - IMPROVED VERSION
function initializeBookingForm() {
    console.log('Initializing booking form...');
    
    const form = document.getElementById('bookingForm');
    if (!form) {
        console.error('Booking form not found!');
        return;
    }
    
    // Remove any existing event listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add submit handler
    newForm.addEventListener('submit', handleBookingSubmit);
    console.log('Booking form submit handler attached');
    
    // Get all selects
    const selects = newForm.querySelectorAll('select');
    console.log('Found selects:', selects.length);
    
    if (selects.length >= 2) {
        const departmentSelect = selects[0];
        const doctorSelect = selects[1];
        
        // Initially disable doctor select
        doctorSelect.disabled = true;
        doctorSelect.innerHTML = '<option value="">First select a department</option>';
        
        // Department change handler
        departmentSelect.addEventListener('change', function() {
            console.log('Department selected:', this.value);
            if (this.value) {
                loadDoctorsByDepartment(this.value);
            } else {
                doctorSelect.disabled = true;
                doctorSelect.innerHTML = '<option value="">First select a department</option>';
            }
        });
        
        console.log('Department change handler attached');
    } else {
        console.error('Not enough select elements found in form');
    }
    
    // Set minimum date to today
    const dateInput = newForm.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        console.log('Date input minimum set to:', today);
    }
}

// Load doctors by department - IMPROVED
async function loadDoctorsByDepartment(departmentId) {
    try {
        console.log('Loading doctors for department:', departmentId);
        
        const response = await fetch(`${API_URL}/doctors/department/${departmentId}`);
        const result = await response.json();
        
        console.log('Doctors loaded:', result);
        
        if (result.success && result.data) {
            // Find the doctor select - it's the second select in the form
            const selects = document.querySelectorAll('#bookingForm select');
            const doctorSelect = selects[1]; // Second select is for doctors
            
            if (doctorSelect) {
                doctorSelect.innerHTML = '<option value="">Choose doctor...</option>';
                
                if (result.data.length === 0) {
                    doctorSelect.innerHTML += '<option value="">No doctors available</option>';
                    doctorSelect.disabled = true;
                } else {
                    result.data.forEach(doc => {
                        doctorSelect.innerHTML += `<option value="${doc.id}">Dr. ${doc.first_name} ${doc.last_name} - ${doc.specialization}</option>`;
                    });
                    doctorSelect.disabled = false;
                }
                
                console.log('Doctor options populated:', result.data.length);
            } else {
                console.error('Doctor select not found');
            }
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
        showNotification('Error loading doctors', 'error');
    }
}

// Modal functions
function openBookingModal() {
    console.log('Opening booking modal...');
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('active');
        
        // Reload departments when opening
        loadDepartments();
        
        // Reinitialize form
        initializeBookingForm();
    } else {
        console.error('Booking modal not found!');
    }
}

function closeBookingModal() {
    console.log('Closing booking modal...');
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        
        // Reset form
        const form = document.getElementById('bookingForm');
        if (form) {
            form.reset();
            
            // Reset doctor select
            const selects = form.querySelectorAll('select');
            if (selects.length >= 2) {
                selects[1].disabled = true;
                selects[1].innerHTML = '<option value="">First select a department</option>';
            }
        }
    }
}

// Close modal on outside click
window.addEventListener('click', function(e) {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        closeBookingModal();
    }
});

// ============================================
// MAKE SURE THIS IS IN DOMContentLoaded
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== PATIENT DASHBOARD INITIALIZING ===');
    
    const authenticated = await checkAuth();
    if (!authenticated) {
        console.log('Authentication failed');
        return;
    }
    
    console.log('Authentication successful');
    
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
    
    // Tab handling in appointments
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadPatientAppointments(tab);
        });
    });
    
    // Initialize data
    console.log('Loading initial data...');
    await loadDepartments();
    await loadPatientAppointments('upcoming');
    loadOverviewData();
    
    // Initialize booking form - IMPORTANT!
    initializeBookingForm();
    
    console.log('=== DASHBOARD INITIALIZATION COMPLETE ===');
});

// Cancel appointment
async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
        const response = await fetch(`${API_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'cancelled' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Appointment cancelled successfully', 'success');
            loadPatientAppointments('upcoming');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Cancel error:', error);
        showNotification('Error cancelling appointment', 'error');
    }
}

// Switch sections
function switchSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Load data for specific sections
    if (sectionId === 'appointments') {
        loadPatientAppointments('upcoming');
    }
}

// Load overview data
function loadOverviewData() {
    // This can be enhanced to load real statistics
    const upcomingContainer = document.getElementById('upcomingAppointments');
    if (upcomingContainer) {
        upcomingContainer.innerHTML = '<p style="color: #718096; text-align: center; padding: 20px;">Loading appointments...</p>';
    }
}

// Modal functions
function openBookingModal() {
    document.getElementById('bookingModal').classList.add('active');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
}

// Close modal on outside click
window.addEventListener('click', function(e) {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        closeBookingModal();
    }
});

function rescheduleAppointment(id) {
    showNotification('Reschedule feature coming soon', 'info');
}

function toggleUserMenu() {
    showNotification('User menu feature coming soon', 'info');
}

function editProfile() {
    showNotification('Edit profile feature coming soon', 'info');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('patientSession');
        localStorage.removeItem('patientRemember');
        window.location.href = 'patient_login.html';
    }
}

// Utility functions
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

// Notification system
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

// FIXED APPOINTMENT BOOKING - Add this to patient_dashboard.js

// Handle booking form submission - FIXED VERSION
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    console.log('=== BOOKING FORM SUBMISSION ===');
    
    const form = e.target;
    
    // Get form values directly from form elements
    const departmentSelect = form.querySelector('select[name="department"]') || form.querySelector('select:nth-of-type(1)');
    const doctorSelect = form.querySelector('select[name="doctor"]') || form.querySelector('select:nth-of-type(2)');
    const dateInput = form.querySelector('input[type="date"]');
    const timeInput = form.querySelector('input[type="time"]');
    const reasonTextarea = form.querySelector('textarea');
    
    console.log('Form elements found:', {
        department: departmentSelect ? 'Yes' : 'No',
        doctor: doctorSelect ? 'Yes' : 'No',
        date: dateInput ? 'Yes' : 'No',
        time: timeInput ? 'Yes' : 'No',
        reason: reasonTextarea ? 'Yes' : 'No'
    });
    
    // Get values
    const departmentId = departmentSelect ? parseInt(departmentSelect.value) : null;
    const doctorId = doctorSelect ? parseInt(doctorSelect.value) : null;
    const appointmentDate = dateInput ? dateInput.value : '';
    const appointmentTime = timeInput ? timeInput.value : '';
    const reason = reasonTextarea ? reasonTextarea.value.trim() : '';
    
    console.log('Form values:', {
        departmentId,
        doctorId,
        appointmentDate,
        appointmentTime,
        reason: reason || '(empty)'
    });
    
    // Validate current patient
    if (!currentPatient || !currentPatient.id) {
        showNotification('User session not found. Please login again.', 'error');
        console.error('No current patient:', currentPatient);
        return;
    }
    
    console.log('Current patient ID:', currentPatient.id);
    
    // Validate all required fields
    const validationErrors = [];
    
    if (!departmentId || isNaN(departmentId)) {
        validationErrors.push('Department');
    }
    if (!doctorId || isNaN(doctorId)) {
        validationErrors.push('Doctor');
    }
    if (!appointmentDate) {
        validationErrors.push('Date');
    }
    if (!appointmentTime) {
        validationErrors.push('Time');
    }
    if (!reason) {
        validationErrors.push('Reason for visit');
    }
    
    if (validationErrors.length > 0) {
        const message = `Please fill in: ${validationErrors.join(', ')}`;
        showNotification(message, 'error');
        console.error('Validation failed:', validationErrors);
        return;
    }
    
    // Validate date is in future
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('Please select a future date', 'error');
        console.error('Date in past:', appointmentDate);
        return;
    }
    
    // Prepare appointment data
    const appointmentData = {
        patientId: currentPatient.id,
        doctorId: doctorId,
        departmentId: departmentId,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        reason: reason
    };
    
    console.log('Appointment data to send:', appointmentData);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;
    
    try {
        console.log('Sending request to:', `${API_URL}/appointments`);
        
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to book appointment');
        }
        
        showNotification('Appointment booked successfully! Waiting for admin approval.', 'success');
        closeBookingModal();
        form.reset();
        
        // Reload appointments after short delay
        setTimeout(() => {
            loadPatientAppointments('upcoming');
            switchSection('appointments');
        }, 1000);
        
    } catch (error) {
        console.error('Booking error:', error);
        showNotification(error.message || 'Error booking appointment. Please try again.', 'error');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Load departments for booking form - IMPROVED
async function loadDepartments() {
    try {
        console.log('Loading departments...');
        const response = await fetch(`${API_URL}/departments`);
        const result = await response.json();
        
        console.log('Departments loaded:', result);
        
        if (result.success && result.data) {
            const select = document.querySelector('#bookingForm select');
            if (select) {
                select.innerHTML = '<option value="">Choose department...</option>';
                result.data.forEach(dept => {
                    select.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
                });
                console.log('Department options populated:', result.data.length);
            } else {
                console.error('Department select not found');
            }
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        showNotification('Error loading departments', 'error');
    }
}

// Load doctors by department - IMPROVED
async function loadDoctorsByDepartment(departmentId) {
    try {
        console.log('Loading doctors for department:', departmentId);
        
        const response = await fetch(`${API_URL}/doctors/department/${departmentId}`);
        const result = await response.json();
        
        console.log('Doctors loaded:', result);
        
        if (result.success && result.data) {
            // Find the doctor select - it's the second select in the form
            const selects = document.querySelectorAll('#bookingForm select');
            const doctorSelect = selects[1]; // Second select is for doctors
            
            if (doctorSelect) {
                doctorSelect.innerHTML = '<option value="">Choose doctor...</option>';
                
                if (result.data.length === 0) {
                    doctorSelect.innerHTML += '<option value="">No doctors available</option>';
                } else {
                    result.data.forEach(doc => {
                        doctorSelect.innerHTML += `<option value="${doc.id}">Dr. ${doc.first_name} ${doc.last_name} - ${doc.specialization}</option>`;
                    });
                }
                
                doctorSelect.disabled = false;
                console.log('Doctor options populated:', result.data.length);
            } else {
                console.error('Doctor select not found');
            }
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
        showNotification('Error loading doctors', 'error');
    }
}

// Initialize booking form - ADD THIS TO DOMContentLoaded
function initializeBookingForm() {
    console.log('Initializing booking form...');
    
    const form = document.getElementById('bookingForm');
    if (!form) {
        console.error('Booking form not found!');
        return;
    }
    
    // Remove any existing event listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add submit handler
    newForm.addEventListener('submit', handleBookingSubmit);
    console.log('Booking form submit handler attached');
    
    // Get all selects
    const selects = newForm.querySelectorAll('select');
    console.log('Found selects:', selects.length);
    
    if (selects.length >= 2) {
        const departmentSelect = selects[0];
        const doctorSelect = selects[1];
        
        // Initially disable doctor select
        doctorSelect.disabled = true;
        doctorSelect.innerHTML = '<option value="">First select a department</option>';
        
        // Department change handler
        departmentSelect.addEventListener('change', function() {
            console.log('Department selected:', this.value);
            if (this.value) {
                loadDoctorsByDepartment(this.value);
            } else {
                doctorSelect.disabled = true;
                doctorSelect.innerHTML = '<option value="">First select a department</option>';
            }
        });
        
        console.log('Department change handler attached');
    } else {
        console.error('Not enough select elements found in form');
    }
    
    // Set minimum date to today
    const dateInput = newForm.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        console.log('Date input minimum set to:', today);
    }
}

// UPDATED DOMContentLoaded - Replace your existing one
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== PATIENT DASHBOARD INITIALIZING ===');
    
    const authenticated = await checkAuth();
    if (!authenticated) {
        console.log('Authentication failed');
        return;
    }
    
    console.log('Authentication successful');
    
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
    
    // Tab handling in appointments
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadPatientAppointments(tab);
        });
    });
    
    // Initialize data
    console.log('Loading initial data...');
    await loadDepartments();
    await loadPatientAppointments('upcoming');
    loadOverviewData();
    
    // Initialize booking form - IMPORTANT!
    initializeBookingForm();
    
    console.log('=== DASHBOARD INITIALIZATION COMPLETE ===');
});

// Modal functions - MAKE SURE THESE ARE PRESENT
function openBookingModal() {
    console.log('Opening booking modal...');
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('active');
        
        // Reload departments when opening
        loadDepartments();
    } else {
        console.error('Booking modal not found!');
    }
}

function closeBookingModal() {
    console.log('Closing booking modal...');
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        
        // Reset form
        const form = document.getElementById('bookingForm');
        if (form) {
            form.reset();
            
            // Reset doctor select
            const selects = form.querySelectorAll('select');
            if (selects.length >= 2) {
                selects[1].disabled = true;
                selects[1].innerHTML = '<option value="">First select a department</option>';
            }
        }
    }
}

// Close modal on outside click
window.addEventListener('click', function(e) {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        closeBookingModal();
    }
});

// ============================================
// PATIENT PROFILE UPDATE FUNCTIONALITY
// ============================================

// Add this function to patient_dashboard.js

// Edit Profile Function - UPDATED
function editProfile() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'editProfileModal';
    
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h2>Update Profile</h2>
                <button class="close-modal" onclick="closeEditProfile()">&times;</button>
            </div>
            <form id="editProfileForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>First Name *</label>
                        <input type="text" name="firstName" value="${currentPatient.first_name}" required>
                    </div>
                    <div class="form-group">
                        <label>Last Name *</label>
                        <input type="text" name="lastName" value="${currentPatient.last_name}" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" value="${currentPatient.email}" required>
                    </div>
                    <div class="form-group">
                        <label>Phone *</label>
                        <input type="tel" name="phone" value="${currentPatient.phone}" required>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth *</label>
                        <input type="date" name="dateOfBirth" value="${currentPatient.date_of_birth}" required>
                    </div>
                    <div class="form-group">
                        <label>Gender *</label>
                        <select name="gender" required>
                            <option value="Male" ${currentPatient.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${currentPatient.gender === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Other" ${currentPatient.gender === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Blood Group</label>
                        <select name="bloodGroup">
                            <option value="">Select Blood Group</option>
                            <option value="A+" ${currentPatient.blood_group === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A-" ${currentPatient.blood_group === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${currentPatient.blood_group === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B-" ${currentPatient.blood_group === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="AB+" ${currentPatient.blood_group === 'AB+' ? 'selected' : ''}>AB+</option>
                            <option value="AB-" ${currentPatient.blood_group === 'AB-' ? 'selected' : ''}>AB-</option>
                            <option value="O+" ${currentPatient.blood_group === 'O+' ? 'selected' : ''}>O+</option>
                            <option value="O-" ${currentPatient.blood_group === 'O-' ? 'selected' : ''}>O-</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Height (cm)</label>
                        <input type="number" name="height" value="${currentPatient.height || ''}" step="0.01" placeholder="e.g., 170">
                    </div>
                    <div class="form-group">
                        <label>Weight (kg)</label>
                        <input type="number" name="weight" value="${currentPatient.weight || ''}" step="0.01" placeholder="e.g., 65">
                    </div>
                    <div class="form-group full-width">
                        <label>Address</label>
                        <textarea name="address" rows="2" placeholder="Your address">${currentPatient.address || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Emergency Contact Name</label>
                        <input type="text" name="emergencyContactName" value="${currentPatient.emergency_contact_name || ''}" placeholder="Contact person name">
                    </div>
                    <div class="form-group">
                        <label>Emergency Contact Phone</label>
                        <input type="tel" name="emergencyContactPhone" value="${currentPatient.emergency_contact_phone || ''}" placeholder="+91-XXXXXXXXXX">
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closeEditProfile()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('editProfileForm').addEventListener('submit', handleProfileUpdate);
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updateData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup') || null,
        height: formData.get('height') || null,
        weight: formData.get('weight') || null,
        address: formData.get('address') || null,
        emergencyContactName: formData.get('emergencyContactName') || null,
        emergencyContactPhone: formData.get('emergencyContactPhone') || null
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/patients/${currentPatient.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to update profile');
        }
        
        showNotification('Profile updated successfully!', 'success');
        
        // Reload patient data
        await loadPatientData();
        
        // Close modal
        closeEditProfile();
        
    } catch (error) {
        console.error('Update error:', error);
        showNotification(error.message || 'Error updating profile', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Close edit profile modal
function closeEditProfile() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.remove();
    }
}

// Update the updateProfileSection function to show N/A properly
function updateProfileSection() {
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        profileCard.querySelector('h2').textContent = `${currentPatient.first_name} ${currentPatient.last_name}`;
        profileCard.querySelector('p').textContent = `Patient ID: ${currentPatient.patient_id}`;
    }
    
    // Update profile details with N/A for empty fields
    const detailItems = {
        'Full Name': `${currentPatient.first_name} ${currentPatient.last_name}`,
        'Date of Birth': currentPatient.date_of_birth ? formatDate(currentPatient.date_of_birth) : 'N/A',
        'Age': currentPatient.age ? `${currentPatient.age} Years` : 'N/A',
        'Blood Group': currentPatient.blood_group || 'N/A',
        'Email': currentPatient.email || 'N/A',
        'Phone': currentPatient.phone || 'N/A',
        'Height': currentPatient.height ? `${currentPatient.height} cm` : 'N/A',
        'Weight': currentPatient.weight ? `${currentPatient.weight} kg` : 'N/A'
    };
    
    document.querySelectorAll('.detail-item').forEach(item => {
        const label = item.querySelector('label').textContent;
        const valueEl = item.querySelector('p');
        if (detailItems[label]) {
            valueEl.textContent = detailItems[label];
            
            // Add visual indicator for N/A fields
            if (detailItems[label] === 'N/A') {
                valueEl.style.color = '#a0aec0';
                valueEl.style.fontStyle = 'italic';
            } else {
                valueEl.style.color = '#1a202c';
                valueEl.style.fontStyle = 'normal';
            }
        }
    });
    
    // Update emergency contact with N/A
    const emergencyItems = document.querySelectorAll('.detail-grid')[1]?.querySelectorAll('.detail-item');
    if (emergencyItems && emergencyItems.length >= 3) {
        const emergencyData = [
            currentPatient.emergency_contact_name || 'N/A',
            'N/A', // Relationship - not in database
            currentPatient.emergency_contact_phone || 'N/A'
        ];
        
        emergencyItems.forEach((item, index) => {
            const valueEl = item.querySelector('p');
            if (valueEl && emergencyData[index]) {
                valueEl.textContent = emergencyData[index];
                if (emergencyData[index] === 'N/A') {
                    valueEl.style.color = '#a0aec0';
                    valueEl.style.fontStyle = 'italic';
                } else {
                    valueEl.style.color = '#1a202c';
                    valueEl.style.fontStyle = 'normal';
                }
            }
        });
    }
}

// Make sure this is called after loading patient data