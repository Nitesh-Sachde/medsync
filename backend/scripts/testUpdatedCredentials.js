const axios = require('axios');

async function testUpdatedCredentials() {
  try {
    const baseURL = 'http://localhost:5000/api/auth/login';
    
    console.log('Testing updated login credentials...\n');

    // Test 1: Super admin with correct credentials
    console.log('=== Test 1: Super Admin (superadmin@medsync.in / abc123) ===');
    try {
      const response1 = await axios.post(baseURL, {
        email: 'superadmin@medsync.in',
        password: 'abc123'
      });
      console.log('✅ Super admin login successful');
      console.log('User:', response1.data.user);
    } catch (error) {
      console.log('❌ Super admin login failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Doctor priyasharma1@medsync.in
    console.log('\n=== Test 2: Doctor (priyasharma1@medsync.in / doctor123) ===');
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

    // Test 3: Another doctor to verify multiple work
    console.log('\n=== Test 3: Another Doctor (rajeshkumar1@medsync.in / doctor123) ===');
    try {
      const response3 = await axios.post(baseURL, {
        email: 'rajeshkumar1@medsync.in',
        password: 'doctor123'
      });
      console.log('✅ Another doctor login successful');
      console.log('User:', response3.data.user);
    } catch (error) {
      console.log('❌ Another doctor login failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Patient
    console.log('\n=== Test 4: Patient (rameshkumar1@gmail.com / patient123) ===');
    try {
      const response4 = await axios.post(baseURL, {
        email: 'rameshkumar1@gmail.com',
        password: 'patient123'
      });
      console.log('✅ Patient login successful');
      console.log('User:', response4.data.user);
    } catch (error) {
      console.log('❌ Patient login failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('Error setting up tests:', error.message);
  }
}

testUpdatedCredentials();
