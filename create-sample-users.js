const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const sampleUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    fullName: 'John Doe'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    fullName: 'Jane Smith'
  },
  {
    username: 'bob_wilson',
    email: 'bob@example.com',
    password: 'password123',
    fullName: 'Bob Wilson'
  },
  {
    username: 'alice_johnson',
    email: 'alice@example.com',
    password: 'password123',
    fullName: 'Alice Johnson'
  },
  {
    username: 'mike_brown',
    email: 'mike@example.com',
    password: 'password123',
    fullName: 'Mike Brown'
  }
];

async function createSampleUsers() {
  console.log('\n🚀 Creating Sample Users...\n');
  
  for (const user of sampleUsers) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, user);
      console.log(`✅ Created: ${user.fullName} (@${user.username})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}\n`);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log(`⚠️  Already exists: ${user.fullName} (@${user.username})\n`);
      } else {
        console.log(`❌ Failed: ${user.fullName} - ${error.response?.data?.message || error.message}\n`);
      }
    }
  }
  
  console.log('\n========================================');
  console.log('📊 SAMPLE USERS CREATED!');
  console.log('========================================\n');
  console.log('Login credentials (all users have same password):');
  console.log('Password: password123\n');
  console.log('Users:');
  sampleUsers.forEach(user => {
    console.log(`  - ${user.email} (@${user.username})`);
  });
  console.log('\n========================================\n');
}

createSampleUsers().catch(console.error);
