const https = require('https');
const http = require('http');

function testAPI(url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing MedSync AI Backend...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await testAPI('http://localhost:5000/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data)}\n`);

    // Test auth endpoint (should fail without credentials)
    console.log('2. Testing auth requirement...');
    const authResponse = await testAPI('http://localhost:5000/api/ai-chat/suggestions');
    console.log(`   Status: ${authResponse.status} (expected 401 - unauthorized)`);
    console.log(`   Response: ${JSON.stringify(authResponse.data)}\n`);

    console.log('✅ Basic API tests completed!');
    console.log('💡 To test AI chat functionality, you need to:');
    console.log('   1. Add your GEMINI_API_KEY to .env file');
    console.log('   2. Register/login to get authentication token');
    console.log('   3. Use the frontend to test the full AI chat flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 5000');
  }
}

runTests();
