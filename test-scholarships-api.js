// Test script to verify scholarships API
const axios = require('axios');

async function testScholarshipsAPI() {
  try {
    console.log('🧪 Testing Scholarships API...\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@scholarportal.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.tokens.access_token;
    console.log('✅ Login successful\n');
    
    // Step 2: Fetch scholarships
    console.log('2. Fetching scholarships...');
    const scholarshipsResponse = await axios.get('http://localhost:3001/api/v1/scholarships', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        limit: 30
      }
    });
    
    console.log('✅ Scholarships fetched successfully');
    console.log(`📊 Total scholarships: ${scholarshipsResponse.data.data.scholarships.length}`);
    console.log(`📄 Pagination:`, scholarshipsResponse.data.data.pagination);
    
    // Display first 5 scholarships
    console.log('\n📋 First 5 Scholarships:');
    scholarshipsResponse.data.data.scholarships.slice(0, 5).forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} - $${s.amount} - Status: ${s.status}`);
    });
    
    // Step 3: Test admin scholarships endpoint
    console.log('\n3. Fetching admin scholarships...');
    const adminScholarshipsResponse = await axios.get('http://localhost:3001/api/v1/admin/scholarships', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        limit: 30
      }
    });
    
    console.log('✅ Admin scholarships fetched successfully');
    console.log(`📊 Total admin scholarships: ${adminScholarshipsResponse.data.data.length}`);
    
    // Display first 5 admin scholarships
    console.log('\n📋 First 5 Admin Scholarships:');
    adminScholarshipsResponse.data.data.slice(0, 5).forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} - $${s.amount} - Status: ${s.status}`);
    });
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testScholarshipsAPI();
