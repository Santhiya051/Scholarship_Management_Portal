// Test script to verify student scholarships API
const axios = require('axios');

async function testStudentScholarshipsAPI() {
  try {
    console.log('🧪 Testing Student Scholarships API...\n');
    
    // Step 1: Login as student
    console.log('1. Logging in as student...');
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'student1@student.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.tokens.access_token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful');
    console.log('👤 User:', user.first_name, user.last_name);
    console.log('🎓 Role:', user.role.name);
    console.log('');
    
    // Step 2: Fetch scholarships as student
    console.log('2. Fetching scholarships as student...');
    const scholarshipsResponse = await axios.get('http://localhost:3001/api/v1/scholarships', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        limit: 50,
        status: 'active'
      }
    });
    
    console.log('✅ Scholarships fetched successfully');
    console.log('📊 Response structure:', Object.keys(scholarshipsResponse.data));
    console.log('📊 Data structure:', Object.keys(scholarshipsResponse.data.data));
    console.log('📊 Total scholarships:', scholarshipsResponse.data.data.scholarships.length);
    console.log('📄 Pagination:', scholarshipsResponse.data.data.pagination);
    
    // Display scholarships
    console.log('\n📋 Scholarships visible to student:');
    scholarshipsResponse.data.data.scholarships.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name}`);
      console.log(`   Amount: $${s.amount}`);
      console.log(`   Status: ${s.status}`);
      console.log(`   Department: ${s.department}`);
      console.log(`   Deadline: ${s.application_deadline}`);
      console.log('');
    });
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testStudentScholarshipsAPI();
