// backend/fix-passwords.js - Run this once to fix all passwords in database
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPasswords() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306
        });

        console.log('✓ Connected to database');
        console.log('='.repeat(60));
        
        // Generate proper hash for 'patient123'
        const patientPassword = 'patient123';
        const patientHash = await bcrypt.hash(patientPassword, 10);
        
        console.log('\n📝 Generated password hash for patient123');
        console.log('Hash:', patientHash.substring(0, 30) + '...');
        
        // Get all patients with dummy or old hash
        const [patientsToUpdate] = await connection.execute(
            `SELECT id, email, first_name, last_name, password 
             FROM patients`
        );
        
        console.log(`\n👥 Found ${patientsToUpdate.length} patients in database:`);
        
        let updatedCount = 0;
        
        for (const patient of patientsToUpdate) {
            // Check if password needs updating
            let needsUpdate = false;
            
            try {
                // Try to validate with bcrypt - if it fails, it needs updating
                const isValid = await bcrypt.compare(patientPassword, patient.password);
                if (!isValid) {
                    needsUpdate = true;
                }
            } catch (err) {
                // If bcrypt comparison fails, definitely needs updating
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                // Update this patient's password
                await connection.execute(
                    'UPDATE patients SET password = ? WHERE id = ?',
                    [patientHash, patient.id]
                );
                console.log(`  ✓ Updated: ${patient.first_name} ${patient.last_name} (${patient.email})`);
                updatedCount++;
            } else {
                console.log(`  → Skipped: ${patient.first_name} ${patient.last_name} (${patient.email}) - already correct`);
            }
        }
        
        // Fix admin password
        console.log('\n🔐 Updating admin password...');
        const adminPassword = 'admin@123';
        const adminHash = await bcrypt.hash(adminPassword, 10);
        
        const [adminResult] = await connection.execute(
            'UPDATE admin SET password = ? WHERE admin_id = ?',
            [adminHash, 'admin123']
        );
        
        if (adminResult.affectedRows > 0) {
            console.log('  ✓ Admin password updated');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ PASSWORD FIX COMPLETED!');
        console.log('='.repeat(60));
        console.log(`\n📊 Summary:`);
        console.log(`  • Total patients: ${patientsToUpdate.length}`);
        console.log(`  • Passwords updated: ${updatedCount}`);
        console.log(`  • Admin password: Updated`);
        
        console.log('\n🔑 Login Credentials:');
        console.log('='.repeat(60));
        console.log('Admin Login:');
        console.log('  • Admin ID: admin123');
        console.log('  • Password: admin@123');
        console.log('\nPatient Login (All patients):');
        console.log('  • Email: [any patient email from database]');
        console.log('  • Password: patient123');
        console.log('\nExample Patient:');
        console.log('  • Email: shreya.sinde@email.com');
        console.log('  • Password: patient123');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Error fixing passwords:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check your .env file has correct database credentials');
        console.error('2. Ensure MySQL server is running');
        console.error('3. Verify database "hospital_management" exists');
        console.error('4. Check if you have proper database permissions');
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✓ Database connection closed');
        }
    }
}

// Run the fix
console.log('\n🏥 HOSPITAL MANAGEMENT SYSTEM');
console.log('🔧 Password Fix Script');
console.log('='.repeat(60));
fixPasswords();