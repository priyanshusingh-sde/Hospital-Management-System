// Admin credentials (in production, this should be handled securely on backend)
const ADMIN_CREDENTIALS = {
    id: 'admin123',
    password: 'admin@123'
};

// Toggle password visibility
function toggleAdminPassword() {
    const input = document.getElementById('adminPassword');
    const icon = document.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '👁‍🗨';
    } else {
        input.type = 'password';
        icon.textContent = '👁';
    }
}

// Handle admin login
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const adminId = document.getElementById('adminId').value.trim();
    const password = document.getElementById('adminPassword').value;
    const remember = document.getElementById('rememberAdmin').checked;
    
    // Validate inputs
    if (!adminId || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check credentials
    if (adminId === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
        // Store admin session
        const adminData = {
            id: adminId,
            loginTime: new Date().toISOString(),
            role: 'admin'
        };
        
        sessionStorage.setItem('adminSession', JSON.stringify(adminData));
        
        if (remember) {
            localStorage.setItem('adminRemember', 'true');
        }
        
        showNotification('Login successful! Redirecting to admin dashboard...', 'success');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin_dashboard.html';
        }, 1500);
    } else {
        showNotification('Invalid admin ID or password', 'error');
        
        // Clear password field
        document.getElementById('adminPassword').value = '';
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', function() {
    const adminSession = sessionStorage.getItem('adminSession');
    
    if (adminSession) {
        const session = JSON.parse(adminSession);
        if (session.role === 'admin') {
            window.location.href = 'admin_dashboard.html';
        }
    }
    
    // Auto-focus on admin ID field
    document.getElementById('adminId').focus();
});