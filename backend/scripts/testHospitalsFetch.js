const axios = require('axios');

async function testHospitalsFetch() {
  try {
    // First login as super admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'superadmin@medsync.in',
      password: 'abc123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Super admin login successful');
    
    // Fetch hospitals with admin data
    const hospitalResponse = await axios.get('http://localhost:5000/api/superadmin/hospitals', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('\n🏥 Hospitals with Admins:');
    hospitalResponse.data.hospitals.forEach((hospital, index) => {
      console.log(`\n${index + 1}. ${hospital.name}`);
      console.log(`   Address: ${hospital.address || 'N/A'}`);
      console.log(`   Contact: ${hospital.contact || 'N/A'}`);
      console.log(`   Admins: ${hospital.admins ? hospital.admins.length : 0}`);
      
      if (hospital.admins && hospital.admins.length > 0) {
        hospital.admins.forEach((admin, adminIndex) => {
          console.log(`     ${adminIndex + 1}. ${admin.name} (${admin.email})`);
        });
      } else {
        console.log('     ❌ No admins found');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testHospitalsFetch();
