
    // DNA Animation
    const canvas = document.getElementById('dnaCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class DNAStrand {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.speed = Math.random() * 2 + 1;
            this.size = Math.random() * 3 + 2;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = Math.random() * 0.05 - 0.025;
        }

        update() {
            this.y += this.speed;
            this.angle += this.spinSpeed;
            this.x += Math.sin(this.angle) * 0.5;

            if (this.y > canvas.height + 20) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(102, 126, 234, ${this.opacity})`;
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 20; i++) {
                const y = i * 2;
                const x = Math.sin(i * 0.5) * 5;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            ctx.beginPath();
            for (let i = 0; i < 20; i++) {
                const y = i * 2;
                const x = -Math.sin(i * 0.5) * 5;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            ctx.strokeStyle = `rgba(118, 75, 162, ${this.opacity})`;
            for (let i = 0; i < 20; i += 4) {
                const y = i * 2;
                const x1 = Math.sin(i * 0.5) * 5;
                const x2 = -Math.sin(i * 0.5) * 5;
                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    const strands = [];
    for (let i = 0; i < 30; i++) {
        strands.push(new DNAStrand());
    }

    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;
    let mouseTimeout;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    });

    function animateDNA() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (isMouseMoving) {
            strands.forEach(strand => {
                strand.update();
                strand.draw();
            });
        }
        
        requestAnimationFrame(animateDNA);
    }

    animateDNA();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Hero Slider
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlide = n;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    setInterval(() => {
        currentSlide++;
        showSlide(currentSlide);
    }, 5000);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // Login Modal
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close');
    const patientLoginOption = document.getElementById('patientLoginOption');
    const adminLoginOption = document.getElementById('adminLoginOption');

    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeModal.addEventListener('click', () => {
        loginModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    patientLoginOption.addEventListener('click', () => {
        showNotification('Redirecting to Patient Login...', 'success');
        setTimeout(() => {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }, 1500);
    });

    adminLoginOption.addEventListener('click', () => {
        showNotification('Redirecting to Admin Login...', 'success');
        setTimeout(() => {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }, 1500);
    });

    // Book Appointment Button
    const bookAppointmentBtn = document.querySelector('.btn-book-appointment');
    bookAppointmentBtn.addEventListener('click', () => {
        showNotification('Opening appointment booking form...', 'success');
    });

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        contactForm.reset();
    });

    // Notification System
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideInRight 0.5s ease;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.centre-card, .service-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Add ripple effect
    document.querySelectorAll('button, .btn-search, .btn-submit, .btn-book-appointment').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    console.log('CURE NATION Healthcare System Loaded Successfully! 🏥');

    // ============================================
// APPOINTMENT BOOKING FROM HOMEPAGE
// ============================================

const API_URL = 'http://localhost:3000/api';

// Open appointment modal
function openAppointmentModal() {
    document.getElementById('quickAppointmentModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    loadDepartmentsForQuickBook();
    setMinDate();
}

// Close appointment modal
function closeAppointmentModal() {
    document.getElementById('quickAppointmentModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('quickAppointmentForm').reset();
    document.getElementById('appointmentSuccess').style.display = 'none';
    document.getElementById('quickAppointmentForm').style.display = 'block';
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quickDate').min = today;
}

// Load departments for quick booking
async function loadDepartmentsForQuickBook() {
    try {
        const response = await fetch(`${API_URL}/departments`);
        const result = await response.json();
        
        if (result.success) {
            const select = document.getElementById('quickDepartment');
            select.innerHTML = '<option value="">Select Department *</option>';
            
            result.data.forEach(dept => {
                select.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        showNotification('Error loading departments', 'error');
    }
}

// Load doctors when department is selected
document.addEventListener('DOMContentLoaded', function() {
    const deptSelect = document.getElementById('quickDepartment');
    if (deptSelect) {
        deptSelect.addEventListener('change', async function() {
            const doctorSelect = document.getElementById('quickDoctor');
            
            if (!this.value) {
                doctorSelect.innerHTML = '<option value="">First select a department</option>';
                doctorSelect.disabled = true;
                return;
            }
            
            doctorSelect.disabled = false;
            doctorSelect.innerHTML = '<option value="">Loading...</option>';
            
            try {
                const response = await fetch(`${API_URL}/doctors/department/${this.value}`);
                const result = await response.json();
                
                if (result.success) {
                    doctorSelect.innerHTML = '<option value="">Select Doctor *</option>';
                    
                    if (result.data.length === 0) {
                        doctorSelect.innerHTML = '<option value="">No doctors available</option>';
                    } else {
                        result.data.forEach(doc => {
                            doctorSelect.innerHTML += `<option value="${doc.id}">Dr. ${doc.first_name} ${doc.last_name} - ${doc.specialization}</option>`;
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading doctors:', error);
                doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
            }
        });
    }
});

// ============================================
// FIXED HOMEPAGE APPOINTMENT BOOKING
// Replace the appointment handling section in script.js
// ============================================

// Handle quick appointment form submission - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quickAppointmentForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('quickName').value.trim();
            const email = document.getElementById('quickEmail').value.trim();
            const phone = document.getElementById('quickPhone').value.trim();
            const department = document.getElementById('quickDepartment').value;
            const doctor = document.getElementById('quickDoctor').value;
            const date = document.getElementById('quickDate').value;
            const time = document.getElementById('quickTime').value;
            const reason = document.getElementById('quickReason').value.trim();
            
            // Validate
            if (!name || !email || !phone || !department || !doctor || !date || !time || !reason) {
                showNotification('Please fill all required fields', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Validate phone format (basic)
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(phone)) {
                showNotification('Please enter a valid phone number', 'error');
                return;
            }
            
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            try {
                // Step 1: Check if patient exists by email
                const checkResponse = await fetch(`${API_URL}/patients`);
                const patientsResult = await checkResponse.json();
                
                let patientId = null;
                let patientCreated = false;
                
                if (patientsResult.success) {
                    const existingPatient = patientsResult.data.find(p => p.email.toLowerCase() === email.toLowerCase());
                    
                    if (existingPatient) {
                        // Patient exists - use their ID
                        patientId = existingPatient.id;
                        console.log('Existing patient found:', patientId);
                    } else {
                        // Create new patient with MINIMAL data
                        const nameParts = name.split(' ');
                        const firstName = nameParts[0];
                        const lastName = nameParts.slice(1).join(' ') || firstName;
                        
                        // Register patient first (this will create proper account)
                        const registerResponse = await fetch(`${API_URL}/auth/patient/register`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                phone: phone,
                                dateOfBirth: '1990-01-01', // Default - patient can update later
                                gender: 'Other', // Default - patient can update later
                                password: 'patient123' // Default password
                            })
                        });
                        
                        const registerResult = await registerResponse.json();
                        
                        if (!registerResult.success) {
                            throw new Error(registerResult.message || 'Failed to register patient');
                        }
                        
                        console.log('New patient registered:', registerResult.data);
                        
                        // Get the newly created patient's ID
                        const newPatientResponse = await fetch(`${API_URL}/patients`);
                        const newPatientsResult = await newPatientResponse.json();
                        
                        if (newPatientsResult.success) {
                            const newPatient = newPatientsResult.data.find(p => p.email.toLowerCase() === email.toLowerCase());
                            if (newPatient) {
                                patientId = newPatient.id;
                                patientCreated = true;
                                console.log('New patient ID:', patientId);
                            }
                        }
                        
                        if (!patientId) {
                            throw new Error('Failed to retrieve patient information');
                        }
                    }
                }
                
                if (!patientId) {
                    throw new Error('Failed to process patient information');
                }
                
                // Step 2: Create appointment
                const appointmentData = {
                    patientId: patientId,
                    doctorId: parseInt(doctor),
                    departmentId: parseInt(department),
                    appointmentDate: date,
                    appointmentTime: time,
                    reason: reason
                };
                
                console.log('Creating appointment:', appointmentData);
                
                const appointmentResponse = await fetch(`${API_URL}/appointments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(appointmentData)
                });
                
                const appointmentResult = await appointmentResponse.json();
                
                if (!appointmentResult.success) {
                    throw new Error(appointmentResult.message || 'Failed to book appointment');
                }
                
                console.log('Appointment created:', appointmentResult.data);
                
                // Success - show login info
                document.getElementById('quickAppointmentForm').style.display = 'none';
                document.getElementById('appointmentSuccess').style.display = 'block';
                document.getElementById('loginEmail').textContent = `Email: ${email}`;
                
                let successMessage = 'Appointment request submitted successfully!';
                if (patientCreated) {
                    successMessage += ' A patient account has been created for you.';
                }
                
                showNotification(successMessage, 'success');
                
            } catch (error) {
                console.error('Appointment error:', error);
                showNotification(error.message || 'Error submitting appointment. Please try again.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Update existing book appointment button
    const bookBtn = document.querySelector('.btn-book-appointment');
    if (bookBtn && !bookBtn.onclick) {
        bookBtn.addEventListener('click', openAppointmentModal);
    }
});

// ============================================
// PATIENT REGISTRATION ENDPOINT FIX
// Make sure backend auth.js has proper validation
// ============================================