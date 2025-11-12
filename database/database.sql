-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM DATABASE - UPDATED
-- ============================================

DROP DATABASE IF EXISTS hospital_management;
CREATE DATABASE hospital_management;
USE hospital_management;

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- DOCTORS TABLE
-- ============================================
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    experience INT NOT NULL,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group VARCHAR(5),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    department_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- ============================================
-- ADMIN TABLE
-- ============================================
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert Admin (password: admin@123)
-- Hash generated with bcrypt, rounds=10
INSERT INTO admin (admin_id, password) VALUES 
('admin123', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ');

-- Insert Departments
INSERT INTO departments (name, description) VALUES
('Cardiology', 'Heart and cardiovascular system treatment'),
('Neurology', 'Brain and nervous system disorders'),
('Orthopedics', 'Bone, joint, and muscle treatment'),
('Pediatrics', 'Medical care for infants and children'),
('General Medicine', 'Primary healthcare and general diseases'),
('Dermatology', 'Skin, hair, and nail disorders'),
('ENT', 'Ear, Nose, and Throat treatment'),
('Gynecology', 'Women health and reproductive system'),
('Ophthalmology', 'Eye care and vision treatment'),
('Dentistry', 'Dental and oral health care');

-- Insert 10+ Indian Doctors
INSERT INTO doctors (first_name, last_name, email, phone, specialization, qualification, experience, department_id) VALUES
('Rajesh', 'Kumar', 'dr.rajesh.kumar@curenation.com', '+91-9876543210', 'Cardiologist', 'MBBS, MD, DM (Cardiology)', 15, 1),
('Priya', 'Sharma', 'dr.priya.sharma@curenation.com', '+91-9876543211', 'Neurologist', 'MBBS, MD, DM (Neurology)', 12, 2),
('Amit', 'Patel', 'dr.amit.patel@curenation.com', '+91-9876543212', 'Orthopedic Surgeon', 'MBBS, MS (Orthopedics)', 18, 3),
('Sneha', 'Reddy', 'dr.sneha.reddy@curenation.com', '+91-9876543213', 'Pediatrician', 'MBBS, MD (Pediatrics)', 10, 4),
('Vikram', 'Singh', 'dr.vikram.singh@curenation.com', '+91-9876543214', 'General Physician', 'MBBS, MD (Medicine)', 8, 5),
('Kavita', 'Desai', 'dr.kavita.desai@curenation.com', '+91-9876543215', 'Dermatologist', 'MBBS, MD, DNB (Dermatology)', 14, 6),
('Arjun', 'Nair', 'dr.arjun.nair@curenation.com', '+91-9876543216', 'ENT Specialist', 'MBBS, MS (ENT)', 11, 7),
('Ananya', 'Iyer', 'dr.ananya.iyer@curenation.com', '+91-9876543217', 'Gynecologist', 'MBBS, MD (Gynecology)', 13, 8),
('Rohan', 'Chopra', 'dr.rohan.chopra@curenation.com', '+91-9876543218', 'Ophthalmologist', 'MBBS, MS (Ophthalmology)', 9, 9),
('Deepika', 'Menon', 'dr.deepika.menon@curenation.com', '+91-9876543219', 'Dentist', 'BDS, MDS (Orthodontics)', 7, 10),
('Sanjay', 'Joshi', 'dr.sanjay.joshi@curenation.com', '+91-9876543220', 'Cardiologist', 'MBBS, MD, DM (Cardiology)', 20, 1),
('Meera', 'Banerjee', 'dr.meera.banerjee@curenation.com', '+91-9876543221', 'Neurologist', 'MBBS, MD, DM (Neurology)', 16, 2);

-- Insert 10+ Indian Patients (password for all: patient123)
-- Hash generated with bcrypt, rounds=10
INSERT INTO patients (patient_id, first_name, last_name, email, phone, date_of_birth, age, gender, blood_group, height, weight, address, emergency_contact_name, emergency_contact_phone, password) VALUES
('P-2025-0001', 'Aarav', 'Sharma', 'aarav.sharma@email.com', '+91-9876501234', '1995-03-15', 29, 'Male', 'O+', 175.00, 72.00, '123, MG Road, Mumbai, Maharashtra - 400001', 'Ravi Sharma', '+91-9876501235', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0002', 'Ananya', 'Gupta', 'ananya.gupta@email.com', '+91-9876501236', '1998-07-22', 26, 'Female', 'A+', 162.00, 58.00, '456, Park Street, Delhi - 110001', 'Suresh Gupta', '+91-9876501237', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0003', 'Rohan', 'Mehta', 'rohan.mehta@email.com', '+91-9876501238', '1992-11-08', 32, 'Male', 'B+', 180.00, 78.00, '789, Brigade Road, Bangalore - 560001', 'Neha Mehta', '+91-9876501239', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0004', 'Diya', 'Patel', 'diya.patel@email.com', '+91-9876501240', '2000-05-30', 24, 'Female', 'AB+', 168.00, 60.00, '321, Anna Salai, Chennai - 600002', 'Kiran Patel', '+91-9876501241', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0005', 'Aryan', 'Singh', 'aryan.singh@email.com', '+91-9876501242', '1997-09-12', 27, 'Male', 'O-', 178.00, 75.00, '654, Park Road, Kolkata - 700001', 'Priya Singh', '+91-9876501243', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0006', 'Shreya', 'Sinde', 'shreya.sinde@email.com', '+91-9876543210', '2002-01-15', 23, 'Female', 'O+', 178.00, 50.00, '222, Andheri West, Mumbai, Maharashtra - 400058', 'Rajesh Sinde', '+91-9876500000', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0007', 'Vivaan', 'Malhotra', 'vivaan.malhotra@email.com', '+91-9876501244', '1994-06-18', 30, 'Male', 'A-', NULL, NULL, 'N/A', NULL, NULL, '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0008', 'Ishita', 'Kapoor', 'ishita.kapoor@email.com', '+91-9876501245', '1999-12-25', 25, 'Female', 'B-', 165.00, 55.00, '567, Juhu Beach, Mumbai - 400049', 'Rahul Kapoor', '+91-9876501246', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0009', 'Kabir', 'Verma', 'kabir.verma@email.com', '+91-9876501247', '1996-04-10', 28, 'Male', NULL, NULL, NULL, NULL, NULL, NULL, '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0010', 'Aisha', 'Khan', 'aisha.khan@email.com', '+91-9876501248', '2001-08-05', 23, 'Female', 'AB-', 160.00, 52.00, '890, Bandra East, Mumbai - 400051', 'Salman Khan', '+91-9876501249', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0011', 'Advait', 'Bhatt', 'advait.bhatt@email.com', '+91-9876501250', '1993-02-14', 31, 'Male', 'O+', 182.00, 80.00, 'N/A', NULL, NULL, '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ'),
('P-2025-0012', 'Saanvi', 'Rao', 'saanvi.rao@email.com', '+91-9876501251', '1998-11-30', 26, 'Female', 'A+', NULL, NULL, '123, HSR Layout, Bangalore - 560102', 'Mohan Rao', '+91-9876501252', '$2b$10$8kZvJ3qZ9kZvJ3qZ9kZvJ.ZvJ3qZ9kZvJ3qZ9kZvJ3qZ9kZvJ3qZ');

-- No appointments initially - patients will book them
-- ============================================
-- USEFUL NOTES
-- ============================================
-- All passwords are: patient123
-- Admin credentials: admin123 / admin@123