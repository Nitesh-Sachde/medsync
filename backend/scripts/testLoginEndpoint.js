const axios = require('axios');

async function testLoginEndpoint() {
  try {
    const baseURL = 'http://localhost:5000/api/auth/login';
    
    console.log('Testing login endpoint...\n');

    // Test 1: Super admin (this should work according to previous tests)
    console.log('=== Test 1: Super Admin ===');
    try {
      const response1 = await axios.post(baseURL, {
        email: 'superadmin@medsync.in',
        password: 'password123'
      });
      console.log('✅ Super admin login successful');
      console.log('User:', response1.data.user);
    } catch (error) {
      console.log('❌ Super admin login failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Doctor (according to debug, this should work)
    console.log('\n=== Test 2: Doctor ===');
    try {
      const response2 = await axios.post(baseURL, {
        email: 'priyasharma1@medsync.in',
        password: 'doctor123'
      });
      console.log('✅ Doctor login successful');
      console.log('User:', response2.data.user);
    } catch (error) {
      console.log('❌ Doctor login failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Patient
    console.log('\n=== Test 3: Patient ===');
    try {
      const response3 = await axios.post(baseURL, {
        email: 'rameshkumar1@gmail.com',
        password: 'patient123'
      });
      console.log('✅ Patient login successful');
      console.log('User:', response3.data.user);
    } catch (error) {
      console.log('❌ Patient login failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('Error setting up tests:', error.message);
  }
}

testLoginEndpoint();
