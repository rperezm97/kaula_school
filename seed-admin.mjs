import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const ADMIN_EMAIL = 'feralawareness@gmail.com';
const ADMIN_PASSWORD = 'FERAL97';

async function seedAdmin() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [ADMIN_EMAIL]
    );
    
    if (existing.length > 0) {
      console.log('✓ Admin user already exists');
      return;
    }
    
    // Insert admin user
    await connection.execute(
      `INSERT INTO users (email, passwordHash, name, role, openId, loginMethod, createdAt, updatedAt, lastSignedIn)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [ADMIN_EMAIL, passwordHash, 'Admin', 'admin', 'admin-' + Date.now(), 'email']
    );
    
    console.log('✓ Admin user created successfully');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedAdmin();
