// frontend/patient_login.js - FIXED VERSION WITH BACKEND INTEGRATION

// API Configuration - CHANGE THIS TO YOUR BACKEND URL
const API_URL = 'http://localhost:3000/api';

// Toggle between login and signup forms
function toggleToSignup(event) {
    if (event) event.preventDefault();
    const container = document.getElementById('container');
    container.classList.add('right-panel-active');
}

function toggleToLogin(event) {
    if (event) event.preventDefault();
    const container = document.getElementById('container');
    container.classList.remove('right-panel-active');
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '👁️‍🗨';
    } else {
        input.type = 'password';
        icon.textContent = '👁';
    }
}

// Handle login form submission - FIXED WITH BACKEND API
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value.trim();
    const password = this.querySelector('input[type="password"]').value;
    const remember = document.getElementById('remember').checked;
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        // CRITICAL: Call backend API for authentication
        const response = await fetch(`${API_URL}/auth/patient/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Login failed');
        }
        
        // Store patient session
        const patientData = {
            ...result.data,
            loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('patientSession', JSON.stringify(patientData));
        
        if (remember) {
            localStorage.setItem('patientRemember', 'true');
            localStorage.setItem('patientEmail', email);
        }
        
        showNotification('Login successful! Redirecting to dashboard...', 'success');
        
        // Redirect to patient dashboard
        setTimeout(() => {
            window.location.href = 'patient_dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Handle signup form submission - FIXED WITH BACKEND API
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const inputs = this.querySelectorAll('input[type="text"]');
    const firstName = inputs[0].value.trim();
    const lastName = inputs[1].value.trim();
    const email = this.querySelector('input[type="email"]').value.trim();
    const password = this.querySelector('input[type="password"]').value;
    const terms = document.getElementById('terms').checked;
    
    // Validate inputs
    if (!firstName || !lastName || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (!terms) {
        showNotification('Please agree to the Terms & Conditions', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    try {
        // Call backend API for registration
        const response = await fetch(`${API_URL}/auth/patient/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                phone: '0000000000', // Default phone, can be updated later
                dateOfBirth: '2000-01-01', // Default DOB, can be updated later
                gender: 'Other', // Default gender, can be updated later
                password
            })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Registration failed');
        }
        
        showNotification('Account created successfully! Please login.', 'success');
        
        setTimeout(() => {
            toggleToLogin();
            // Pre-fill email in login form
            document.querySelector('.sign-in-container input[type="email"]').value = email;
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Password validation - UPDATED to match backend (8 characters minimum)
function validatePassword(password) {
    return password.length >= 8;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease-out',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px'
    };
    
    Object.assign(notification.style, styles);
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#667eea',
        warning: '#f59e0b'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Social login handlers
document.querySelectorAll('.google-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Google login will be integrated with OAuth', 'info');
    });
});

document.querySelectorAll('.apple-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Apple login will be integrated with Sign in with Apple', 'info');
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hospital Management System - Patient Portal Initialized');
    console.log('API URL:', API_URL);
    
    // Check if already logged in
    const patientSession = sessionStorage.getItem('patientSession');
    if (patientSession) {
        console.log('User already logged in, redirecting...');
        window.location.href = 'patient_dashboard.html';
        return;
    }
    
    // Auto-fill email if remembered
    const rememberedEmail = localStorage.getItem('patientEmail');
    if (rememberedEmail && localStorage.getItem('patientRemember') === 'true') {
        document.querySelector('.sign-in-container input[type="email"]').value = rememberedEmail;
        document.getElementById('remember').checked = true;
        document.getElementById('loginPassword').focus();
    } else {
        // Auto-focus on first input
        const firstInput = document.querySelector('.sign-in-container input[type="email"]');
        if (firstInput) {
            firstInput.focus();
        }
    }
});